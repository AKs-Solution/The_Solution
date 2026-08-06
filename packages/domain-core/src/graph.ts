// File: packages/domain-core/src/graph.ts

import { randomUUID } from "crypto";
import {
  KnowledgeNode,
  KnowledgeEdge,
  SerializedGraph,
  EdgeType,
  EvidenceBindingError,
} from "./types";

const SHA256_REGEX = /^[a-fA-F0-9]{64}$/;

export class KnowledgeGraph {
  private nodesMap = new Map<string, KnowledgeNode>();
  private edgesMap = new Map<string, KnowledgeEdge>();

  public addNode(node: Omit<KnowledgeNode, "id" | "created_at">): KnowledgeNode {
    const id = randomUUID();
    const created_at = new Date().toISOString();
    const newNode: KnowledgeNode = {
      ...node,
      id,
      created_at,
      active: node.active ?? true,
    };
    this.nodesMap.set(id, newNode);
    return newNode;
  }

  public addEdge(edge: Omit<KnowledgeEdge, "id" | "created_at">): KnowledgeEdge {
    // 1. Validate source node existence & active state
    const sourceNode = this.nodesMap.get(edge.source_id);
    if (!sourceNode || !sourceNode.active) {
      throw new EvidenceBindingError(
        `Source node '${edge.source_id}' does not exist or is inactive in KnowledgeGraph.`,
      );
    }

    // 2. Validate target node existence & active state
    const targetNode = this.nodesMap.get(edge.target_id);
    if (!targetNode || !targetNode.active) {
      throw new EvidenceBindingError(
        `Target node '${edge.target_id}' does not exist or is inactive in KnowledgeGraph.`,
      );
    }

    // 3. Validate evidence hashes
    if (
      !edge.evidence_hashes ||
      !Array.isArray(edge.evidence_hashes) ||
      edge.evidence_hashes.length === 0
    ) {
      throw new EvidenceBindingError(
        `Edge relationship '${edge.edge_type}' requires a non-empty evidence_hashes array.`,
      );
    }

    for (const hash of edge.evidence_hashes) {
      if (!SHA256_REGEX.test(hash)) {
        throw new EvidenceBindingError(
          `Invalid SHA-256 evidence hash '${hash}'. Must be a 64-character hex string.`,
        );
      }
    }

    const id = randomUUID();
    const created_at = new Date().toISOString();
    const newEdge: KnowledgeEdge = {
      ...edge,
      id,
      created_at,
      active: edge.active ?? true,
    };

    this.edgesMap.set(id, newEdge);
    return newEdge;
  }

  public getNode(id: string): KnowledgeNode | undefined {
    const node = this.nodesMap.get(id);
    if (!node || !node.active) return undefined;
    return node;
  }

  public getEdges(
    sourceId?: string,
    targetId?: string,
    edgeType?: EdgeType | string,
  ): KnowledgeEdge[] {
    const edges: KnowledgeEdge[] = [];
    for (const edge of this.edgesMap.values()) {
      if (!edge.active) continue;
      if (sourceId && edge.source_id !== sourceId) continue;
      if (targetId && edge.target_id !== targetId) continue;
      if (edgeType && edge.edge_type !== edgeType) continue;
      edges.push(edge);
    }
    return edges;
  }

  public deleteNode(id: string): void {
    const node = this.nodesMap.get(id);
    if (node) {
      node.active = false;
    }
    // Also deactivate connected edges
    for (const edge of this.edgesMap.values()) {
      if (edge.source_id === id || edge.target_id === id) {
        edge.active = false;
      }
    }
  }

  public deleteEdge(id: string): void {
    const edge = this.edgesMap.get(id);
    if (edge) {
      edge.active = false;
    }
  }

  public serialize(): SerializedGraph {
    const activeNodes = Array.from(this.nodesMap.values()).filter((n) => n.active);
    const activeEdges = Array.from(this.edgesMap.values()).filter((e) => e.active);
    return {
      nodes: activeNodes,
      edges: activeEdges,
    };
  }

  public static deserialize(data: SerializedGraph): KnowledgeGraph {
    const graph = new KnowledgeGraph();
    if (data.nodes && Array.isArray(data.nodes)) {
      for (const node of data.nodes) {
        if (node.active !== false) {
          graph.nodesMap.set(node.id, { ...node, active: true });
        }
      }
    }
    if (data.edges && Array.isArray(data.edges)) {
      for (const edge of data.edges) {
        if (edge.active !== false) {
          graph.edgesMap.set(edge.id, { ...edge, active: true });
        }
      }
    }
    return graph;
  }
}
