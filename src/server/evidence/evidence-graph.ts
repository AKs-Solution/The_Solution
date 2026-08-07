/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";
import type { EvidenceGraph, EvidenceNode, EvidenceEdge } from "./types";
import type { EvidenceNodeType, EvidenceRelationType } from "./constants";

function mapEntityTypeToNodeType(entityType: string): EvidenceNodeType {
  const mapping: Record<string, EvidenceNodeType> = {
    REQUIREMENT: "REQUIREMENT",
    SPECIFICATION: "SPECIFICATION",
    TEST: "TEST",
    STANDARD: "STANDARD",
    CERTIFICATION: "CERTIFICATION",
    SUPPLIER: "SUPPLIER",
    MANUFACTURER: "SUPPLIER",
    ENGINEERING_CHANGE: "ENGINEERING_CHANGE",
    DOCUMENT_REFERENCE: "DOCUMENT",
    EVIDENCE_REFERENCE: "EXTRACTED_FACT",
  };
  return mapping[entityType] ?? "ENTITY";
}

function mapRelationshipTypeToEvidenceRelation(relType: string): EvidenceRelationType {
  const mapping: Record<string, EvidenceRelationType> = {
    VERIFIES: "VERIFIES",
    REFERENCES: "REFERENCES",
    DERIVED_FROM: "DERIVES_FROM",
    SUPERSEDES: "SUPERSEDES",
    DEPENDS_ON: "SUPPORTS",
    IMPLEMENTS: "SUPPORTS",
    CONTAINS: "REFERENCES",
    MANUFACTURED_BY: "SUPPORTS",
    SUPPLIED_BY: "SUPPORTS",
    TESTED_BY: "VERIFIES",
    CERTIFIED_BY: "VERIFIES",
  };
  return mapping[relType] ?? "REFERENCES";
}

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
 * Breadth-first traversal of the entity relationship graph, one batched query
 * per depth level (all frontier ids fetched together) rather than one query
 * per node - the same fan-out pattern the Rule Engine's buildSharedContext()
 * uses, so a graph with thousands of nodes at maxDepth=5 costs at most 5
 * round trips instead of thousands.
 */
export async function buildEvidenceGraph(
  organizationId: string,
  rootEntityId: string,
  maxDepth: number,
): Promise<EvidenceGraph> {
  const nodes = new Map<string, EvidenceNode>();
  const edges: EvidenceEdge[] = [];
  const visited = new Set<string>([rootEntityId]);

  let frontier = [rootEntityId];
  let depth = 0;

  while (frontier.length > 0 && depth <= maxDepth) {
    const entities = await (prisma as any).engineeringEntity?.findMany({
      where: { id: { in: frontier }, organizationId, deletedAt: null },
      include: {
        sourceRelationships: { include: { targetEntity: { select: RELATED_ENTITY_SELECT } } },
        targetRelationships: { include: { sourceEntity: { select: RELATED_ENTITY_SELECT } } },
      },
    }).catch(() => []) ?? [];

    const nextFrontier: string[] = [];

    for (const entity of entities) {
      const nodeType = mapEntityTypeToNodeType(entity.entityType);
      const nodeId = `entity:${entity.id}`;
      if (!nodes.has(nodeId)) {
        nodes.set(nodeId, {
          id: nodeId,
          type: nodeType,
          label: entity.name,
          entityId: entity.id,
          entityType: entity.entityType,
          status: entity.status,
          version: entity.version,
          createdAt: entity.createdAt?.toISOString?.() || new Date().toISOString(),
          updatedAt: entity.updatedAt?.toISOString?.() || new Date().toISOString(),
        });
      }

      for (const rel of (entity.sourceRelationships || [])) {
        const target = rel.targetEntity;
        if (!target) continue;
        const targetNodeId = `entity:${target.id}`;
        const relationType = mapRelationshipTypeToEvidenceRelation(rel.relationshipType);

        edges.push({
          id: `edge:${rel.id}`,
          sourceId: nodeId,
          targetId: targetNodeId,
          relationType,
          metadata: rel.metadata as Record<string, unknown> | undefined,
        });

        if (!visited.has(target.id)) {
          visited.add(target.id);
          nextFrontier.push(target.id);
        }
      }

      for (const rel of (entity.targetRelationships || [])) {
        const source = rel.sourceEntity;
        if (!source) continue;
        const sourceNodeId = `entity:${source.id}`;
        const relationType = mapRelationshipTypeToEvidenceRelation(rel.relationshipType);

        edges.push({
          id: `edge-rev:${rel.id}`,
          sourceId: sourceNodeId,
          targetId: nodeId,
          relationType,
          metadata: rel.metadata as Record<string, unknown> | undefined,
        });

        if (!visited.has(source.id)) {
          visited.add(source.id);
          nextFrontier.push(source.id);
        }
      }
    }

    frontier = nextFrontier;
    depth += 1;
  }

  await addDocumentEvidence(organizationId, rootEntityId, nodes, edges);

  return {
    nodes,
    edges,
    rootId: `entity:${rootEntityId}`,
  };
}

async function addDocumentEvidence(
  organizationId: string,
  rootEntityId: string,
  nodes: Map<string, EvidenceNode>,
  edges: EvidenceEdge[],
): Promise<void> {
  const extractedEntities = await (prisma as any).extractedEntity?.findMany({
    where: {
      organizationId,
      linkedEntityId: rootEntityId,
    },
    include: {
      document: {
        select: { id: true, fileName: true, currentVersion: true },
      },
    },
  }).catch(() => []) ?? [];

  for (const extracted of extractedEntities) {
    if (!extracted.document) continue;
    const docNodeId = `doc:${extracted.document.id}:${extracted.id}`;
    if (!nodes.has(docNodeId)) {
      nodes.set(docNodeId, {
        id: docNodeId,
        type: "EXTRACTED_FACT",
        label: extracted.name,
        entityId: extracted.id,
        entityType: extracted.entityType,
        documentId: extracted.document.id,
        documentName: extracted.document.fileName,
        documentVersion: extracted.documentVersionId
          ? extracted.document.currentVersion
          : undefined,
        page: extracted.page ?? undefined,
        section: extracted.section ?? undefined,
        extractionMethod: extracted.extractionMethod,
        confidence: extracted.confidence,
        createdAt: extracted.extractedAt?.toISOString?.() || new Date().toISOString(),
        updatedAt: extracted.extractedAt?.toISOString?.() || new Date().toISOString(),
      });
    }

    edges.push({
      id: `edge-doc:${extracted.id}`,
      sourceId: docNodeId,
      targetId: `entity:${rootEntityId}`,
      relationType: "SUPPORTS",
    });
  }
}

export function getSupportingNodes(graph: EvidenceGraph, rootId: string): EvidenceNode[] {
  const supporting = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.targetId === rootId && edge.relationType === "SUPPORTS") {
      supporting.add(edge.sourceId);
    }
    if (edge.sourceId === rootId && edge.relationType === "VERIFIES") {
      supporting.add(edge.targetId);
    }
  }
  return Array.from(supporting)
    .map((id) => graph.nodes.get(id))
    .filter((n): n is EvidenceNode => n !== undefined);
}

export function getConflictingNodes(graph: EvidenceGraph, rootId: string): EvidenceNode[] {
  const conflicting = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.relationType === "CONTRADICTS") {
      if (edge.targetId === rootId) conflicting.add(edge.sourceId);
      if (edge.sourceId === rootId) conflicting.add(edge.targetId);
    }
  }
  return Array.from(conflicting)
    .map((id) => graph.nodes.get(id))
    .filter((n): n is EvidenceNode => n !== undefined);
}
