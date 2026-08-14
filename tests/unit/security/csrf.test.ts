import { describe, expect, it } from "vitest";
import { isSameOriginRequest, requiresCsrfCheck } from "@/server/security/csrf";

describe("requiresCsrfCheck", () => {
  it("requires a check for mutating methods", () => {
    expect(requiresCsrfCheck("POST")).toBe(true);
    expect(requiresCsrfCheck("PUT")).toBe(true);
    expect(requiresCsrfCheck("PATCH")).toBe(true);
    expect(requiresCsrfCheck("DELETE")).toBe(true);
  });

  it("does not require a check for safe methods", () => {
    expect(requiresCsrfCheck("GET")).toBe(false);
    expect(requiresCsrfCheck("HEAD")).toBe(false);
    expect(requiresCsrfCheck("OPTIONS")).toBe(false);
  });

  it("is case-insensitive on method name", () => {
    expect(requiresCsrfCheck("post")).toBe(true);
    expect(requiresCsrfCheck("get")).toBe(false);
  });
});

describe("isSameOriginRequest", () => {
  const expectedOrigin = "https://app.example.com";

  it("always allows safe methods regardless of origin", () => {
    expect(
      isSameOriginRequest({
        method: "GET",
        originHeader: "https://evil.example.com",
        refererHeader: null,
        expectedOrigin,
      }),
    ).toBe(true);
  });

  it("allows a mutating request whose Origin header matches", () => {
    expect(
      isSameOriginRequest({
        method: "POST",
        originHeader: expectedOrigin,
        refererHeader: null,
        expectedOrigin,
      }),
    ).toBe(true);
  });

  it("rejects a mutating request whose Origin header does not match", () => {
    expect(
      isSameOriginRequest({
        method: "POST",
        originHeader: "https://evil.example.com",
        refererHeader: null,
        expectedOrigin,
      }),
    ).toBe(false);
  });

  it("falls back to Referer when Origin is absent", () => {
    expect(
      isSameOriginRequest({
        method: "POST",
        originHeader: null,
        refererHeader: `${expectedOrigin}/some/page`,
        expectedOrigin,
      }),
    ).toBe(true);
  });

  it("rejects a mutating request with neither Origin nor Referer in production", () => {
    const prevNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      expect(
        isSameOriginRequest({
          method: "POST",
          originHeader: null,
          refererHeader: null,
          expectedOrigin,
        }),
      ).toBe(false);
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
    }
  });

  it("allows a mutating request with neither Origin nor Referer in development/testing", () => {
    const prevNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      expect(
        isSameOriginRequest({
          method: "POST",
          originHeader: null,
          refererHeader: null,
          expectedOrigin,
        }),
      ).toBe(true);
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
    }
  });

  it("rejects a malformed Origin header instead of throwing", () => {
    expect(
      isSameOriginRequest({
        method: "POST",
        originHeader: "not-a-url",
        refererHeader: null,
        expectedOrigin,
      }),
    ).toBe(false);
  });

  it("treats a subdomain as a different origin", () => {
    expect(
      isSameOriginRequest({
        method: "POST",
        originHeader: "https://sub.app.example.com",
        refererHeader: null,
        expectedOrigin,
      }),
    ).toBe(false);
  });
});
