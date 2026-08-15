import { createHash, randomBytes } from "crypto";
import { prisma } from "@/server/db";

const MEMORY_TOKENS = new Map<
  string,
  { userId: string; type: string; expiresAt: Date; usedAt: Date | null }
>();

function generateToken(): string {
  return randomBytes(48).toString("hex");
}

/** Same rationale as session-service's hashToken: only the hash is ever persisted. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createVerificationToken(
  userId: string,
  type: string,
  expiresInHours: number = 1,
): Promise<string> {
  const token = generateToken();
  const hashed = hashToken(token);
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  // Store in memory cache
  MEMORY_TOKENS.set(hashed, { userId, type, expiresAt, usedAt: null });

  try {
    await prisma.verificationToken.create({
      data: { token: hashed, userId, type, expiresAt },
    });
  } catch (err) {
    console.warn("[TokenService] DB offline fallback verification token creation:", err);
  }

  return token;
}

export async function consumeVerificationToken(
  token: string,
  type: string,
): Promise<{ userId: string } | null> {
  const hashed = hashToken(token);

  // Check memory cache
  const mem = MEMORY_TOKENS.get(hashed);
  if (mem) {
    if (mem.type !== type) return null;
    if (mem.usedAt) return null;
    if (mem.expiresAt < new Date()) {
      MEMORY_TOKENS.delete(hashed);
      return null;
    }
    mem.usedAt = new Date();
    return { userId: mem.userId };
  }

  try {
    const record = await prisma.verificationToken.findUnique({ where: { token: hashed } });
    if (!record) return null;
    if (record.type !== type) return null;
    if (record.usedAt) return null;
    if (record.expiresAt < new Date()) return null;

    await prisma.verificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return { userId: record.userId };
  } catch (err) {
    console.warn("[TokenService] DB error during verification token consumption:", err);
  }

  return null;
}
