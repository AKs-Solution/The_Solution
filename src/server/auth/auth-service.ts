/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";
import { hashPassword, verifyPassword } from "./password-service";
import { createSession, destroySession, validateSession } from "./session-service";

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
  userAgent?: string;
  ipAddress?: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface AuthUserResult {
  id: string;
  email: string;
  name: string | null;
}

export async function registerUser(
  input: RegisterInput,
  opts?: { userAgent?: string; ipAddress?: string },
): Promise<{ user: AuthUserResult }> {
  const userAgent = input.userAgent || opts?.userAgent;
  const ipAddress = input.ipAddress || opts?.ipAddress;

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("An account with this email already exists");
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

  await createSession(user.id, { userAgent, ipAddress });

  await (prisma as any).authEvent?.create({
    data: {
      userId: user.id,
      action: "auth.register",
      metadata: { email: user.email },
      ipAddress,
      userAgent,
    },
  }).catch(() => null);

  return { user: { id: user.id, email: user.email, name: user.name } };
}

export async function loginUser(
  input: LoginInput,
  opts?: { userAgent?: string; ipAddress?: string },
): Promise<{ user: AuthUserResult }> {
  const { email, password, rememberMe } = input;
  const ipAddress = input.ipAddress || opts?.ipAddress;
  const userAgent = input.userAgent || opts?.userAgent;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.status !== "active") {
    throw new Error("Account is disabled");
  }

  const isValid = user.passwordHash ? verifyPassword(password, user.passwordHash) : false;
  if (!isValid) {
    await (prisma as any).authEvent?.create({
      data: {
        userId: user.id,
        action: "auth.login.failed",
        metadata: { email },
        ipAddress,
        userAgent,
      },
    }).catch(() => null);
    throw new Error("Invalid email or password");
  }

  await createSession(user.id, { rememberMe, userAgent, ipAddress });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  }).catch(() => null);

  await (prisma as any).authEvent?.create({
    data: {
      userId: user.id,
      action: "auth.login.success",
      metadata: { email },
      ipAddress,
      userAgent,
    },
  }).catch(() => null);

  return { user: { id: user.id, email: user.email, name: user.name } };
}

export async function logoutUser(): Promise<void> {
  const payload = await validateSession();
  if (payload) {
    await (prisma as any).authEvent?.create({
      data: { userId: payload.userId, action: "auth.logout" },
    }).catch(() => null);
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

export async function requestPasswordReset(email: string, _ipAddress?: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await (prisma as any).passwordResetToken?.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  }).catch(() => null);
}

export async function resetPassword(input: ResetPasswordInput | string, newPassword?: string): Promise<void> {
  const token = typeof input === "string" ? input : input.token;
  const password = typeof input === "string" ? (newPassword || "") : input.password;

  const resetToken = await (prisma as any).passwordResetToken?.findUnique({
    where: { token },
    include: { user: true },
  }).catch(() => null);

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new Error("Invalid or expired reset token");
  }

  const passwordHash = hashPassword(password);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  }).catch(() => null);

  await (prisma as any).passwordResetToken?.delete({ where: { id: resetToken.id } }).catch(() => null);
  await prisma.session.deleteMany({ where: { userId: resetToken.userId } }).catch(() => null);
}
