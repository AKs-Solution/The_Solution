import { prisma } from "@/server/db";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  RateLimitedError,
  UnauthorizedError,
} from "@/shared/errors";
import { hashPassword, verifyPassword } from "./password-service";
import { createSession, destroySession, validateSession } from "./session-service";
import { recordSecurityEvent } from "./security-event-service";
import { loginRateLimiter, passwordResetRateLimiter } from "./rate-limiter";
import type { LoginInput, RegisterInput, ResetPasswordInput } from "./validation";

export interface AuthUserResult {
  id: string;
  email: string;
  name: string | null;
}

export async function registerUser(
  input: RegisterInput,
  opts?: { userAgent?: string; ipAddress?: string },
): Promise<{ user: AuthUserResult }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
      status: "active",
    },
  });

  await createSession(user.id, { userAgent: opts?.userAgent, ipAddress: opts?.ipAddress });

  await prisma.authEvent.create({
    data: {
      userId: user.id,
      action: "auth.register",
      metadata: { email: user.email },
      ipAddress: opts?.ipAddress,
      userAgent: opts?.userAgent,
    },
  });

  return { user: { id: user.id, email: user.email, name: user.name } };
}

export async function loginUser(
  input: LoginInput,
  opts?: { userAgent?: string; ipAddress?: string },
): Promise<{ user: AuthUserResult }> {
  const { email, password, rememberMe } = input;
  const ipAddress = opts?.ipAddress;
  const userAgent = opts?.userAgent;

  const emailKey = `email:${email}`;
  const ipKey = ipAddress ? `ip:${ipAddress}` : null;

  const emailRetryAfter = loginRateLimiter.check(emailKey);
  const ipRetryAfter = ipKey ? loginRateLimiter.check(ipKey) : null;
  const retryAfter =
    emailRetryAfter !== null && ipRetryAfter !== null
      ? Math.max(emailRetryAfter, ipRetryAfter)
      : emailRetryAfter ?? ipRetryAfter;

  if (retryAfter !== null) {
    await recordSecurityEvent("auth.rate_limited", { ipAddress, userAgent, metadata: { email } });
    throw new RateLimitedError("Too many login attempts. Try again later.", retryAfter);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    loginRateLimiter.record(emailKey);
    if (ipKey) loginRateLimiter.record(ipKey);
    throw new UnauthorizedError("Invalid email or password");
  }

  if (user.status !== "active") {
    loginRateLimiter.record(emailKey);
    if (ipKey) loginRateLimiter.record(ipKey);
    throw new UnauthorizedError("Account is disabled");
  }

  const isValid = user.passwordHash ? verifyPassword(password, user.passwordHash) : false;
  if (!isValid) {
    loginRateLimiter.record(emailKey);
    if (ipKey) loginRateLimiter.record(ipKey);
    await prisma.authEvent.create({
      data: {
        userId: user.id,
        action: "auth.login.failed",
        metadata: { email },
        ipAddress,
        userAgent,
      },
    });
    throw new UnauthorizedError("Invalid email or password");
  }

  loginRateLimiter.clear(emailKey);

  await createSession(user.id, { rememberMe, userAgent, ipAddress });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await prisma.authEvent.create({
    data: {
      userId: user.id,
      action: "auth.login.success",
      metadata: { email },
      ipAddress,
      userAgent,
    },
  });

  return { user: { id: user.id, email: user.email, name: user.name } };
}

export async function logoutUser(): Promise<void> {
  const payload = await validateSession();
  if (payload) {
    await prisma.authEvent.create({
      data: { userId: payload.userId, action: "auth.logout" },
    });
  }
  await destroySession();
}

export interface CurrentUserResult {
  id: string;
  email: string;
  name: string | null;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export async function getCurrentUser(): Promise<CurrentUserResult | null> {
  const payload = await validateSession();
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.status !== "active") {
    await destroySession();
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export async function requestPasswordReset(email: string, ipAddress?: string): Promise<void> {
  const emailKey = `email:${email}`;
  const ipKey = ipAddress ? `ip:${ipAddress}` : null;

  const emailRetryAfter = passwordResetRateLimiter.check(emailKey);
  const ipRetryAfter = ipKey ? passwordResetRateLimiter.check(ipKey) : null;
  const retryAfter =
    emailRetryAfter !== null && ipRetryAfter !== null
      ? Math.max(emailRetryAfter, ipRetryAfter)
      : emailRetryAfter ?? ipRetryAfter;

  if (retryAfter !== null) {
    throw new RateLimitedError("Too many password reset requests. Try again later.", retryAfter);
  }

  passwordResetRateLimiter.record(emailKey);
  if (ipKey) passwordResetRateLimiter.record(ipKey);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: input.token },
    include: { user: true },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new BadRequestError("Invalid or expired reset token");
  }

  const passwordHash = hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
    prisma.session.deleteMany({ where: { userId: resetToken.userId } }),
  ]);
}
