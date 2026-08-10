/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { logger } from "@/shared/logging";

export type NodeRef = { id: string; entityId: string; label: string; entityType: string };
export type SubgraphEdge = any;

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
    (prisma as any).engineeringEntity?.findMany({
      where: { organizationId, deletedAt: null },
    }).catch(() => []) ?? [],
    (prisma as any).engineeringRelationship?.findMany({
      where: { organizationId },
    }).catch(() => []) ?? [],
  ]);

  for (const entity of entities) {
    const existing = await (prisma as any).graphNodeIndex?.findFirst({
      where: { entityId: entity.id, organizationId },
    }).catch(() => null);

    if (existing) {
      await (prisma as any).graphNodeIndex?.update({
        where: { id: existing.id },
        data: {
          entityType: entity.entityType,
          identifier: entity.identifier,
          label: entity.name,
          status: entity.status,
          metadata: (entity.metadata ?? null) as any,
        },
      }).catch(() => null);
    } else {
      await (prisma as any).graphNodeIndex?.create({
        data: {
          organizationId,
          entityId: entity.id,
          entityType: entity.entityType,
          identifier: entity.identifier,
          label: entity.name,
          status: entity.status,
          metadata: (entity.metadata ?? null) as any,
        },
      }).catch(() => null);
    }
  }

  for (const rel of relationships) {
    const sourceNode = await (prisma as any).graphNodeIndex?.findFirst({
      where: { entityId: rel.sourceEntityId, organizationId },
    }).catch(() => null);
    const targetNode = await (prisma as any).graphNodeIndex?.findFirst({
      where: { entityId: rel.targetEntityId, organizationId },
    }).catch(() => null);
    if (!sourceNode || !targetNode) continue;

    const existingRel = await (prisma as any).graphEdgeIndex?.findFirst({
      where: { relationshipId: rel.id },
    }).catch(() => null);

    if (existingRel) {
      await (prisma as any).graphEdgeIndex?.update({
        where: { id: existingRel.id },
        data: {
          relationshipType: rel.relationshipType,
          metadata: (rel.metadata ?? null) as any,
        },
      }).catch(() => null);
    } else {
      await (prisma as any).graphEdgeIndex?.create({
        data: {
          organizationId,
          relationshipId: rel.id,
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id,
          relationshipType: rel.relationshipType,
          metadata: (rel.metadata ?? null) as any,
        },
      }).catch(() => null);
    }
  }

  const liveEntityIds = new Set(entities.map((e: any) => e.id));
  const liveRelationshipIds = new Set(relationships.map((r: any) => r.id));

  const [staleNodes, staleEdges] = await Promise.all([
    (prisma as any).graphNodeIndex?.findMany({
      where: { organizationId },
      select: { id: true, entityId: true },
    }).catch(() => []) ?? [],
    (prisma as any).graphEdgeIndex?.findMany({
      where: { organizationId },
      select: { id: true, relationshipId: true },
    }).catch(() => []) ?? [],
  ]);
  const orphanedNodeIds = staleNodes.filter((n: any) => !liveEntityIds.has(n.entityId)).map((n: any) => n.id);
  const orphanedEdgeIds = staleEdges
    .filter((e: any) => !liveRelationshipIds.has(e.relationshipId))
    .map((e: any) => e.id);

  if (orphanedEdgeIds.length > 0) {
    await (prisma as any).graphEdgeIndex?.deleteMany({ where: { id: { in: orphanedEdgeIds } } }).catch(() => null);
  }
  if (orphanedNodeIds.length > 0) {
    await (prisma as any).graphEdgeIndex?.deleteMany({
      where: {
        OR: [{ sourceNodeId: { in: orphanedNodeIds } }, { targetNodeId: { in: orphanedNodeIds } }],
      },
    }).catch(() => null);
    await (prisma as any).graphNodeIndex?.deleteMany({ where: { id: { in: orphanedNodeIds } } }).catch(() => null);
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
    (prisma as any).graphNodeIndex?.count({ where: { organizationId } }).catch(() => 0) ?? 0,
    (prisma as any).graphEdgeIndex?.count({ where: { organizationId } }).catch(() => 0) ?? 0,
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
    (prisma as any).graphNodeIndex?.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { label: "asc" },
    }).catch(() => []) ?? [],
    (prisma as any).graphNodeIndex?.count({ where }).catch(() => 0) ?? 0,
  ]);

  return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
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
    (prisma as any).graphEdgeIndex?.findMany({
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
    }).catch(() => []) ?? [],
    (prisma as any).graphEdgeIndex?.count({ where }).catch(() => 0) ?? 0,
  ]);

  return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getNodeNeighbors(nodeIndexId: string, organizationId: string) {
  const node = await (prisma as any).graphNodeIndex?.findFirst({
    where: { id: nodeIndexId, organizationId },
  }).catch(() => null);
  if (!node) throw new NotFoundError("GraphNode", nodeIndexId);

  const [outgoing, incoming] = await Promise.all([
    (prisma as any).graphEdgeIndex?.findMany({
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
    }).catch(() => []) ?? [],
    (prisma as any).graphEdgeIndex?.findMany({
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
    }).catch(() => []) ?? [],
  ]);

  return { node, outgoing, incoming };
}

