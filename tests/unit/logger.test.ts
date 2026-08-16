import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/shared/logging/logger";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("logger", () => {
  it("actually writes output outside development (not silently discarded)", () => {
    vi.stubEnv("NODE_ENV", "production");
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logger.info("service started", { port: 3000 });

    expect(spy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(spy.mock.calls[0][0] as string);
    expect(payload).toMatchObject({
      level: "info",
      message: "service started",
      context: { port: 3000 },
    });
  });

  it("routes error-level entries to console.error in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    logger.error("something failed");

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("suppresses debug output in production by default (below the info floor)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOG_LEVEL", "");
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logger.debug("verbose detail");

    expect(spy).not.toHaveBeenCalled();
  });

  it("honors an explicit LOG_LEVEL floor in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOG_LEVEL", "warn");
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    logger.info("below the configured floor");
    logger.warn("at the configured floor");

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("always logs everything in development, human-readable, not JSON", () => {
    vi.stubEnv("NODE_ENV", "development");
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logger.debug("dev-only detail");

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("dev-only detail");
    expect(() => JSON.parse(spy.mock.calls[0][0] as string)).toThrow();
  });

  it("redacts tokens from log context", () => {
    vi.stubEnv("NODE_ENV", "production");
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logger.info("invitation created", {
      token: "super-secret",
      inviteUrl: "https://example.com/invite?token=abc",
    });

    const payload = JSON.parse(spy.mock.calls[0][0] as string);
    expect(payload.context.token).toBe("[redacted]");
    expect(payload.context.inviteUrl).toBe("[redacted]");
  });
});
