import { prisma } from "@/server/db";
import { Prisma, type GraphNodeIndex, type GraphEdgeIndex } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { logger } from "@/shared/logging";

type NodeRef = Pick<GraphNodeIndex, "id" | "entityId" | "label" | "entityType">;
type SubgraphEdge = GraphEdgeIndex & { sourceNode: NodeRef; targetNode: NodeRef };

export const DOMAIN_RELATIONSHIP_TYPES = [
  "AFFECTS",
  "SUPPLIED_BY",
  "JUSTIFIED_BY",
  "CAUSED_BY",
  "SATISFIED_BY",
  "IMPACTS",
  "SUPERSEDES",
  "ASSOCIATED_WITH",
  "CONTAINS",
  "VERIFIED_BY",
  "GOVERNED_BY",
  "DERIVED_FROM",
  "MITIGATES",
] as const;

export async function syncGraphIndexes(organizationId: string) {
  const [entities, relationships] = await Promise.all([
    prisma.engineeringEntity.findMany({
      where: { organizationId, deletedAt: null },
    }),
    prisma.engineeringRelationship.findMany({
      where: { organizationId },
    }),
  ]);

  for (const entity of entities) {
    await prisma.graphNodeIndex.upsert({
      where: { entityId: entity.id },
      update: {
        entityType: entity.entityType,
        identifier: entity.identifier,
        label: entity.name,
        status: entity.status,
        metadata: (entity.metadata ?? Prisma.DbNull) as Prisma.InputJsonValue,
      },
      create: {
        organizationId,
        entityId: entity.id,
        entityType: entity.entityType,
        identifier: entity.identifier,
        label: entity.name,
        status: entity.status,
        metadata: (entity.metadata ?? Prisma.DbNull) as Prisma.InputJsonValue,
      },
    });
  }

  for (const rel of relationships) {
    const sourceNode = await prisma.graphNodeIndex.findUnique({
      where: { entityId: rel.sourceEntityId },
    });
    const targetNode = await prisma.graphNodeIndex.findUnique({
      where: { entityId: rel.targetEntityId },
    });
    if (!sourceNode || !targetNode) continue;

    await prisma.graphEdgeIndex.upsert({
      where: { relationshipId: rel.id },
      update: {
        relationshipType: rel.relationshipType,
        metadata: (rel.metadata ?? Prisma.DbNull) as Prisma.InputJsonValue,
      },
      create: {
        organizationId,
        relationshipId: rel.id,
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        relationshipType: rel.relationshipType,
        metadata: (rel.metadata ?? Prisma.DbNull) as Prisma.InputJsonValue,
      },
    });
  }

  const liveEntityIds = new Set(entities.map((e) => e.id));
  const liveRelationshipIds = new Set(relationships.map((r) => r.id));

  const [staleNodes, staleEdges] = await Promise.all([
    prisma.graphNodeIndex.findMany({
      where: { organizationId },
      select: { id: true, entityId: true },
    }),
    prisma.graphEdgeIndex.findMany({
      where: { organizationId },
      select: { id: true, relationshipId: true },
    }),
  ]);
  const orphanedNodeIds = staleNodes.filter((n) => !liveEntityIds.has(n.entityId)).map((n) => n.id);
  const orphanedEdgeIds = staleEdges
    .filter((e) => !liveRelationshipIds.has(e.relationshipId))
    .map((e) => e.id);

  if (orphanedEdgeIds.length > 0) {
    await prisma.graphEdgeIndex.deleteMany({ where: { id: { in: orphanedEdgeIds } } });
  }
  if (orphanedNodeIds.length > 0) {
    await prisma.graphEdgeIndex.deleteMany({
      where: {
        OR: [{ sourceNodeId: { in: orphanedNodeIds } }, { targetNodeId: { in: orphanedNodeIds } }],
      },
    });
    await prisma.graphNodeIndex.deleteMany({ where: { id: { in: orphanedNodeIds } } });
  }

  const stats = { nodes: entities.length, edges: relationships.length };
  logger.info("Graph indexes synced", {
    organizationId,
    ...stats,
    prunedNodes: orphanedNodeIds.length,
    prunedEdges: orphanedEdgeIds.length,
  });
  return stats;
}

export async function getGraphStats(organizationId: string) {
  const [nodes, edges] = await Promise.all([
    prisma.graphNodeIndex.count({ where: { organizationId } }),
    prisma.graphEdgeIndex.count({ where: { organizationId } }),
  ]);
  return { nodes, edges };
}

