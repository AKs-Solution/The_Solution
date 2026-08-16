import { prisma } from "@/server/db";
import { AppError, UnauthorizedError } from "@/shared/errors";
import { hashPassword, verifyPassword } from "./password-service";
import { createSession, destroySession, validateSession } from "./session-service";
import { createVerificationToken, consumeVerificationToken } from "./token-service";
import { sendPasswordResetEmail } from "@/server/mail";
import { generateUniqueSlug } from "@/server/organizations/slug";

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
  organizationId: string;
  organizationName: string;
}

async function provisionWorkspace(userId: string, displayName: string) {
  const orgName = `${displayName}'s Workspace`;
  const slug = await generateUniqueSlug(prisma, orgName);
  const org = await prisma.organization.create({
    data: {
      name: orgName,
      slug,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "owner",
          status: "active",
          joinedAt: new Date(),
        },
      },
    },
  });
  return org;
}

async function resolveMembershipOrg(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId, status: "active" },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  return membership?.organization ?? null;
}

export async function registerUser(input: RegisterInput): Promise<{ user: AuthUserResult }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError("An account with this email already exists", "EMAIL_TAKEN", 409);
  }

  const passwordHash = hashPassword(input.password);
  const displayName = input.name?.trim() || input.email.split("@")[0] || "User";

  const { user, org } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        name: input.name?.trim() || displayName,
        passwordHash,
        status: "active",
      },
    });

    const slug = await generateUniqueSlug(tx, `${displayName}'s Workspace`);
    const org = await tx.organization.create({
      data: {
        name: `${displayName}'s Workspace`,
        slug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "owner",
            status: "active",
            joinedAt: new Date(),
          },
        },
      },
    });

    await tx.authEvent.create({
      data: {
        userId: user.id,
        action: "auth.register",
        metadata: { email: user.email, organizationId: org.id },
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });

    return { user, org };
  });

  await createSession(user.id, org.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: org.id,
      organizationName: org.name,
    },
  };
}

export async function loginUser(input: LoginInput): Promise<{ user: AuthUserResult }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || user.status !== "active") {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isValid = verifyPassword(input.password, user.passwordHash);
  if (!isValid) {
    await prisma.authEvent.create({
      data: {
        userId: user.id,
        action: "auth.login.failed",
        metadata: { email: input.email },
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
    throw new UnauthorizedError("Invalid email or password");
  }

  let org = await resolveMembershipOrg(user.id);
  if (!org) {
    const displayName = user.name?.trim() || user.email.split("@")[0] || "User";
    org = await provisionWorkspace(user.id, displayName);
  }

  await createSession(user.id, org.id, { rememberMe: input.rememberMe });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await prisma.authEvent.create({
    data: {
      userId: user.id,
      action: "auth.login.success",
      metadata: { email: user.email, organizationId: org.id },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organizationId: org.id,
      organizationName: org.name,
    },
  };
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
  organizationId: string | null;
  organizationName: string | null;
}

export async function getCurrentUser(): Promise<CurrentUserResult | null> {
  const payload = await validateSession();
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.status !== "active") {
    await destroySession();
    return null;
  }

  const org = await prisma.organization.findFirst({
    where: { id: payload.organizationId, deletedAt: null },
    select: { id: true, name: true },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    organizationId: org?.id ?? payload.organizationId,
    organizationName: org?.name ?? null,
  };
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const token = await createVerificationToken(user.id, "password_reset", 1);
  await sendPasswordResetEmail(user.email, token);
}

export async function resetPassword(
  input: ResetPasswordInput | string,
  newPassword?: string,
): Promise<void> {
  const token = typeof input === "string" ? input : input.token;
  const password = typeof input === "string" ? newPassword || "" : input.password;

  const record = await consumeVerificationToken(token, "password_reset");
  if (!record) {
    throw new AppError("Invalid or expired reset token", "INVALID_RESET_TOKEN", 400);
  }

  const passwordHash = hashPassword(password);

  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  await prisma.session.deleteMany({ where: { userId: record.userId } });
}
