import { getCurrentUser } from "@/server/auth";
import type { CurrentUserResult } from "@/server/auth";

const DEFAULT_ADMIN_EMAILS = ["ak.consecuencia@gmail.com"];

export function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return DEFAULT_ADMIN_EMAILS;
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export class AdminAccessError extends Error {
  readonly status: 401 | 403;

  constructor(status: 401 | 403) {
    super(status === 401 ? "Unauthorized" : "Forbidden");
    this.name = "AdminAccessError";
    this.status = status;
  }
}

export async function requireAdmin(): Promise<CurrentUserResult> {
  const user = await getCurrentUser();
  if (!user || user.guest) throw new AdminAccessError(401);
  if (!adminEmails().includes(user.email.toLowerCase())) throw new AdminAccessError(403);
  return user;
}
