/**
 * Content-Security-Policy construction, shared by middleware (which sets the
 * response header) and nothing else - this is the one place the policy is
 * defined, so it can never drift between routes.
 *
 * This policy intentionally does NOT use per-request nonces: Next.js only
 * injects nonce attributes into `<script>` tags on dynamically rendered
 * pages. The public landing experience is statically prerendered (for cache
 * friendliness and SEO), so a nonce + `strict-dynamic` policy would block
 * every framework script on those pages and disable all interactivity.
 * Instead we allow same-origin scripts with `'unsafe-inline'`, matching the
 * official Next.js "Without Nonces" guidance for statically-generated apps.
 */

export function buildContentSecurityPolicy(isProd: boolean): string {
  // React's development build uses eval() for debugging features (stack
  // reconstruction, HMR) - "React will never use eval() in production mode"
  // per React's own warning, so 'unsafe-eval' is scoped to non-production
  // only and never weakens the policy actually served to users.
  const scriptSrc = isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  const directives = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (isProd) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}
