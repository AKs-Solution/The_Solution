/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";
import type { TraceabilityGraph, TraceabilityRecord } from "./types";

const RELATED_ENTITY_SELECT = {
  id: true,
  identifier: true,
  name: true,
  entityType: true,
  status: true,
  version: true,
  updatedAt: true,
} as const;

/**
 * Breadth-first traversal batched per depth level - one entity query and one
 * extracted-evidence query per level (covering every node discovered so far),
 * not per node, matching buildEvidenceGraph()'s fan-out fix.
 */
export async function buildTraceabilityGraph(
  organizationId: string,
  rootEntityId: string,
  maxDepth: number,
): Promise<TraceabilityGraph> {
  const records: TraceabilityRecord[] = [];
  const visited = new Set<string>([rootEntityId]);

  let frontier = new Map<string, string[]>([[rootEntityId, []]]);
  let depth = 0;

  while (frontier.size > 0 && depth <= maxDepth) {
    const ids = Array.from(frontier.keys());

    const [entities, docRefsByEntity] = await Promise.all([
      (prisma as any).engineeringEntity?.findMany({
        where: { id: { in: ids }, organizationId, deletedAt: null },
        include: {
          sourceRelationships: { include: { targetEntity: { select: RELATED_ENTITY_SELECT } } },
          targetRelationships: { include: { sourceEntity: { select: RELATED_ENTITY_SELECT } } },
        },
      }).catch(() => []) ?? [],
      (prisma as any).extractedEntity?.findMany({
        where: { organizationId, linkedEntityId: { in: ids } },
        include: { document: { select: { id: true, fileName: true, currentVersion: true } } },
      }).catch(() => []) ?? [],
    ]);

    const docRefsByEntityId = new Map<string, any[]>();
    for (const doc of docRefsByEntity) {
      if (!doc.linkedEntityId) continue;
      const list = docRefsByEntityId.get(doc.linkedEntityId) ?? [];
      list.push(doc);
      docRefsByEntityId.set(doc.linkedEntityId, list);
    }

    const nextFrontier = new Map<string, string[]>();

    for (const entity of entities) {
      const path = frontier.get(entity.id) ?? [];
      const docRefs = docRefsByEntityId.get(entity.id) ?? [];

      if (docRefs.length > 0) {
        for (const doc of docRefs) {
          records.push({
            entityId: entity.id,
            entityName: entity.name,
            entityType: entity.entityType,
            entityIdentifier: entity.identifier,
            entityVersion: entity.version,
            entityStatus: entity.status,
            documentId: doc.document?.id || "",
            documentName: doc.document?.fileName || "Document",
            documentVersion: doc.document?.currentVersion,
            page: doc.page ?? undefined,
            section: doc.section ?? undefined,
            relationshipPath: path,
            extractionMethod: doc.extractionMethod || "ML_EXTRACT",
            organizationId,
            timestamp: entity.updatedAt?.toISOString?.() || new Date().toISOString(),
          });
        }
      } else {
        records.push({
          entityId: entity.id,
          entityName: entity.name,
          entityType: entity.entityType,
          entityIdentifier: entity.identifier,
          entityVersion: entity.version,
          entityStatus: entity.status,
          relationshipPath: path,
          organizationId,
          timestamp: entity.updatedAt?.toISOString?.() || new Date().toISOString(),
        });
      }

      for (const rel of (entity.sourceRelationships || [])) {
        const target = rel.targetEntity;
        if (target && !visited.has(target.id)) {
          visited.add(target.id);
          nextFrontier.set(target.id, [...path, `${rel.relationshipType}->${target.name}`]);
        }
      }

      for (const rel of (entity.targetRelationships || [])) {
        const source = rel.sourceEntity;
        if (source && !visited.has(source.id)) {
          visited.add(source.id);
          nextFrontier.set(source.id, [...path, `${source.name}->${rel.relationshipType}`]);
        }
      }
    }

    frontier = nextFrontier;
    depth += 1;
  }

  return {
    rootEntityId,
    records,
    totalRecords: records.length,
  };
}
