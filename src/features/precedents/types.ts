/* eslint-disable @typescript-eslint/no-explicit-any */
export type PrecedentType =
  "FAILURE" | "SUCCESSFUL_DESIGN" | "REGULATORY_PRECEDENT" | "SUPPLIER_HISTORY";

export interface PrecedentVersionHistory {
  id: string;
  version: number;
  title: string;
  summary: string;
  decisionMade: string;
  outcome: string;
  lessonsLearned: string;
  createdAt: string;
  changeDescription?: string | null;
  createdById?: string | null;
}

export interface HistoricalPrecedentAuditLog {
  action: string;
  performedBy: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface EngineeringPrecedent {
  id: string;
  organizationId: string;
  title: string;
  summary: string;
  engineeringQuestion: string;
  decisionMade: string;
  supportingEvidence: string[]; // List of supporting evidence strings
  contradictions: string[]; // List of contradictions found
  missingEvidence: string[]; // List of missing evidence descriptions
  outcome: string;
  lessonsLearned: string;
  relatedProjects: string[];
  relatedSuppliers: string[];
  relatedRequirements: string[];
  relatedDocuments: string[];
  relatedComponents: string[];
  relatedStandards: string[];
  relatedCertifications: string[];
  decisionDate: string;
  decisionOwnerId?: string | null;
  decisionOwner?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  confidence: number;
  tags: string[];
  auditMetadata: HistoricalPrecedentAuditLog[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  versions?: PrecedentVersionHistory[];

  // Dynamic similarity attributes returned by matching engine
  similarityScore?: number; // 0 to 100
  matchExplanation?: string[]; // Array of reasons why it matched

  // Quality and Manufacturing metrics
  qualityMetrics?: {
    totalNCRs: number;
    totalECOs: number;
    averageScrapRate: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
  };

  // --- Legacy Compatibility Fields ---
  type: PrecedentType;
  description: string;
  rootCause?: string;
  correctiveAction?: string;
  resolutionStatus: string;
  confidenceScore: number;
  applicableSystems: string[];
  evidenceMetadata?: {
    documents?: string[];
    standards?: string[];
    testReports?: string[];
  };
  whyRelevant?: string;
  evidenceStrength?: number;
  linkedEntities?: { id: string; name: string; type: string; identifier: string }[];
  relatedFailures?: string[];
  relatedCorrectiveActions?: string[];
  engineeringStandards?: string[];
  graphRelationshipsTraversed?: string[];
  rulesEvaluated?: string[];
  assumptionsRejected?: string[];
  versionHistory?: { id: string; version: string; description: string; createdAt: string }[];
  auditTrail?: { id: string; action: string; metadata: unknown; createdAt: string }[];
}

export interface PrecedentQuery {
  search?: string;
  type?: string;
  system?: string;
  supplier?: string;
  requirement?: string;
  component?: string;
  project?: string;
  certification?: string;
  standard?: string;
  owner?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type Precedent = EngineeringPrecedent;
export type PrecedentFilter = PrecedentQuery;

export interface PrecedentCreateInput {
  title: string;
  summary: string;
  engineeringQuestion?: string;
  decisionMade: string;
  outcome?: string;
  lessonsLearned?: string;
  relatedProjects?: string[];
  relatedSuppliers?: string[];
  relatedRequirements?: string[];
  relatedDocuments?: string[];
  relatedComponents?: string[];
  relatedStandards?: string[];
  relatedCertifications?: string[];
  tags?: string[];
  type?: PrecedentType;
  description?: string;
  rootCause?: string;
  correctiveAction?: string;
  resolutionStatus?: string;
  confidenceScore?: number;
  applicableSystems?: string[];
}

export type PrecedentUpdateInput = Partial<PrecedentCreateInput>;

export interface PrecedentMatchContext {
  question?: string;
  componentName?: string;
  systemName?: string;
  supplierId?: string;
  suppliers?: string[];
  components?: string[];
  requirements?: string[];
  standards?: string[];
  certifications?: string[];
  documents?: string[];
  contradictions?: string[];
  evidence?: string[];
  missingEvidence?: string[];
  project?: string;
  tags?: string[];
}

export interface MatchedPrecedent {
  precedent: EngineeringPrecedent;
  similarityScore: number;
  whyRelevant: string;
  matchingFactors: string[];
  matchReasons?: string[];
  id?: string;
  title?: string;
  summary?: string;
}

export interface PrecedentSearchResult {
  precedents: MatchedPrecedent[];
  totalMatches: number;
}
