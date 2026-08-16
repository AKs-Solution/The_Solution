import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/server/auth/password-service";

describe("PasswordService", () => {
  it("generates a hash from a password", () => {
    const hash = hashPassword("test-password-123");
    expect(hash).toBeTruthy();
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("verifies correct password", () => {
    const hash = hashPassword("correct-password");
    expect(verifyPassword("correct-password", hash)).toBe(true);
  });

  it("rejects incorrect password", () => {
    const hash = hashPassword("real-password");
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("generates different hashes for same password", () => {
    const hash1 = hashPassword("same-password");
    const hash2 = hashPassword("same-password");
    expect(hash1).not.toBe(hash2);
  });

  it("verifies against any generated hash", () => {
    for (let i = 0; i < 10; i++) {
      const pw = `password-${i}-test`;
      const hash = hashPassword(pw);
      expect(verifyPassword(pw, hash)).toBe(true);
    }
  });
});
