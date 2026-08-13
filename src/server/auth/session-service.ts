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

// Resilient in-memory session cache for offline database fallback & zero-latency validation
const MEMORY_SESSIONS = new Map<string, { userId: string; sessionId: string; expiresAt: Date }>();

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
  const hashed = hashToken(token);
  const hours = opts?.rememberMe ? REMEMBER_ME_EXPIRY_DAYS * 24 : SESSION_EXPIRY_HOURS;
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  const sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Store in memory cache
  MEMORY_SESSIONS.set(hashed, { userId, sessionId, expiresAt });

  try {
    await prisma.session.create({
      data: {
        token: hashed,
        userId,
        userAgent: opts?.userAgent,
        ipAddress: opts?.ipAddress,
        expiresAt,
      },
    });
  } catch (err) {
    console.warn("[SessionService] DB offline session creation (using memory fallback):", err);
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

  const hashed = hashToken(token);

  // Check memory session first for instant retrieval
  const memSession = MEMORY_SESSIONS.get(hashed);
  if (memSession) {
    if (memSession.expiresAt < new Date()) {
      MEMORY_SESSIONS.delete(hashed);
      return null;
    }
    return { userId: memSession.userId, sessionId: memSession.sessionId };
  }

  try {
    const session = await prisma.session.findUnique({ where: { token: hashed } });
    if (session) {
      if (session.isRevoked) return null;
      if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => null);
        return null;
      }
      MEMORY_SESSIONS.set(hashed, {
        userId: session.userId,
        sessionId: session.id,
        expiresAt: session.expiresAt,
      });
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

  const hashed = hashToken(token);
  const hours = SESSION_EXPIRY_HOURS;
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  const memSession = MEMORY_SESSIONS.get(hashed);
  if (memSession) {
    memSession.expiresAt = expiresAt;
  }

  try {
    const session = await prisma.session.findUnique({ where: { token: hashed } });
    if (!session || session.isRevoked) return;

    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt },
    });
  } catch (err) {
    console.warn("[SessionService] DB offline fallback session renewal:", err);
  }

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const hashed = hashToken(token);
    MEMORY_SESSIONS.delete(hashed);

    try {
      await prisma.session.deleteMany({ where: { token: hashed } });
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
  for (const [key, val] of MEMORY_SESSIONS.entries()) {
    if (val.userId === userId) {
      MEMORY_SESSIONS.delete(key);
    }
  }

  try {
    await prisma.session.deleteMany({ where: { userId } });
  } catch (err) {
    console.warn("[SessionService] DB offline fallback destroy all user sessions:", err);
  }
}

export { COOKIE_NAME };
