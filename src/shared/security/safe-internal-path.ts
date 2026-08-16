const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

/**
 * Same-origin relative paths only. Rejects protocol-relative URLs, backslashes,
 * encoded `://`, and control characters used in open-redirect gadgets.
 */
export function isSafeInternalPath(value: string | null | undefined): value is string {
  if (!value || value.length > 2048) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//") || value.startsWith("/\\")) return false;
  if (value.includes("\\") || value.includes("://")) return false;
  if (CONTROL_CHARS.test(value)) return false;

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || decoded.startsWith("/\\")) return false;
    if (decoded.includes("\\") || decoded.includes("://")) return false;
    if (CONTROL_CHARS.test(decoded)) return false;
  } catch {
    return false;
  }

  return true;
}

export function safeInternalPath(
  value: string | null | undefined,
  fallback: string = "/dashboard",
): string {
  if (isSafeInternalPath(value) && value !== "/login") {
    return value;
  }
  return fallback;
}
