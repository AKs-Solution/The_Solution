import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { AppError } from "@/shared/errors";
import { requireActiveOrganization } from "@/server/organizations/organization-context";

const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
});

export interface ActivityItem {
  id: string;
  type: "entity_created" | "entity_updated" | "document_uploaded" | "job_completed" | "relationship_created";
  label: string;
  description: string;
  href: string;
  timestamp: string;
  actor?: string;
}

export async function GET(request: Request) {
  try {
    let orgId: string;
    try {
      orgId = await requireActiveOrganization();
    } catch {
      orgId = "default-org";
    }

    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { limit } = parsed.data;
    const perSource = Math.ceil(limit / 3);

    const [recentEntities, recentDocuments, recentJobs, recentRelationships] = await Promise.all([
      prisma.engineeringEntity.findMany({
        where: { organizationId: orgId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: perSource,
        select: {
          id: true,
          name: true,
          entityType: true,
          identifier: true,
          createdAt: true,
          updatedAt: true,
          updatedById: true,
        },
      }),
      prisma.ingestionDocument.findMany({
        where: { organizationId: orgId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: perSource,
        select: {
          id: true,
          fileName: true,
          status: true,
          createdAt: true,
          uploadedBy: { select: { name: true } },
        },
      }),
      prisma.ingestionJob.findMany({
        where: {
          organizationId: orgId,
          status: { in: ["COMPLETED", "FAILED", "SUCCEEDED"] },
        },
        orderBy: { completedAt: "desc" },
        take: perSource,
        select: {
          id: true,
          status: true,
          documentId: true,
          completedAt: true,
          document: { select: { fileName: true } },
        },
      }),
      prisma.engineeringRelationship.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: perSource,
        select: {
          id: true,
          relationshipType: true,
          createdAt: true,
          sourceEntity: { select: { name: true } },
          targetEntity: { select: { name: true } },
        },
      }),
    ]);

    const items: ActivityItem[] = [];

    for (const entity of recentEntities) {
      const isNew = entity.createdAt.getTime() === entity.updatedAt.getTime();
      items.push({
        id: entity.id,
        type: isNew ? "entity_created" : "entity_updated",
        label: entity.name,
        description: `${isNew ? "Created" : "Updated"} entity ${entity.identifier}`,
        href: `/entities/${entity.id}`,
        timestamp: entity.updatedAt.toISOString(),
        actor: entity.updatedById ?? undefined,
      });
    }

    for (const doc of recentDocuments) {
      items.push({
        id: doc.id,
        type: "document_uploaded",
        label: doc.fileName,
        description: `Uploaded document (${doc.status.toLowerCase()})`,
        href: `/ingestion/documents/${doc.id}`,
        timestamp: doc.createdAt.toISOString(),
        actor: doc.uploadedBy?.name ?? undefined,
      });
    }

    for (const job of recentJobs) {
      items.push({
        id: job.id,
        type: "job_completed",
        label: job.document?.fileName ?? "Unknown document",
        description: `Ingestion ${job.status.toLowerCase()}`,
        href: `/ingestion/${job.id}`,
        timestamp: (job.completedAt ?? new Date()).toISOString(),
      });
    }

    for (const rel of recentRelationships) {
      items.push({
        id: rel.id,
        type: "relationship_created",
        label: `${rel.sourceEntity.name} → ${rel.targetEntity.name}`,
        description: `Relationship: ${rel.relationshipType}`,
        href: `/knowledge-graph`,
        timestamp: rel.createdAt.toISOString(),
      });
    }

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ data: items.slice(0, limit) });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
