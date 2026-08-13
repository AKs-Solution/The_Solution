/**
 * Origin-based CSRF defense: state-changing requests (POST/PUT/PATCH/DELETE)
 * must carry an Origin (or, failing that, a Referer) header that matches
 * this app's own origin. This is the same mitigation strategy Next.js's own
 * Server Actions use.
 */

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function requiresCsrfCheck(method: string): boolean {
  return UNSAFE_METHODS.has(method.toUpperCase());
}

export interface CsrfCheckInput {
  method: string;
  originHeader: string | null;
  refererHeader: string | null;
  expectedOrigin: string;
}

function normalizeLocalhostHost(hostname: string): string {
  if (hostname === "0.0.0.0" || hostname === "127.0.0.1" || hostname === "localhost") {
    return "localhost";
  }
  return hostname;
}

/** Pure function: no I/O, so it's directly unit-testable without a real Request/NextRequest. */
export function isSameOriginRequest(input: CsrfCheckInput): boolean {
  if (!requiresCsrfCheck(input.method)) return true;

  const candidate = input.originHeader ?? input.refererHeader;
  if (!candidate) {
    // If running in development / testing, allow requests without Origin/Referer headers
    if (process.env.NODE_ENV !== "production") return true;
    return false;
  }

  try {
    const candidateUrl = new URL(candidate);
    const expectedUrl = new URL(input.expectedOrigin);

    if (candidateUrl.origin === expectedUrl.origin) return true;

    // Normalize localhost / 127.0.0.1 / 0.0.0.0 for local dev
    const candHost = normalizeLocalhostHost(candidateUrl.hostname);
    const expHost = normalizeLocalhostHost(expectedUrl.hostname);
    if (candHost === "localhost" && expHost === "localhost") {
      const candPort = candidateUrl.port || (candidateUrl.protocol === "https:" ? "443" : "80");
      const expPort = expectedUrl.port || (expectedUrl.protocol === "https:" ? "443" : "80");
      return candPort === expPort;
    }

    // Support host match behind reverse proxies (e.g. Vercel)
    if (candidateUrl.host === expectedUrl.host) return true;

    return false;
  } catch {
    return false;
  }
}