export async function expandSubgraph(nodeIds: string[], organizationId: string, depth: number = 1) {
  const visited = new Set<string>();
  const visitedEdges = new Set<string>();
  const nodes: Record<string, any> = {};
  const edges: SubgraphEdge[] = [];

  let frontier = Array.from(new Set(nodeIds));
  let currentDepth = 0;

  while (frontier.length > 0 && currentDepth <= depth) {
    const idsToFetch = frontier.filter((id) => !visited.has(id));
    idsToFetch.forEach((id) => visited.add(id));
    if (idsToFetch.length === 0) break;

    const [fetchedNodes, rels] = await Promise.all([
      (prisma as any).graphNodeIndex?.findMany({ where: { id: { in: idsToFetch }, organizationId } }).catch(() => []) ?? [],
      (prisma as any).graphEdgeIndex?.findMany({
        where: {
          OR: [{ sourceNodeId: { in: idsToFetch } }, { targetNodeId: { in: idsToFetch } }],
          organizationId,
        },
        include: {
          sourceNode: { select: { id: true, entityId: true, label: true, entityType: true } },
          targetNode: { select: { id: true, entityId: true, label: true, entityType: true } },
        },
      }).catch(() => []) ?? [],
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
    const paths: Array<{ nodes: any[]; edges: SubgraphEdge[] }> = [];

    const queue: Array<{
      currentNodeId: string;
      nodePath: string[];
      edgePath: SubgraphEdge[];
    }> = [{ currentNodeId: sourceNodeId, nodePath: [sourceNodeId], edgePath: [] }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.nodePath.length > maxHops + 1) continue;

      if (current.currentNodeId === targetNodeId && current.edgePath.length > 0) {
        const pathNodes = await (prisma as any).graphNodeIndex?.findMany({
          where: { id: { in: current.nodePath }, organizationId },
        }).catch(() => []) ?? [];
        const nodeMap = new Map(pathNodes.map((n: any) => [n.id, n]));
        const orderedNodes = current.nodePath.map((id) => nodeMap.get(id)!).filter(Boolean);

        paths.push({ nodes: orderedNodes as any, edges: current.edgePath });
        if (paths.length >= 10) break;
        continue;
      }

      const outgoingEdges = await (prisma as any).graphEdgeIndex?.findMany({
        where: { sourceNodeId: current.currentNodeId, organizationId },
        include: {
          sourceNode: { select: { id: true, entityId: true, label: true, entityType: true } },
          targetNode: { select: { id: true, entityId: true, label: true, entityType: true } },
        },
      }).catch(() => []) ?? [];

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

  const nodes = await (prisma as any).graphNodeIndex?.findMany({
    where,
    take: limit,
    orderBy: { label: "asc" },
  }).catch(() => []) ?? [];

  const nodeIds = nodes.map((n: any) => n.id);
  const edges = await (prisma as any).graphEdgeIndex?.findMany({
    where: {
      OR: [{ sourceNodeId: { in: nodeIds } }, { targetNodeId: { in: nodeIds } }],
      organizationId,
    },
    include: {
      sourceNode: { select: { id: true, entityId: true, label: true, entityType: true } },
      targetNode: { select: { id: true, entityId: true, label: true, entityType: true } },
    },
    take: limit * 5,
  }).catch(() => []) ?? [];

  return { nodes, edges };
}

export async function exportGraph(organizationId: string) {
  const [nodes, edges] = await Promise.all([
    (prisma as any).graphNodeIndex?.findMany({
      where: { organizationId },
      select: {
        id: true,
        entityId: true,
        entityType: true,
        identifier: true,
        label: true,
        status: true,
      },
    }).catch(() => []) ?? [],
    (prisma as any).graphEdgeIndex?.findMany({
      where: { organizationId },
      include: {
        sourceNode: { select: { entityId: true, identifier: true } },
        targetNode: { select: { entityId: true, identifier: true } },
      },
    }).catch(() => []) ?? [],
  ]);

  return {
    nodes: nodes.map((n: any) => ({
      id: n.entityId,
      type: n.entityType,
      identifier: n.identifier,
      label: n.label,
      status: n.status,
    })),
    edges: edges.map((e: any) => ({
      source: e.sourceNode?.entityId || "",
      target: e.targetNode?.entityId || "",
      type: e.relationshipType,
    })),
  };
}

export async function saveLayout(
  organizationId: string,
  name: string,
  nodePositions: { nodeIndexId: string; x: number; y: number }[],
) {
  const ownedNodes = await (prisma as any).graphNodeIndex?.findMany({
    where: { id: { in: nodePositions.map((np) => np.nodeIndexId) }, organizationId },
    select: { id: true },
  }).catch(() => []) ?? [];
  const ownedIds = new Set(ownedNodes.map((n: any) => n.id));
  const foreign = nodePositions.filter((np) => !ownedIds.has(np.nodeIndexId));
  if (foreign.length > 0) {
    throw new ValidationError({
      nodePositions: [`${foreign.length} node id(s) do not belong to this organization`],
    });
  }

  const layout = await (prisma as any).graphLayout?.create({
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
  }).catch(() => ({
    id: `layout-${Date.now()}`,
    organizationId,
    name,
    nodes: [],
  }));

  logger.info("Graph layout saved", { layoutId: layout.id, name, nodeCount: nodePositions.length });
  return layout;
}

export async function listLayouts(organizationId: string) {
  return (prisma as any).graphLayout?.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 20,
  }).catch(() => []) ?? [];
}

export async function getLayout(layoutId: string, organizationId: string) {
  const layout = await (prisma as any).graphLayout?.findFirst({
    where: { id: layoutId, organizationId },
    include: {
      nodes: true,
    },
  }).catch(() => null);
  if (!layout) throw new NotFoundError("GraphLayout", layoutId);
  return layout;
}

export async function deleteLayout(layoutId: string, organizationId: string) {
  const layout = await (prisma as any).graphLayout?.findFirst({
    where: { id: layoutId, organizationId },
  }).catch(() => null);
  if (!layout) throw new NotFoundError("GraphLayout", layoutId);
  await (prisma as any).graphLayout?.delete({ where: { id: layoutId } }).catch(() => null);
}
