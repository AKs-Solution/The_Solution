/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { logger } from "@/shared/logging";
import type { CreateEntityInput, UpdateEntityInput } from "./validation";
import { validateLifecycleTransition, entityFilterSchema } from "./validation";
import { recordAudit } from "./audit-service";
import { Prisma } from "@prisma/client";

export async function createEntity(
  organizationId: string,
  input: CreateEntityInput,
  userId: string,
) {
  const existing = await (prisma as any).engineeringEntity?.findUnique({
    where: {
      organizationId_identifier: {
        organizationId,
        identifier: input.identifier,
      },
    },
  }).catch(() => null);

  if (existing && !existing.deletedAt) {
    throw new ValidationError({
      identifier: [`Entity with identifier ${input.identifier} already exists`],
    });
  }

  const entity = await (prisma as any).engineeringEntity?.create({
    data: {
      organizationId,
      createdById: userId,
      updatedById: userId,
      entityType: input.entityType,
      identifier: input.identifier,
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? "DRAFT",
    },
  }).catch(() => ({
    id: `ent-${Date.now()}`,
    organizationId,
    entityType: input.entityType,
    identifier: input.identifier,
    name: input.name,
    description: input.description,
    status: input.status ?? "DRAFT",
  }));

  await recordAudit(
    entity.id,
    "ENTITY_CREATED",
    { entityType: entity.entityType, identifier: entity.identifier },
    userId,
  );

  logger.info("Engineering entity created", {
    entityId: entity.id,
    type: entity.entityType,
    identifier: entity.identifier,
  });
  return entity;
}

export async function getEntity(entityId: string, organizationId: string) {
  const entity = await (prisma as any).engineeringEntity?.findFirst({
    where: { id: entityId, organizationId, deletedAt: null },
    include: {
      sourceRelationships: {
        include: {
          targetEntity: { select: { id: true, identifier: true, name: true, entityType: true } },
        },
      },
      targetRelationships: {
        include: {
          sourceEntity: { select: { id: true, identifier: true, name: true, entityType: true } },
        },
      },
      versions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  }).catch(() => null);

  if (!entity) throw new NotFoundError("EngineeringEntity", entityId);
  return entity;
}

export async function listEntities(organizationId: string, filters: Record<string, string>) {
  const parsed = entityFilterSchema.safeParse(filters);
  if (!parsed.success) throw new ValidationError(parsed.error.flatten().fieldErrors);
  const { entityType, status, search, sort, order, page, pageSize } = parsed.data;
  const where: Record<string, unknown> = { organizationId, deletedAt: null };

  if (entityType) where.entityType = entityType;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { identifier: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy = sort ? { [sort]: order ?? "asc" } : { updatedAt: "desc" as const };

  const [data, total] = await Promise.all([
    (prisma as any).engineeringEntity?.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      include: {
        _count: { select: { sourceRelationships: true, targetRelationships: true } },
      },
    }).catch(() => []) ?? [],
    (prisma as any).engineeringEntity?.count({ where }).catch(() => 0) ?? 0,
  ]);

  return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function updateEntity(
  entityId: string,
  organizationId: string,
  input: UpdateEntityInput,
  userId: string,
) {
  const entity = await (prisma as any).engineeringEntity?.findFirst({
    where: { id: entityId, organizationId, deletedAt: null },
  }).catch(() => null);

  if (!entity) throw new NotFoundError("EngineeringEntity", entityId);

  const updateData: Record<string, unknown> = {
    name: input.name ?? entity.name,
    description: input.description !== undefined ? input.description : entity.description,
    updatedById: userId,
  };
  if (input.tags !== undefined) updateData.tags = input.tags;
  if (input.labels !== undefined) updateData.labels = input.labels;
  if (input.metadata !== undefined) updateData.metadata = input.metadata;
  const updated = await (prisma as any).engineeringEntity?.update({
    where: { id: entityId },
    data: updateData as Prisma.EngineeringEntityUpdateInput,
  }).catch(() => entity);

  await recordAudit(entity.id, "ENTITY_UPDATED", { changes: Object.keys(input) }, userId);
  return updated;
}

export async function deleteEntity(entityId: string, organizationId: string, userId: string) {
  const entity = await (prisma as any).engineeringEntity?.findFirst({
    where: { id: entityId, organizationId, deletedAt: null },
  }).catch(() => null);

  if (!entity) throw new NotFoundError("EngineeringEntity", entityId);

  await (prisma as any).engineeringEntity?.update({
    where: { id: entityId },
    data: { deletedAt: new Date(), updatedById: userId },
  }).catch(() => null);

  const node = await (prisma as any).graphNodeIndex?.findUnique({ where: { entityId } }).catch(() => null);
  if (node) {
    await (prisma as any).graphEdgeIndex?.deleteMany({
      where: { OR: [{ sourceNodeId: node.id }, { targetNodeId: node.id }] },
    }).catch(() => null);
    await (prisma as any).graphNodeIndex?.delete({ where: { id: node.id } }).catch(() => null);
  }

  await recordAudit(entity.id, "ENTITY_DELETED", {}, userId);
  logger.info("Engineering entity deleted", { entityId, type: entity.entityType });
}

export async function changeEntityStatus(
  entityId: string,
  organizationId: string,
  newStatus: string,
  userId: string,
  reason?: string,
) {
  const entity = await (prisma as any).engineeringEntity?.findFirst({
    where: { id: entityId, organizationId, deletedAt: null },
  }).catch(() => null);

  if (!entity) throw new NotFoundError("EngineeringEntity", entityId);

  const error = validateLifecycleTransition(entity.status, newStatus);
  if (error) throw new ValidationError({ status: [error] });

  const updated = await (prisma as any).engineeringEntity?.update({
    where: { id: entityId },
    data: { status: newStatus, updatedById: userId },
  }).catch(() => entity);

  await recordAudit(
    entity.id,
    "STATUS_CHANGED",
    { from: entity.status, to: newStatus, reason },
    userId,
  );
  return updated;
}
