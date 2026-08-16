import { timingSafeEqual, scryptSync } from "crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = process.env.NODE_ENV === "test" ? 4 : 12;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

function verifyLegacyScrypt(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const storedHash = Buffer.from(hashHex, "hex");
    const params =
      process.env.NODE_ENV === "test" ? { N: 512, r: 8, p: 1 } : { N: 16384, r: 8, p: 1 };
    const hash = scryptSync(password, salt, storedHash.length, params);
    return timingSafeEqual(hash, storedHash);
  } catch {
    return false;
  }
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
    return bcrypt.compareSync(password, stored);
  }
  if (stored.includes(":")) {
    return verifyLegacyScrypt(password, stored);
  }
  return false;
}
