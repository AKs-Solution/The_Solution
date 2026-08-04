export type ReasoningSessionStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type ReasoningStageName =
  | "EVIDENCE_COLLECTION"
  | "EVIDENCE_VALIDATION"
  | "EVIDENCE_WEIGHTING"
  | "CONSTRAINT_IDENTIFICATION"
  | "PRINCIPLE_SELECTION"
  | "RELATIONSHIP_ANALYSIS"
  | "TRADEOFF_EVALUATION"
  | "ALTERNATIVE_GENERATION"
  | "CONFLICT_DETECTION"
  | "REASONING_CHAIN_CONSTRUCTION"
  | "CONFIDENCE_CALCULATION"
  | "CONCLUSION_GENERATION"
  | "EVIDENCE_CITATION"
  | "RECOMMENDATION_GENERATION"
  | "MISSING_EVIDENCE_DETECTION"
  | "CAUSAL_REASONING";

export type ConflictType =
  | "EVIDENCE_CONTRADICTION"
  | "PRINCIPLE_INCOMPATIBILITY"
  | "CONSTRAINT_VIOLATION"
  | "UNSUPPORTED_ASSUMPTION"
  | "CIRCULAR_REASONING"
  | "OUTDATED_EVIDENCE"
  | "INCONSISTENT_CONCLUSION";

export type ConflictSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ReasoningNodeType =
  | "EVIDENCE"
  | "PRINCIPLE"
  | "CONSTRAINT"
  | "ASSUMPTION"
  | "TRADEOFF"
  | "ALTERNATIVE"
  | "RISK"
  | "RECOMMENDATION"
  | "CONCLUSION"
  | "STEP"
  | "MISSING_EVIDENCE"
  | "DECISION_BRANCH";

export type ReasoningEdgeType =
  | "SUPPORTS"
  | "CONTRADICTS"
  | "INFLUENCES"
  | "DERIVED_FROM"
  | "MITIGATES"
  | "APPLIES"
  | "CONSTRAINS"
  | "REJECTS"
  | "CITING"
  | "CAUSES";

export interface EvidenceInput {
  id: string;
  title: string;
  type: string;
  verificationLevel?: number; // 0 to 1
  sourceQuality?: number; // 0 to 1
  recencyDate?: string;
  relevanceScore?: number; // 0 to 1
  repeatabilityScore?: number; // 0 to 1
  independentConfirmation?: boolean;
  historicalAccuracy?: number; // 0 to 1
  hasConflict?: boolean;
  content?: string;
}

export interface EvidenceWeightResult {
  evidenceId: string;
  evidenceType: string;
  title: string;
  verificationLevel: number;
  sourceQuality: number;
  recencyScore: number;
  relevanceScore: number;
  repeatabilityScore: number;
  independentConfirmation: number;
  engineeringConfidence: number;
  historicalAccuracy: number;
  conflictingScore: number;
  finalWeight: number;
  weightExplanation: string;
}

export interface EngineeringPrincipleData {
  id?: string;
  code: string;
  name: string;
  category: string;
  description: string;
  governingEquations: string[];
  domain: string;
  version: number;
  status: string;
  supportingEvidenceRefs?: string[];
  metadata?: Record<string, unknown>;
}

export interface ConstraintData {
  id?: string;
  name: string;
  category: string;
  description: string;
  limitValue?: number;
  unit?: string;
  isHardConstraint: boolean;
  isViolated?: boolean;
  violationDegree?: number;
}

export interface AssumptionData {
  id?: string;
  statement: string;
  justification: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  isVerified: boolean;
  impactIfInvalid: string;
}

export interface AlternativeData {
  id?: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  score: number;
  status: "CONSIDERED" | "SELECTED" | "REJECTED";
  rejectionReason?: string;
}

export interface TradeoffData {
  id?: string;
  criterion: string;
  alternativeAId: string;
  alternativeBId: string;
  comparisonDetails: string;
  impactAnalysis?: Record<string, unknown>;
  selectedOption?: string;
}

export interface ConflictData {
  id?: string;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  description: string;
  entitiesInvolved: string[];
  mitigationRecommendation: string;
  isResolved?: boolean;
}

export interface MissingEvidenceData {
  id?: string;
  missingItem: string;
  category: string;
  impact: string;
  requiredSource: string;
}

export interface CausalReasoningData {
  sourceEntityId: string;
  targetEntityId: string;
  causalFactor: string;
  propagationImpact: string;
  probability: number;
}

export interface EngineeringConclusionData {
  id?: string;
  statement: string;
  confidenceScore: number;
  supportingEvidenceIds: string[];
  appliedPrincipleIds: string[];
  tradeoffIds: string[];
  unresolvedUncertainties: string[];
  isSupportedByEvidence: boolean;
  recommendation: string;
}

export interface ReasoningStepData {
  id?: string;
  stageIndex: number;
  stageName: ReasoningStageName;
  status: "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";
  inputData?: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  durationMs?: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ReasoningGraphData {
  nodes: Array<{
    id: string;
    nodeType: ReasoningNodeType;
    label: string;
    entityId?: string | null;
    properties?: Record<string, unknown> | null;
    confidence?: number | null;
    weight?: number | null;
  }>;
  edges: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    edgeType: ReasoningEdgeType;
    justification: string;
    weight?: number | null;
  }>;
}

export interface ReasoningSignoffData {
  id?: string;
  sessionId: string;
  userId: string;
  userName?: string;
  status: "APPROVED" | "REJECTED" | "CHALLENGED";
  comments: string;
  createdAt?: string;
}

export interface DecisionTreeNode {
  id: string;
  label: string;
  nodeType: "PROBLEM" | "CONSTRAINT_CHECK" | "PRINCIPLE_CHECK" | "ALTERNATIVE_BRANCH" | "DECISION_OUTCOME";
  status: "PASSED" | "FAILED" | "PENDING" | "SELECTED";
  details: string;
  children?: DecisionTreeNode[];
}

export interface ReasoningExplanationPayload {
  sessionId: string;
  title: string;
  problemStatement: string;
  status: ReasoningSessionStatus;
  confidenceScore: number;
  isSupportedByEvidence: boolean;
  conclusion: EngineeringConclusionData | null;
  evidenceUsed: EvidenceWeightResult[];
  appliedPrinciples: EngineeringPrincipleData[];
  constraintsInfluencing: ConstraintData[];
  assumptionsMade: AssumptionData[];
  tradeoffsConsidered: TradeoffData[];
  rejectedAlternatives: AlternativeData[];
  missingEvidence: MissingEvidenceData[];
  causalReasoning: CausalReasoningData[];
  remainingUncertainties: string[];
  conflictsDetected: ConflictData[];
  signoffs: ReasoningSignoffData[];
  reasoningChainSteps: ReasoningStepData[];
}

export interface StartReasoningSessionInput {
  title: string;
  problemStatement: string;
  context?: {
    subjectEntityId?: string;
    relatedEvidenceIds?: string[];
    customConstraints?: Array<{ name: string; category: string; description: string; limitValue?: number; unit?: string; isHardConstraint?: boolean }>;
    preferredPrinciples?: string[];
    parameters?: Record<string, unknown>;
  };
}

export interface ReasoningSearchInput {
  query: string;
  domain?: string;
  limit?: number;
}

export interface ReasoningSearchResult {
  query: string;
  answer: string;
  confidenceScore: number;
  isSupportedByEvidence: boolean;
  citedEvidence: Array<{ id: string; title: string; weight: number }>;
  appliedPrinciples: Array<{ code: string; name: string }>;
  uncertainties: string[];
}
