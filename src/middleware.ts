import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildContentSecurityPolicy, generateNonce } from "@/server/security/csp";
import { isSameOriginRequest } from "@/server/security/csrf";
import { logger } from "@/shared/logging";

const COOKIE_NAME = "consecuencia_session";
const REQUEST_ID_HEADER = "x-request-id";
const NONCE_HEADER = "x-nonce";

const publicPaths = [
  "/api/auth/",
  "/api/copilot/",
  "/api/enterprise/",
  "/api/health",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/_next/",
  "/favicon.ico",
];

const publicPageExactPaths = new Set(["/", "/login", "/register"]);

function applySecurityHeaders(response: NextResponse, nonce: string, isProd: boolean): void {
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy(nonce, isProd));
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (isProd) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProd = process.env.NODE_ENV === "production";

  const requestId = request.headers.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();
  const nonce = generateNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);
  requestHeaders.set(NONCE_HEADER, nonce);

  if (
    pathname.startsWith("/api/") &&
    !isSameOriginRequest({
      method: request.method,
      originHeader: request.headers.get("origin"),
      refererHeader: request.headers.get("referer"),
      expectedOrigin: request.nextUrl.origin,
    })
  ) {
    logger.warn("CSRF check failed: cross-origin mutating request rejected", {
      pathname,
      method: request.method,
      origin: request.headers.get("origin"),
    });
    const response = NextResponse.json(
      { error: "Cross-origin request rejected", code: "CSRF_REJECTED" },
      { status: 403 },
    );
    applySecurityHeaders(response, nonce, isProd);
    return response;
  }

  const isPublic =
    publicPaths.some((path) => pathname.startsWith(path) || pathname === path) ||
    publicPageExactPaths.has(pathname);

  if (isPublic) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set(REQUEST_ID_HEADER, requestId);
    applySecurityHeaders(response, nonce, isProd);
    return response;
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json(
        { error: "Not authenticated", code: "UNAUTHORIZED" },
        { status: 401, headers: { [REQUEST_ID_HEADER]: requestId } },
      );
      applySecurityHeaders(response, nonce, isProd);
      return response;
    }

    // Redirect unauthenticated page requests to login, preserving the intended destination
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    applySecurityHeaders(response, nonce, isProd);
    return response;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  applySecurityHeaders(response, nonce, isProd);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
