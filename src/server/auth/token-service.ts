import { createHash, randomBytes } from "crypto";
import { prisma } from "@/server/db";

function generateToken(): string {
  return randomBytes(48).toString("hex");
}

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

  await prisma.verificationToken.create({
    data: { token: hashed, userId, type, expiresAt },
  });

  return token;
}

export async function consumeVerificationToken(
  token: string,
  type: string,
): Promise<{ userId: string } | null> {
  const hashed = hashToken(token);
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
}
