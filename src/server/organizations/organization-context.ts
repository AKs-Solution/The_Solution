"use server";

import { cookies } from "next/headers";
import { prisma } from "@/server/db";
import { validateSession } from "@/server/auth/session-service";
import { ForbiddenError } from "@/shared/errors";

const ACTIVE_ORG_COOKIE = "consecuencia_org";

export async function getActiveOrganizationId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_ORG_COOKIE)?.value ?? null;
}

export async function setActiveOrganizationId(organizationId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearActiveOrganizationId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function requireActiveOrganization(): Promise<string> {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    throw new ForbiddenError("No active organization selected");
  }

  const session = await validateSession();
  if (!session) {
    throw new ForbiddenError("Not authenticated");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: session.userId,
      },
    },
  });

  if (!membership || membership.status !== "active") {
    await clearActiveOrganizationId();
    throw new ForbiddenError("Access to this organization denied");
  }

  return orgId;
}

export async function resolveActiveOrganization(): Promise<{
  id: string;
  name: string;
  slug: string;
} | null> {
  const orgId = await getActiveOrganizationId();
  if (!orgId) return null;

  const session = await validateSession();
  if (!session) return null;

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
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
