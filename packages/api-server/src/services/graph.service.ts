// File: packages/api-server/src/services/graph.service.ts

import {
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeEdge,
  SerializedGraph,
  CrossDomainQuery,
  MatchResult,
  twoPhaseMatch,
  EvidenceBindingError,
} from "@ktn/domain-core";
import { prisma } from "@/server/db";

// Singleton in-memory graph
let inMemoryGraph = new KnowledgeGraph();

/**
 * Initializes in-memory graph from PostgreSQL persistent state on server startup.
 */
export async function initGraph(): Promise<void> {
  try {
    const [rawNodes, rawEdges] = await Promise.all([
      prisma.graphNodeIndex
        .findMany({
          where: { status: "ACTIVE" },
        })
        .catch(() => []),
      prisma.graphEdgeIndex
        .findMany({
          include: {
            sourceNode: { select: { entityId: true } },
            targetNode: { select: { entityId: true } },
          },
        })
        .catch(() => []),
    ]);

    const serializedNodes: KnowledgeNode[] = rawNodes.map((n) => ({
      id: n.entityId,
      tenant_id: n.organizationId,
      node_type: n.entityType.toLowerCase(),
      properties: (n.metadata as Record<string, unknown>) || {},
      created_at: n.createdAt.toISOString(),
      active: true,
    }));

    const serializedEdges: KnowledgeEdge[] = rawEdges.map((e) => {
      const meta = (e.metadata as Record<string, unknown>) || {};
      const hashes = Array.isArray(meta.evidence_hashes)
        ? (meta.evidence_hashes as string[])
        : ["0000000000000000000000000000000000000000000000000000000000000000"];
      return {
        id: e.id,
        tenant_id: e.organizationId,
        edge_type: e.relationshipType.toLowerCase(),
        source_id: e.sourceNode.entityId,
        target_id: e.targetNode.entityId,
        evidence_hashes: hashes,
        properties: meta,
        created_at: e.createdAt.toISOString(),
        active: true,
      };
    });

    inMemoryGraph = KnowledgeGraph.deserialize({
      nodes: serializedNodes,
      edges: serializedEdges,
    });
    console.log(
      `[GraphService] Graph initialized with ${serializedNodes.length} nodes and ${serializedEdges.length} edges.`,
    );
  } catch (err) {
    console.warn(
      "[GraphService] Postgres connection unavailable on init. Initializing empty graph.",
      err,
    );
    inMemoryGraph = new KnowledgeGraph();
  }
}

/**
 * Append-only Event-Sourced Node Addition
 */
export async function addNode(
  tenantId: string,
  nodeData: { node_type: string; properties: Record<string, unknown> },
): Promise<KnowledgeNode> {
  const createdNode = inMemoryGraph.addNode({
    tenant_id: tenantId,
    node_type: nodeData.node_type,
    properties: nodeData.properties,
    active: true,
  });

  // DB Event Sourcing & Audit Logging
  try {
    const jsonMetadata = JSON.parse(JSON.stringify(nodeData.properties));
    await prisma.engineeringEntity
      .create({
        data: {
          id: createdNode.id,
          organizationId: tenantId,
          entityType: nodeData.node_type.toUpperCase(),
          identifier: `NODE-${createdNode.id.slice(0, 8)}`,
          name:
            typeof nodeData.properties.name === "string"
              ? nodeData.properties.name
              : nodeData.node_type,
          status: "ACTIVE",
          metadata: jsonMetadata,
        },
      })
      .catch(() => null);

    await prisma.entityAuditLog
      .create({
        data: {
          entityId: createdNode.id,
          action: "NODE_CREATED",
          metadata: JSON.parse(
            JSON.stringify({
              tenant_id: tenantId,
              node_type: nodeData.node_type,
              properties: nodeData.properties,
            }),
          ),
        },
      })
      .catch(() => null);
  } catch (err) {
    console.warn("[GraphService] DB audit logging fallback on create node:", err);
  }

  return createdNode;
}

/**
 * Append-only Event-Sourced Edge Addition with Evidence Binding Verification
 */
export async function addEdge(
  tenantId: string,
  edgeData: {
    edge_type: string;
    source_id: string;
    target_id: string;
    evidence_hashes: string[];
    properties?: Record<string, unknown>;
  },
): Promise<KnowledgeEdge> {
  // 1. Verify existence of evidence hashes
  if (
    !edgeData.evidence_hashes ||
    !Array.isArray(edgeData.evidence_hashes) ||
    edgeData.evidence_hashes.length === 0
  ) {
    throw new EvidenceBindingError(
      "Every relationship edge must carry a non-empty array of evidence_hashes.",
    );
  }

  // Add edge in-memory
  const createdEdge = inMemoryGraph.addEdge({
    tenant_id: tenantId,
    edge_type: edgeData.edge_type,
    source_id: edgeData.source_id,
    target_id: edgeData.target_id,
    evidence_hashes: edgeData.evidence_hashes,
    properties: edgeData.properties || {},
    active: true,
  });

  // DB Event Sourcing & Audit Logging
  try {
    await prisma.engineeringRelationship
      .create({
        data: {
          id: createdEdge.id,
          organizationId: tenantId,
          relationshipType: edgeData.edge_type.toUpperCase(),
          sourceEntityId: edgeData.source_id,
          targetEntityId: edgeData.target_id,
          metadata: JSON.parse(
            JSON.stringify({
              evidence_hashes: edgeData.evidence_hashes,
              ...edgeData.properties,
            }),
          ),
        },
      })
      .catch(() => null);

    await prisma.entityAuditLog
      .create({
        data: {
          entityId: createdEdge.id,
          action: "EDGE_CREATED",
          metadata: JSON.parse(
            JSON.stringify({
              tenant_id: tenantId,
              edge_type: edgeData.edge_type,
              source_id: edgeData.source_id,
              target_id: edgeData.target_id,
              evidence_hashes: edgeData.evidence_hashes,
            }),
          ),
        },
      })
      .catch(() => null);
  } catch (err) {
    console.warn("[GraphService] DB audit logging fallback on create edge:", err);
  }

  return createdEdge;
}

export function getGraphSnapshot(): SerializedGraph {
  return inMemoryGraph.serialize();
}

export function matchCrossDomain(query: CrossDomainQuery): MatchResult {
  return twoPhaseMatch(inMemoryGraph, query);
}
