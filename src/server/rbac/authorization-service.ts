import { prisma } from "@/server/db";
import { validateSession } from "@/server/auth/session-service";
import { recordSecurityEvent } from "@/server/security";
import { ForbiddenError, NotFoundError } from "@/shared/errors";
import { type PermissionString, DEFAULT_ROLES } from "./permissions";

export interface RoleInfo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
}

function permissionMatches(required: string, granted: string[]): boolean {
  for (const g of granted) {
    if (g === required) return true;
    const [gResource, gAction] = g.split(":");
    const [rResource] = required.split(":");
    if (gResource === rResource && gAction === "*") return true;
    if (gResource === "*" && gAction === "*") return true;
  }
  return false;
}

export async function getMemberPermissions(
  organizationId: string,
  userId: string,
): Promise<string[]> {
  const membership = await prisma.organizationMember
    .findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    })
    .catch(() => null);

  if (!membership || membership.status !== "active") return [];

  const role = DEFAULT_ROLES.find((r) => r.slug === membership.role);
  if (!role) return [];

  return role.permissions;
}

export async function checkPermission(
  organizationId: string,
  userId: string,
  permission: PermissionString,
): Promise<boolean> {
  const permissions = await getMemberPermissions(organizationId, userId);
  return permissionMatches(permission, permissions);
}

export async function requirePermission(
  organizationId: string,
  userId: string,
  permission: PermissionString,
  errorMessage?: string,
): Promise<void> {
  const hasPermission = await checkPermission(organizationId, userId, permission);
  if (!hasPermission) {
    await recordSecurityEvent("rbac.permission_denied", {
      userId,
      metadata: { organizationId, permission },
    });
    throw new ForbiddenError(errorMessage ?? "Insufficient permissions");
  }
}

export async function getOrganizationRoles(organizationId: string): Promise<RoleInfo[]> {
  const session = await validateSession();
  if (!session) throw new ForbiddenError("Not authenticated");

  const membership = await prisma.organizationMember
    .findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: session.userId,
        },
      },
    })
    .catch(() => null);
  if (!membership || membership.status !== "active") {
    throw new NotFoundError("Organization", organizationId);
  }

  const dbRoles =
    (await prisma.role
      .findMany({
        where: { organizationId },
        include: {
          permissions: {
            include: { permission: { select: { id: true, resource: true, action: true } } },
          },
        },
        orderBy: { createdAt: "asc" },
      })
      .catch(() => [])) ?? [];

  const systemRoles = DEFAULT_ROLES.map((r) => ({
    id: r.slug,
    name: r.name,
    slug: r.slug,
    description: r.description,
    isSystem: true,
    permissions: [...r.permissions],
  }));

  const customRoles = dbRoles.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    isSystem: r.isSystem,
    permissions: (r.permissions || []).map(
      (rp) => `${rp.permission.resource}:${rp.permission.action}`,
    ),
  }));

  return [...systemRoles, ...customRoles];
}

export async function changeMemberRole(
  organizationId: string,
  targetUserId: string,
  newRole: string,
): Promise<void> {
  const session = await validateSession();
  if (!session) throw new ForbiddenError("Not authenticated");
  const actorUserId = session.userId;

  const actorMembership = await prisma.organizationMember
    .findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: actorUserId,
        },
      },
    })
    .catch(() => null);

  if (!actorMembership || actorMembership.status !== "active") {
    throw new NotFoundError("Organization", organizationId);
  }
  if (actorMembership.role !== "owner" && actorMembership.role !== "admin") {
    throw new ForbiddenError("Insufficient permissions to change roles");
  }

  const targetMembership = await prisma.organizationMember
    .findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: targetUserId,
        },
      },
    })
    .catch(() => null);

  if (!targetMembership) {
    throw new NotFoundError("Member", targetUserId);
  }

  if (targetMembership.role === "owner" && actorUserId !== targetUserId) {
    throw new ForbiddenError("Cannot change the organization owner's role");
  }

  const validRole = DEFAULT_ROLES.find((r) => r.slug === newRole);
  if (!validRole) {
    throw new Error(`Invalid role: ${newRole}`);
  }

  if (targetUserId === actorUserId && newRole !== "owner") {
    throw new ForbiddenError("Cannot demote yourself. Transfer ownership first.");
  }

  await prisma.organizationMember
    .update({
      where: { id: targetMembership.id },
      data: { role: newRole },
    })
    .catch(() => null);

  await prisma.authEvent
    .create({
      data: {
        userId: actorUserId,
        action: "organization.member.role.changed",
        metadata: { organizationId, targetUserId, previousRole: targetMembership.role, newRole },
      },
    })
    .catch(() => null);
}

export async function hasPermission(
  permissions: string[],
  required: PermissionString,
): Promise<boolean> {
  return permissionMatches(required, permissions);
}