export async function getGraphNodes(
  organizationId: string,
  filters: { entityType?: string; search?: string; page?: number; pageSize?: number },
) {
  const { entityType, search, page = 1, pageSize = 50 } = filters;
  const where: Record<string, unknown> = { organizationId };

  if (entityType) where.entityType = entityType;
  if (search) {
    where.OR = [
      { label: { contains: search, mode: "insensitive" } },
      { identifier: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.graphNodeIndex.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { label: "asc" },
    }),
    prisma.graphNodeIndex.count({ where }),
  ]);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getGraphEdges(
  organizationId: string,
  filters: {
    relationshipType?: string;
    sourceNodeId?: string;
    targetNodeId?: string;
    page?: number;
    pageSize?: number;
  },
) {
  const { relationshipType, sourceNodeId, targetNodeId, page = 1, pageSize = 50 } = filters;
  const where: Record<string, unknown> = { organizationId };

  if (relationshipType) where.relationshipType = relationshipType;
  if (sourceNodeId) where.sourceNodeId = sourceNodeId;
  if (targetNodeId) where.targetNodeId = targetNodeId;

  const [data, total] = await Promise.all([
    prisma.graphEdgeIndex.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        sourceNode: {
          select: { id: true, entityId: true, label: true, entityType: true, identifier: true },
        },
        targetNode: {
          select: { id: true, entityId: true, label: true, entityType: true, identifier: true },
        },
      },
    }),
    prisma.graphEdgeIndex.count({ where }),
  ]);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getNodeNeighbors(nodeIndexId: string, organizationId: string) {
  const node = await prisma.graphNodeIndex.findFirst({
    where: { id: nodeIndexId, organizationId },
  });
  if (!node) throw new NotFoundError("GraphNode", nodeIndexId);

  const [outgoing, incoming] = await Promise.all([
    prisma.graphEdgeIndex.findMany({
      where: { sourceNodeId: nodeIndexId, organizationId },
      include: {
        targetNode: {
          select: {
            id: true,
            entityId: true,
            label: true,
            entityType: true,
            identifier: true,
            status: true,
          },
        },
      },
    }),
    prisma.graphEdgeIndex.findMany({
      where: { targetNodeId: nodeIndexId, organizationId },
      include: {
        sourceNode: {
          select: {
            id: true,
            entityId: true,
            label: true,
            entityType: true,
            identifier: true,
            status: true,
          },
        },
      },
    }),
  ]);

  return { node, outgoing, incoming };
}

export async function expandSubgraph(nodeIds: string[], organizationId: string, depth: number = 1) {
  const visited = new Set<string>();
  const visitedEdges = new Set<string>();
  const nodes: Record<string, GraphNodeIndex> = {};
  const edges: SubgraphEdge[] = [];

  let frontier = Array.from(new Set(nodeIds));
  let currentDepth = 0;

  while (frontier.length > 0 && currentDepth <= depth) {
    const idsToFetch = frontier.filter((id) => !visited.has(id));
    idsToFetch.forEach((id) => visited.add(id));
    if (idsToFetch.length === 0) break;

    const [fetchedNodes, rels] = await Promise.all([
      prisma.graphNodeIndex.findMany({ where: { id: { in: idsToFetch }, organizationId } }),
      prisma.graphEdgeIndex.findMany({
        where: {
          OR: [{ sourceNodeId: { in: idsToFetch } }, { targetNodeId: { in: idsToFetch } }],
          organizationId,
        },
        include: {
          sourceNode: { select: { id: true, entityId: true, label: true, entityType: true } },
          targetNode: { select: { id: true, entityId: true, label: true, entityType: true } },
        },
      }),
    ]);

    for (const node of fetchedNodes) nodes[node.id] = node;

    const nextFrontier: string[] = [];
    for (const rel of rels) {
      if (!visitedEdges.has(rel.id)) {
        visitedEdges.add(rel.id);
        edges.push(rel);
      }
      if (!visited.has(rel.sourceNodeId)) nextFrontier.push(rel.sourceNodeId);
      if (!visited.has(rel.targetNodeId)) nextFrontier.push(rel.targetNodeId);
    }

    frontier = nextFrontier;
    currentDepth += 1;
  }

  return { nodes: Object.values(nodes), edges };
}

/**
 * Multi-hop Graph Traversal Service
 * Finds explicit directional paths between a source and target node up to maxHops depth.
 */
