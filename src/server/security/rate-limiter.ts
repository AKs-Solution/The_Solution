/**
 * In-process sliding-window rate limiter - a first line of defense against
 * credential stuffing, brute force, and abuse of unauthenticated endpoints.
 * Not a distributed/durable solution: state lives in this process's memory
 * only, resetting on restart and not shared across multiple instances behind
 * a load balancer. A production multi-instance deployment should back this
 * with a shared store (Redis or equivalent) instead - this is deliberately
 * the "preparation" layer, not the final word.
 *
 * `createRateLimiter()` is the one reusable primitive; every named limiter
 * below (login, registration, password reset) is just a differently-tuned
 * instance of it, so the abuse-prevention logic itself is never duplicated.
 */

interface AttemptWindow {
  count: number;
  windowStartedAt: number;
}

export interface RateLimiter {
  /** Returns seconds until the window resets if the key is currently rate-limited, otherwise null. */
  check: (key: string) => number | null;
  record: (key: string) => void;
  clear: (key: string) => void;
}

export interface RateLimiterOptions {
  windowMs: number;
  maxAttempts: number;
  /** Distinguishes this limiter's keys from another limiter's in the shared process-wide store. */
  namespace: string;
}

const globalForRateLimiter = globalThis as unknown as {
  rateLimiterStore?: Map<string, AttemptWindow>;
};

const store = globalForRateLimiter.rateLimiterStore ?? new Map<string, AttemptWindow>();
globalForRateLimiter.rateLimiterStore = store;

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const { windowMs, maxAttempts, namespace } = options;

  function storeKey(key: string): string {
    return `${namespace}:${key}`;
  }

  function currentWindow(key: string): AttemptWindow {
    const fullKey = storeKey(key);
    const existing = store.get(fullKey);
    const now = Date.now();
    if (!existing || now - existing.windowStartedAt > windowMs) {
      const fresh: AttemptWindow = { count: 0, windowStartedAt: now };
      store.set(fullKey, fresh);
      return fresh;
    }
    return existing;
  }

  return {
    check(key: string): number | null {
      const window = currentWindow(key);
      if (window.count >= maxAttempts) {
        return Math.ceil((window.windowStartedAt + windowMs - Date.now()) / 1000);
      }
      return null;
    },
    record(key: string): void {
      currentWindow(key).count += 1;
    },
    clear(key: string): void {
      store.delete(storeKey(key));
    },
  };
}

export const loginRateLimiter = createRateLimiter({
  namespace: "login",
  windowMs: 15 * 60 * 1000,
  maxAttempts: 10,
});

export const registrationRateLimiter = createRateLimiter({
  namespace: "register",
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
});

export const passwordResetRateLimiter = createRateLimiter({
  namespace: "password-reset",
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
});

export const contactInquiryRateLimiter = createRateLimiter({
  namespace: "contact-inquiry",
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
});

export const supportInquiryRateLimiter = createRateLimiter({
  namespace: "support-inquiry",
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
});

export const invitationPreviewRateLimiter = createRateLimiter({
  namespace: "invitation-preview",
  windowMs: 15 * 60 * 1000,
  maxAttempts: 30,
});
