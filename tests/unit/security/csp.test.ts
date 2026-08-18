import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "@/server/security/csp";

describe("buildContentSecurityPolicy", () => {
  it("uses a static-compatible script-src policy (no nonces)", () => {
    const policy = buildContentSecurityPolicy(true);
    expect(policy).toContain("script-src 'self' 'unsafe-inline'");
    expect(policy).not.toContain("nonce-");
    expect(policy).not.toContain("strict-dynamic");
  });

  it("defaults every fetch directive to 'self'", () => {
    const policy = buildContentSecurityPolicy(true);
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("connect-src 'self'");
    expect(policy).toContain("font-src 'self'");
  });

  it("blocks framing entirely", () => {
    const policy = buildContentSecurityPolicy(true);
    expect(policy).toContain("frame-ancestors 'none'");
  });

  it("disallows plugin/object content", () => {
    const policy = buildContentSecurityPolicy(true);
    expect(policy).toContain("object-src 'none'");
  });

  it("adds upgrade-insecure-requests only in production", () => {
    const prod = buildContentSecurityPolicy(true);
    const dev = buildContentSecurityPolicy(false);
    expect(prod).toContain("upgrade-insecure-requests");
    expect(dev).not.toContain("upgrade-insecure-requests");
  });

  it("allows 'unsafe-eval' only outside production (React dev-mode debugging needs it)", () => {
    const prod = buildContentSecurityPolicy(true);
    const dev = buildContentSecurityPolicy(false);
    expect(prod).not.toContain("unsafe-eval");
    expect(dev).toContain("'unsafe-eval'");
  });
});
