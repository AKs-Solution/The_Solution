import {
  AlternativeData,
  AssumptionData,
  ConflictData,
  ConstraintData,
  EngineeringConclusionData,
  EngineeringPrincipleData,
  EvidenceInput,
  EvidenceWeightResult,
  ReasoningStepData,
  TradeoffData,
} from "../types";

export interface PipelineContext {
  sessionId: string;
  organizationId: string;
  problemStatement: string;
  title: string;
  rawInputContext?: Record<string, unknown>;

  // Collected & validated evidence
  rawEvidence: EvidenceInput[];
  evidenceWeights: EvidenceWeightResult[];

  // Identified domain objects
  constraints: ConstraintData[];
  assumptions: AssumptionData[];
  principles: EngineeringPrincipleData[];
  alternatives: AlternativeData[];
  tradeoffs: TradeoffData[];
  conflicts: ConflictData[];

  // Analysis & Reasoning outputs
  relationshipMap: Array<{
    source: string;
    target: string;
    relationship: string;
    rationale: string;
  }>;
  reasoningChains: Array<{
    stepIndex: number;
    title: string;
    rationale: string;
    evidenceRefs: string[];
  }>;
  confidenceScore: number;
  isSupportedByEvidence: boolean;
  unresolvedUncertainties: string[];

  // Final conclusion & citations
  conclusion: EngineeringConclusionData | null;
  citations: Array<{ evidenceId: string; citationText: string; relevanceWeight: number }>;
  recommendations: string[];

  // Execution tracking
  stepsExecuted: ReasoningStepData[];
}
