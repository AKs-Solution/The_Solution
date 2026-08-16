import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "consecuencia_session";
export const GUEST_USER_ID = "guest";
export const PUBLIC_ORGANIZATION_ID = "public";

export interface AuthJwtPayload {
  userId: string;
  organizationId: string;
  guest?: boolean;
}

function getSecretKey(): Uint8Array {
  const raw =
    process.env.JWT_SECRET ||
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "dev-consecuencia-jwt-secret");
  if (!raw) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(raw);
}

export async function signAuthToken(payload: AuthJwtPayload, expiresIn: string): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    organizationId: payload.organizationId,
    guest: payload.guest === true,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function verifyAuthToken(token: string): Promise<AuthJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const guest = payload.guest === true;
    if (guest) {
      return {
        userId: GUEST_USER_ID,
        organizationId: PUBLIC_ORGANIZATION_ID,
        guest: true,
      };
    }
    const userId =
      typeof payload.userId === "string"
        ? payload.userId
        : typeof payload.sub === "string"
          ? payload.sub
          : "";
    const organizationId = typeof payload.organizationId === "string" ? payload.organizationId : "";
    if (!userId || !organizationId) return null;
    return { userId, organizationId, guest: false };
  } catch {
    return null;
  }
}

export function isGuestPayload(payload: AuthJwtPayload | null | undefined): boolean {
  return payload?.guest === true;
}
