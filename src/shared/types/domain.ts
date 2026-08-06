export type DomainEntityType =
  | "ENGINEERING_DECISION"
  | "REQUIREMENT"
  | "COMPONENT"
  | "ASSEMBLY"
  | "MATERIAL"
  | "SUPPLIER"
  | "MANUFACTURING_PROCESS"
  | "PROJECT"
  | "PROGRAM"
  | "PART"
  | "STANDARD"
  | "REGULATION"
  | "FAILURE_EVENT"
  | "QUALITY_EVENT"
  | "ENGINEERING_DOCUMENT"
  | "TEST_REPORT"
  | "SIMULATION_RESULT"
  | "FIELD_REPORT"
  | "DESIGN_REVIEW"
  | "RISK"
  | "CORRECTIVE_ACTION"
  | "CHANGE_REQUEST"
  | "USER"
  | "EVIDENCE_SOURCE";

export type DomainRelationshipType =
  | "AFFECTS"
  | "SUPPLIED_BY"
  | "JUSTIFIED_BY"
  | "CAUSED_BY"
  | "SATISFIED_BY"
  | "IMPACTS"
  | "SUPERSEDES"
  | "ASSOCIATED_WITH"
  | "CONTAINS"
  | "VERIFIED_BY"
  | "GOVERNED_BY"
  | "DERIVED_FROM"
  | "MITIGATES";

export interface EvidenceProvenance {
  sourceDocumentId?: string;
  sourceFileName?: string;
  page?: number;
  section?: string;
  paragraph?: number;
  rawText?: string;
  confidence: number; // 0.0 to 1.0
  extractionMethod?: string;
  extractedAt: string;
}

export interface EntityAuditLogEntry {
  id: string;
  action: string;
  performedById?: string;
  performedByName?: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface EntityVersionEntry {
  id: string;
  version: string | number;
  snapshot: Record<string, unknown>;
  changeDescription?: string;
  createdById?: string;
  createdAt: string;
}

export interface BaseDomainEntity {
  id: string;
  organizationId: string;
  entityType: DomainEntityType;
  identifier: string;
  name: string;
  description?: string | null;
  version: string;
  status: string;
  tags?: string[];
  labels?: Record<string, string>;
  metadata?: Record<string, unknown>;
  createdById?: string | null;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  provenance?: EvidenceProvenance;
  auditTrail?: EntityAuditLogEntry[];
  versionHistory?: EntityVersionEntry[];
}

export interface EngineeringDecisionEntity extends BaseDomainEntity {
  entityType: "ENGINEERING_DECISION";
  question: string;
  decisionMade: string;
  rationale: string;
  decisionType:
    "TOLERANCE_CHANGE" | "MATERIAL_SUB" | "SUPPLIER_CHANGE" | "PROCESS_CHANGE" | "DESIGN_RELEASE";
  affectedComponentIds: string[];
  justifyingEvidenceIds: string[];
  supersededDecisionIds?: string[];
  outcome?: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILURE" | "PENDING";
  costImpact?: number;
  scheduleImpactDays?: number;
}

export interface RequirementEntity extends BaseDomainEntity {
  entityType: "REQUIREMENT";
  requirementCode: string;
  specificationText: string;
  thresholdValue?: number;
  unit?: string;
  governingStandardId?: string;
  satisfiedByDesignIds: string[];
}

export interface ComponentEntity extends BaseDomainEntity {
  entityType: "COMPONENT";
  partNumber: string;
  materialId?: string;
  suppliedBySupplierIds: string[];
  massKg?: number;
  cadFileKey?: string;
}

export interface SupplierEntity extends BaseDomainEntity {
  entityType: "SUPPLIER";
  cageCode?: string;
  duns?: string;
  supplierType: "MANUFACTURER" | "DISTRIBUTOR" | "SUBCONTRACTOR" | "RAW_MATERIAL";
  qualityRating: number; // 0.0 to 5.0
  associatedFailureIds: string[];
  certifications: string[];
}

export interface FailureEventEntity extends BaseDomainEntity {
  entityType: "FAILURE_EVENT";
  failureCode: string;
  rootCauseDescription: string;
  causedByMaterialId?: string;
  causedByProcessId?: string;
  ncrNumber?: string;
  scrapCostImpact?: number;
}

export interface EngineeringRelationshipLink {
  id: string;
  organizationId: string;
  relationshipType: DomainRelationshipType;
  sourceEntityId: string;
  sourceEntityType: DomainEntityType;
  targetEntityId: string;
  targetEntityType: DomainEntityType;
  metadata?: Record<string, unknown>;
  createdById?: string;
  createdAt: string;
}
