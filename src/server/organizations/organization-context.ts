"use server";

import { prisma } from "@/server/db";
import { createSession, validateSession } from "@/server/auth/session-service";
import { ForbiddenError } from "@/shared/errors";

export async function getActiveOrganizationId(): Promise<string | null> {
  const session = await validateSession();
  return session?.organizationId ?? null;
}

export async function setActiveOrganizationId(organizationId: string): Promise<void> {
  const session = await validateSession();
  if (!session) {
    throw new ForbiddenError("Not authenticated");
  }
  await createSession(session.userId, organizationId);
}

export async function clearActiveOrganizationId(): Promise<void> {
  const session = await validateSession();
  if (!session) return;
  await createSession(session.userId, session.organizationId);
}

export async function requireActiveOrganization(): Promise<string> {
  const session = await validateSession();
  if (!session) {
    throw new ForbiddenError("Not authenticated");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: session.userId,
      },
    },
  });

  if (!membership || membership.status !== "active") {
    throw new ForbiddenError("Access to this organization denied");
  }

  return session.organizationId;
}

export async function resolveActiveOrganization(): Promise<{
  id: string;
  name: string;
  slug: string;
} | null> {
  const session = await validateSession();
  if (!session) return null;

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: session.userId,
      },
    },
    include: {
      organization: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!membership || membership.status !== "active") {
    return null;
  }

  return membership.organization;
}
