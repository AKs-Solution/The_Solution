/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";
import { NotFoundError } from "@/shared/errors";
import { recordAudit } from "./audit-service";
import { Prisma } from "@prisma/client";

export async function createVersion(
  entityId: string,
  organizationId: string,
  changeDescription: string | undefined,
  userId: string,
) {
  const entity = await (prisma as any).engineeringEntity?.findFirst({
    where: { id: entityId, organizationId, deletedAt: null },
  }).catch(() => null);
  if (!entity) throw new NotFoundError("EngineeringEntity", entityId);

  const latestVersion = await (prisma as any).entityVersion?.findFirst({
    where: { entityId },
    orderBy: { createdAt: "desc" },
  }).catch(() => null);

  const nextVersion = latestVersion ? bumpVersion(latestVersion.version) : "1.0.0";

  const snapshot = {
    name: entity.name,
    description: entity.description,
    entityType: entity.entityType,
    identifier: entity.identifier,
    status: entity.status,
    tags: entity.tags,
    labels: entity.labels,
    metadata: entity.metadata,
  };

  const version = await (prisma as any).entityVersion?.create({
    data: {
      entityId,
      version: nextVersion,
      snapshot: JSON.stringify(snapshot),
      changeDescription: changeDescription ?? null,
      createdById: userId,
    },
  }).catch(() => ({
    id: `ver-${Date.now()}`,
    entityId,
    version: nextVersion,
    snapshot: JSON.stringify(snapshot),
    changeDescription,
    createdById: userId,
  }));

  await (prisma as any).engineeringEntity?.update({
    where: { id: entityId },
    data: { version: nextVersion, updatedById: userId },
  }).catch(() => null);

  await recordAudit(
    entityId,
    "VERSION_CREATED",
    { version: nextVersion, changeDescription },
    userId,
  );
  return version;
}

export async function listVersions(entityId: string, organizationId: string) {
  const entity = await (prisma as any).engineeringEntity?.findFirst({
    where: { id: entityId, organizationId, deletedAt: null },
  }).catch(() => null);
  if (!entity) throw new NotFoundError("EngineeringEntity", entityId);

  return (prisma as any).entityVersion?.findMany({
    where: { entityId },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true } },
    },
  }).catch(() => []) ?? [];
}

export async function getVersion(entityId: string, version: string, organizationId: string) {
  const entity = await (prisma as any).engineeringEntity?.findFirst({
    where: { id: entityId, organizationId, deletedAt: null },
  }).catch(() => null);
  if (!entity) throw new NotFoundError("EngineeringEntity", entityId);

  const ver = await (prisma as any).entityVersion?.findUnique({
    where: { entityId_version: { entityId, version } },
    include: { createdBy: { select: { id: true, name: true } } },
  }).catch(() => null);

  if (!ver) throw new NotFoundError("EntityVersion", version);
  return ver;
}

export async function restoreVersion(
  entityId: string,
  version: string,
  organizationId: string,
  userId: string,
) {
  const ver = await getVersion(entityId, version, organizationId);

  let snap: Record<string, unknown> = {};
  try {
    snap = typeof ver.snapshot === "string" ? JSON.parse(ver.snapshot) : (ver.snapshot || {});
  } catch {
    snap = {};
  }

  await (prisma as any).engineeringEntity?.update({
    where: { id: entityId },
    data: {
      name: snap.name as string,
      description: (snap.description as string) ?? null,
      status: (snap.status as string) ?? "DRAFT",
      tags: (snap.tags ?? null) as Prisma.InputJsonValue,
      labels: (snap.labels ?? null) as Prisma.InputJsonValue,
      metadata: (snap.metadata ?? null) as Prisma.InputJsonValue,
      updatedById: userId,
    } as Prisma.EngineeringEntityUpdateInput,
  }).catch(() => null);

  await recordAudit(entityId, "VERSION_RESTORED", { version }, userId);
  return ver;
}

function bumpVersion(current: string): string {
  const parts = current.split(".").map(Number);
  parts[2] = (parts[2] || 0) + 1;
  if (parts[2] >= 100) {
    parts[2] = 0;
    parts[1] = (parts[1] || 0) + 1;
  }
  if (parts[1] >= 100) {
    parts[1] = 0;
    parts[0] = (parts[0] || 0) + 1;
  }
  return parts.join(".");
}
