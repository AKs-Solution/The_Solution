// File: packages/domain-core/src/types.ts

export type EdgeType =
  | "affects"
  | "supplied_by"
  | "justified_by"
  | "caused_by"
  | "satisfied_by"
  | "impacts"
  | "supersedes"
  | "associated_with"
  | "satisfies"
  | "constrains"
  | "depends_on"
  | "relates_to"
  | "calculates";

export interface SIProperty {
  value: number;
  unit: string;
  dimension: number[]; // [Mass (kg), Length (m), Time (s), Current (A), Temp (K), Amount (mol), Luminous (cd)]
}

export interface KnowledgeNode {
  id: string;
  tenant_id: string;
  node_type: string; // 'material' | 'design_variable' | 'equation' | 'constraint' | 'component'
  properties: Record<string, unknown>;
  created_at: string;
  active: boolean;
}

export interface KnowledgeEdge {
  id: string;
  tenant_id: string;
  edge_type: EdgeType | string;
  source_id: string;
  target_id: string;
  evidence_hashes: string[];
  properties?: Record<string, unknown>;
  created_at: string;
  active: boolean;
}

export interface SerializedGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export interface CrossDomainQuery {
  sourceNodeId: string;
  targetNodeId: string;
  relationshipHint?: EdgeType | string;
}

export interface ConstraintDemotionWarning {
  nodeId: string;
  reason: string;
  originalValue: number;
  demotedValue: number;
}

export interface MatchPath {
  pathNodes: KnowledgeNode[];
  pathEdges: KnowledgeEdge[];
  siCompatibilityScore: number;
  warnings: ConstraintDemotionWarning[];
}

export interface MatchResult {
  matchedPaths: MatchPath[];
  overallStatus: "MATCHED" | "NO_PATHS" | "CONSTRAINT_DEMOTED";
  suggestion?: string;
}

export class EvidenceBindingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvidenceBindingError";
  }
}

export class DimensionMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DimensionMismatchError";
  }
}