export async function findPathsBetweenNodes(
  sourceNodeId: string,
  targetNodeId: string,
  organizationId: string,
  maxHops: number = 4,
) {
  try {
    const paths: Array<{ nodes: GraphNodeIndex[]; edges: SubgraphEdge[] }> = [];

    const queue: Array<{
      currentNodeId: string;
      nodePath: string[];
      edgePath: SubgraphEdge[];
    }> = [{ currentNodeId: sourceNodeId, nodePath: [sourceNodeId], edgePath: [] }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.nodePath.length > maxHops + 1) continue;

      if (current.currentNodeId === targetNodeId && current.edgePath.length > 0) {
        const pathNodes = await prisma.graphNodeIndex.findMany({
          where: { id: { in: current.nodePath }, organizationId },
        });
        const nodeMap = new Map(pathNodes.map((n) => [n.id, n]));
        const orderedNodes = current.nodePath.map((id) => nodeMap.get(id)!).filter(Boolean);

        paths.push({ nodes: orderedNodes, edges: current.edgePath });
        if (paths.length >= 10) break;
        continue;
      }

      const outgoingEdges = await prisma.graphEdgeIndex.findMany({
        where: { sourceNodeId: current.currentNodeId, organizationId },
        include: {
          sourceNode: { select: { id: true, entityId: true, label: true, entityType: true } },
          targetNode: { select: { id: true, entityId: true, label: true, entityType: true } },
        },
      });

      for (const edge of outgoingEdges) {
        if (!current.nodePath.includes(edge.targetNodeId)) {
          queue.push({
            currentNodeId: edge.targetNodeId,
            nodePath: [...current.nodePath, edge.targetNodeId],
            edgePath: [...current.edgePath, edge],
          });
        }
      }
    }

    return paths;
  } catch (err) {
    console.warn("Graph path traversal fallback on DB disconnect:", err);
    return [];
  }
}

export async function getSubgraph(
  organizationId: string,
  filters: { entityType?: string; limit?: number },
) {
  const { entityType, limit = 100 } = filters;
  const where: Record<string, unknown> = { organizationId };
  if (entityType) where.entityType = entityType;

  const nodes = await prisma.graphNodeIndex.findMany({
    where,
    take: limit,
    orderBy: { label: "asc" },
  });

  const nodeIds = nodes.map((n) => n.id);
  const edges = await prisma.graphEdgeIndex.findMany({
    where: {
      OR: [{ sourceNodeId: { in: nodeIds } }, { targetNodeId: { in: nodeIds } }],
      organizationId,
    },
    include: {
      sourceNode: { select: { id: true, entityId: true, label: true, entityType: true } },
      targetNode: { select: { id: true, entityId: true, label: true, entityType: true } },
    },
    take: limit * 5,
  });

  return { nodes, edges };
}

export async function exportGraph(organizationId: string) {
  const [nodes, edges] = await Promise.all([
    prisma.graphNodeIndex.findMany({
      where: { organizationId },
      select: {
        id: true,
        entityId: true,
        entityType: true,
        identifier: true,
        label: true,
        status: true,
      },
    }),
    prisma.graphEdgeIndex.findMany({
      where: { organizationId },
      include: {
        sourceNode: { select: { entityId: true, identifier: true } },
        targetNode: { select: { entityId: true, identifier: true } },
      },
    }),
  ]);

  return {
    nodes: nodes.map((n) => ({
      id: n.entityId,
      type: n.entityType,
      identifier: n.identifier,
      label: n.label,
      status: n.status,
    })),
    edges: edges.map((e) => ({
      source: e.sourceNode.entityId,
      target: e.targetNode.entityId,
      type: e.relationshipType,
    })),
  };
}

export async function saveLayout(
  organizationId: string,
  name: string,
  nodePositions: { nodeIndexId: string; x: number; y: number }[],
) {
  const ownedNodes = await prisma.graphNodeIndex.findMany({
    where: { id: { in: nodePositions.map((np) => np.nodeIndexId) }, organizationId },
    select: { id: true },
  });
  const ownedIds = new Set(ownedNodes.map((n) => n.id));
  const foreign = nodePositions.filter((np) => !ownedIds.has(np.nodeIndexId));
  if (foreign.length > 0) {
    throw new ValidationError({
      nodePositions: [`${foreign.length} node id(s) do not belong to this organization`],
    });
  }

  const layout = await prisma.graphLayout.create({
    data: {
      organizationId,
      name,
      nodes: {
        create: nodePositions.map((np) => ({
          nodeIndexId: np.nodeIndexId,
          positionX: np.x,
          positionY: np.y,
        })),
      },
    },
    include: { nodes: true },
  });

  logger.info("Graph layout saved", { layoutId: layout.id, name, nodeCount: nodePositions.length });
  return layout;
}

export async function listLayouts(organizationId: string) {
  return prisma.graphLayout.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getLayout(layoutId: string, organizationId: string) {
  const layout = await prisma.graphLayout.findFirst({
    where: { id: layoutId, organizationId },
    include: {
      nodes: {
        include: {
          layout: false,
        },
      },
    },
  });
  if (!layout) throw new NotFoundError("GraphLayout", layoutId);
  return layout;
}

export async function deleteLayout(layoutId: string, organizationId: string) {
  const layout = await prisma.graphLayout.findFirst({
    where: { id: layoutId, organizationId },
  });
  if (!layout) throw new NotFoundError("GraphLayout", layoutId);
  await prisma.graphLayout.delete({ where: { id: layoutId } });
}
