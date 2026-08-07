/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { logger } from "@/shared/logging";
import { buildEvidenceGraph } from "@/server/evidence/evidence-graph";
import { detectContradictions } from "./detection-engine";
import { contradictionFilterSchema, validateLifecycleTransition } from "./validation";
import type { ContradictionSummary } from "./types";
import type { ContradictionStatus, ContradictionLifecycleAction } from "./constants";
import { Prisma } from "@prisma/client";

export async function detectAndStoreContradictions(
  organizationId: string,
  entityId: string,
  maxDepth: number,
  userId?: string,
) {
  const graph = await buildEvidenceGraph(organizationId, entityId, maxDepth);
  const result = detectContradictions(graph, organizationId);

  for (const contradiction of result.contradictions) {
    const existing = await (prisma as any).contradiction?.findFirst({
      where: {
        organizationId,
        id: contradiction.id,
      },
    }).catch(() => null);

    if (existing) continue;

    await (prisma as any).contradiction?.create({
      data: {
        id: contradiction.id,
        organizationId,
        type: contradiction.type,
        severity: contradiction.severity,
        status: "DETECTED",
        label: contradiction.label,
        description: contradiction.description,
        sourceEntityIds: contradiction.sourceEntityIds as Prisma.InputJsonValue,
        sourceDocumentIds: contradiction.sourceDocumentIds as Prisma.InputJsonValue,
        supportingEvidence: contradiction.supportingEvidence as unknown as Prisma.InputJsonValue,
        conflictingEvidence: contradiction.conflictingEvidence as unknown as Prisma.InputJsonValue,
        traceabilityChain: contradiction.traceabilityChain as unknown as Prisma.InputJsonValue,
        affectedEntities: contradiction.affectedEntities as unknown as Prisma.InputJsonValue,
        detectedById: userId,
        detectedAt: new Date(contradiction.detectedAt),
      },
    }).catch(() => null);

    await (prisma as any).contradictionLifecycleLog?.create({
      data: {
        contradictionId: contradiction.id,
        action: "DETECTED",
        fromStatus: null,
        toStatus: "DETECTED",
        performedById: userId,
      },
    }).catch(() => null);
  }

  logger.info("Contradictions detected", {
    entityId,
    total: result.totalDetected,
    insufficient: result.insufficientEvidenceCount,
  });

  return result;
}

export async function listContradictions(organizationId: string, filters: Record<string, string>) {
  const parsed = contradictionFilterSchema.safeParse(filters);
  if (!parsed.success) throw new ValidationError(parsed.error.flatten().fieldErrors);
  const { type, severity, status, entityId, search, sort, order, page, pageSize } = parsed.data;

  const where: any = { organizationId };

  if (type) where.type = type;
  if (severity) where.severity = severity;
  if (status) where.status = status;
  if (entityId) {
    where.sourceEntityIds = { array_contains: entityId };
  }
  if (search) {
    where.OR = [
      { label: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: any = sort
    ? { [sort]: order ?? "desc" }
    : { detectedAt: "desc" };

  const [data, total] = await Promise.all([
    (prisma as any).contradiction?.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      include: {
        lifecycleLogs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    }).catch(() => []) ?? [],
    (prisma as any).contradiction?.count({ where }).catch(() => 0) ?? 0,
  ]);

  return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getContradiction(id: string, organizationId: string) {
  const contradiction = await (prisma as any).contradiction?.findFirst({
    where: { id, organizationId },
    include: {
      lifecycleLogs: {
        orderBy: { createdAt: "desc" },
      },
      detectedBy: { select: { id: true, name: true, email: true } },
      resolvedBy: { select: { id: true, name: true, email: true } },
    },
  }).catch(() => null);

  if (!contradiction) throw new NotFoundError("Contradiction", id);
  return contradiction;
}

export async function updateContradictionStatus(
  id: string,
  organizationId: string,
  newStatus: ContradictionStatus,
  userId: string,
  resolutionNotes?: string,
) {
  const contradiction = await (prisma as any).contradiction?.findFirst({
    where: { id, organizationId },
  }).catch(() => null);

  if (!contradiction) throw new NotFoundError("Contradiction", id);

  const error = validateLifecycleTransition(contradiction.status, newStatus);
  if (error) throw new ValidationError({ status: [error] });

  const actionMap: Record<string, ContradictionLifecycleAction> = {
    UNDER_REVIEW: "REVIEW_STARTED",
    ACCEPTED: "ACCEPTED",
    REJECTED: "REJECTED",
    RESOLVED: "RESOLVED",
    ARCHIVED: "ARCHIVED",
    DETECTED: "REOPENED",
  };

  const updated = await (prisma as any).contradiction?.update({
    where: { id },
    data: {
      status: newStatus,
      resolutionNotes: resolutionNotes ?? contradiction.resolutionNotes,
      resolvedById:
        newStatus === "RESOLVED" || newStatus === "ARCHIVED" ? userId : contradiction.resolvedById,
      resolvedAt:
        newStatus === "RESOLVED" || newStatus === "ARCHIVED"
          ? new Date()
          : contradiction.resolvedAt,
    },
  }).catch(() => contradiction);

  await (prisma as any).contradictionLifecycleLog?.create({
    data: {
      contradictionId: id,
      action: actionMap[newStatus] ?? "REVIEW_STARTED",
      fromStatus: contradiction.status,
      toStatus: newStatus,
      metadata: resolutionNotes ? { notes: resolutionNotes } : Prisma.JsonNull,
      performedById: userId,
    },
  }).catch(() => null);

  logger.info("Contradiction status updated", {
    id,
    from: contradiction.status,
    to: newStatus,
  });

  return updated;
}

export async function getContradictionSummary(
  organizationId: string,
): Promise<ContradictionSummary> {
  const contradictions = await (prisma as any).contradiction?.findMany({
    where: { organizationId },
    select: { status: true, severity: true, type: true },
  }).catch(() => []) ?? [];

  const byStatus: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byType: Record<string, number> = {};

  for (const c of contradictions) {
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
    bySeverity[c.severity] = (bySeverity[c.severity] ?? 0) + 1;
    byType[c.type] = (byType[c.type] ?? 0) + 1;
  }

  const criticalCount = (bySeverity["CRITICAL"] ?? 0) + (bySeverity["HIGH"] ?? 0);
  const unresolvedCount = contradictions.filter(
    (c: any) => c.status !== "RESOLVED" && c.status !== "ARCHIVED",
  ).length;

  return {
    total: contradictions.length,
    byStatus,
    bySeverity,
    byType,
    criticalCount,
    unresolvedCount,
  };
}

export async function getContradictionEvidence(id: string, organizationId: string) {
  const contradiction = await (prisma as any).contradiction?.findFirst({
    where: { id, organizationId },
    select: {
      supportingEvidence: true,
      conflictingEvidence: true,
      traceabilityChain: true,
    },
  }).catch(() => null);

  if (!contradiction) throw new NotFoundError("Contradiction", id);
  return contradiction;
}

export async function getContradictionTraceability(id: string, organizationId: string) {
  const contradiction = await (prisma as any).contradiction?.findFirst({
    where: { id, organizationId },
    select: {
      traceabilityChain: true,
      sourceEntityIds: true,
      sourceDocumentIds: true,
    },
  }).catch(() => null);

  if (!contradiction) throw new NotFoundError("Contradiction", id);
  return contradiction;
}
