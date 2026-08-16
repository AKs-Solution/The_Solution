import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  GUEST_USER_ID,
  PUBLIC_ORGANIZATION_ID,
  isGuestPayload,
  signAuthToken,
  verifyAuthToken,
  type AuthJwtPayload,
} from "./jwt";

const SESSION_EXPIRY = "24h";
const REMEMBER_ME_EXPIRY = "30d";
const GUEST_TOKEN_EXPIRY = "12h";

export type SessionPayload = AuthJwtPayload;

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function createSession(
  userId: string,
  organizationId: string,
  opts?: { rememberMe?: boolean },
): Promise<string> {
  const rememberMe = opts?.rememberMe === true;
  const token = await signAuthToken(
    { userId, organizationId },
    rememberMe ? REMEMBER_ME_EXPIRY : SESSION_EXPIRY,
  );
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, cookieOptions(rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24));
  return token;
}

export async function createGuestSession(): Promise<string> {
  const token = await signAuthToken(
    { userId: GUEST_USER_ID, organizationId: PUBLIC_ORGANIZATION_ID, guest: true },
    GUEST_TOKEN_EXPIRY,
  );
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return token;
}

export async function validateSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export function isGuestSession(session: SessionPayload | null | undefined): boolean {
  return isGuestPayload(session);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function destroyAllUserSessions(): Promise<void> {
  await destroySession();
}

export { COOKIE_NAME, GUEST_USER_ID, PUBLIC_ORGANIZATION_ID };
