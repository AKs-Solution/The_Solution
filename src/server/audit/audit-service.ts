import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import type { AuditFilterInput } from "./validation";

/**
 * The one place every subsystem writes to the generic, organization-scoped
 * AuditLog table - Rule Engine mutations, Orchestrator run lifecycle events,
 * and anything else that needs an immutable "who did what, when" record.
 * Entries are never updated or deleted by application code.
 */
export async function recordAuditEvent(
  organizationId: string,
  action: string,
  entity: string,
  entityId: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      organizationId,
      action,
      entity,
      entityId,
      metadata: metadata as Prisma.InputJsonValue,
    },
  });
}

export async function listAuditEvents(organizationId: string, filters: AuditFilterInput) {
  const { page, pageSize, action, entity, entityId, from, to, search } = filters;

  const where: Prisma.AuditLogWhereInput = {
    organizationId,
  };

  if (action) where.action = { contains: action, mode: "insensitive" };
  if (entity) where.entity = { equals: entity };
  if (entityId) where.entityId = entityId;
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };
  }
  if (search) {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
      { entity: { contains: search, mode: "insensitive" } },
      { entityId: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        organizationId: true,
        action: true,
        entity: true,
        entityId: true,
        metadata: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function listAuditEventsForExport(
  organizationId: string,
  filters: Omit<AuditFilterInput, "page" | "pageSize">,
  maxRows = 5000,
) {
  const result = await listAuditEvents(organizationId, {
    ...filters,
    page: 1,
    pageSize: maxRows,
  });
  return result.data;
}
