import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildContentSecurityPolicy } from "@/server/security/csp";
import { isSameOriginRequest } from "@/server/security/csrf";
import { logger } from "@/shared/logging";
import { COOKIE_NAME, verifyAuthToken } from "@/server/auth/jwt";
import { isSafeInternalPath } from "@/shared/security/safe-internal-path";

const REQUEST_ID_HEADER = "x-request-id";

const publicPathPrefixes = [
  "/api/auth/guest",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/logout",
  "/api/health",
  "/api/contact",
  "/api/support",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/invite",
  "/api/invitations/preview",
  "/demo",
  "/contact",
  "/pricing",
  "/use-cases",
  "/vs",
  "/og-image.png",
  "/robots.txt",
  "/sitemap.xml",
  "/_next/",
  "/favicon.ico",
];

const publicPageExactPaths = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/invite",
  "/demo",
  "/contact",
  "/pricing",
]);

const adminConsole =
  process.env.NEXT_PUBLIC_ADMIN_CONSOLE === "1" || process.env.NEXT_PUBLIC_ADMIN_CONSOLE === "true";

function isAdminPath(pathname: string): boolean {
  return pathname === "/ops" || pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

const adminConsolePathPrefixes = [
  "/api/admin/",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/guest",
  "/api/health",
  "/_next/",
];

const adminConsolePagePaths = new Set([
  "/ops",
  "/login",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
]);

function notFoundResponse(requestId: string, isProd: boolean): NextResponse {
  const response = NextResponse.json(
    { error: "Not found", code: "NOT_FOUND" },
    { status: 404, headers: { [REQUEST_ID_HEADER]: requestId } },
  );
  applySecurityHeaders(response, isProd);
  return response;
}

function applySecurityHeaders(response: NextResponse, isProd: boolean): void {
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy(isProd));
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

function isPublicPath(pathname: string): boolean {
  if (publicPageExactPaths.has(pathname)) return true;
  return publicPathPrefixes.some((path) => pathname === path || pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProd = process.env.NODE_ENV === "production";

  const requestId = request.headers.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  const proto =
    request.headers.get("x-forwarded-proto") ??
    (request.nextUrl.protocol ? request.nextUrl.protocol.replace(":", "") : "http");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const expectedOrigin = `${proto}://${host}`;

  if (adminConsole) {
    if (pathname === "/" || pathname === "/dashboard") {
      const response = NextResponse.redirect(new URL("/ops", request.url));
      applySecurityHeaders(response, isProd);
      return response;
    }
    const allowedInConsole =
      adminConsolePagePaths.has(pathname) ||
      adminConsolePathPrefixes.some((prefix) => pathname.startsWith(prefix));
    if (!allowedInConsole) {
      return notFoundResponse(requestId, isProd);
    }
  } else if (isAdminPath(pathname)) {
    return notFoundResponse(requestId, isProd);
  }

  if (
    pathname.startsWith("/api/") &&
    !isSameOriginRequest({
      method: request.method,
      originHeader: request.headers.get("origin"),
      refererHeader: request.headers.get("referer"),
      expectedOrigin,
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
    applySecurityHeaders(response, isProd);
    return response;
  }

  if (isPublicPath(pathname)) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set(REQUEST_ID_HEADER, requestId);
    applySecurityHeaders(response, isProd);
    return response;
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAuthToken(token) : null;

  if (!payload) {
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json(
        { error: "Not authenticated", code: "UNAUTHORIZED" },
        { status: 401, headers: { [REQUEST_ID_HEADER]: requestId } },
      );
      applySecurityHeaders(response, isProd);
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    const nextPath = `${pathname}${request.nextUrl.search}`;
    if (isSafeInternalPath(nextPath) && nextPath !== "/login") {
      loginUrl.searchParams.set("next", nextPath);
    }
    const response = NextResponse.redirect(loginUrl);
    applySecurityHeaders(response, isProd);
    return response;
  }

  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-organization-id", payload.organizationId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  applySecurityHeaders(response, isProd);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
