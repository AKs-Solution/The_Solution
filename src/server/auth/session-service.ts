import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/server/db";

const COOKIE_NAME = "consecuencia_session";
const SESSION_EXPIRY_HOURS = 24;
const REMEMBER_ME_EXPIRY_DAYS = 30;

interface SessionPayload {
  userId: string;
  sessionId: string;
}

function generateSessionToken(): string {
  return randomBytes(48).toString("hex");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
  opts?: { rememberMe?: boolean; userAgent?: string; ipAddress?: string },
): Promise<string> {
  const token = generateSessionToken();
  const hours = opts?.rememberMe ? REMEMBER_ME_EXPIRY_DAYS * 24 : SESSION_EXPIRY_HOURS;
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  try {
    await prisma.session.create({
      data: {
        token: hashToken(token),
        userId,
        userAgent: opts?.userAgent,
        ipAddress: opts?.ipAddress,
        expiresAt,
      },
    });
  } catch (err) {
    console.warn("[SessionService] DB offline session creation error:", err);
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function validateSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({ where: { token: hashToken(token) } });
    if (session) {
      if (session.isRevoked) return null;
      if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
        return null;
      }
      return { userId: session.userId, sessionId: session.id };
    }
  } catch (err) {
    console.warn("[SessionService] DB error during session validation:", err);
  }

  return null;
}

export async function renewSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return;

  try {
    const session = await prisma.session.findUnique({ where: { token: hashToken(token) } });
    if (!session || session.isRevoked) return;

    const hours = SESSION_EXPIRY_HOURS;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt },
    });

    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  } catch (err) {
    console.warn("[SessionService] DB offline fallback session renewal:", err);
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    try {
      await prisma.session.deleteMany({ where: { token: hashToken(token) } });
    } catch (err) {
      console.warn("[SessionService] DB offline fallback session destroy:", err);
    }
  }

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  try {
    await prisma.session.deleteMany({ where: { userId } });
  } catch (err) {
    console.warn("[SessionService] DB offline fallback destroy all user sessions:", err);
  }
}

export { COOKIE_NAME };
