import { describe, expect, it } from "vitest";
import { isSafeInternalPath, safeInternalPath } from "@/shared/security/safe-internal-path";

describe("isSafeInternalPath", () => {
  it("accepts same-origin relative paths including invite tokens", () => {
    expect(isSafeInternalPath("/dashboard")).toBe(true);
    expect(isSafeInternalPath("/invite?token=abc")).toBe(true);
  });

  it("rejects protocol-relative, backslash, and absolute URL gadgets", () => {
    expect(isSafeInternalPath("//evil.example")).toBe(false);
    expect(isSafeInternalPath("/\\evil.example")).toBe(false);
    expect(isSafeInternalPath("https://evil.example")).toBe(false);
    expect(isSafeInternalPath("/%2F%2Fevil.example")).toBe(false);
    expect(isSafeInternalPath("/login")).toBe(true);
  });

  it("falls back for /login and unsafe next values", () => {
    expect(safeInternalPath("/login")).toBe("/dashboard");
    expect(safeInternalPath("//evil.example")).toBe("/dashboard");
    expect(safeInternalPath("/explore")).toBe("/explore");
  });
});
