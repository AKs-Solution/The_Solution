export type MaterialFamily =
  | "ALUMINUM"
  | "TITANIUM"
  | "INCONEL"
  | "STAINLESS_STEEL"
  | "CARBON_STEEL"
  | "MAGNESIUM"
  | "COPPER_BRASS"
  | "PLASTIC_POLYMER"
  | "COMPOSITE"
  | "OTHER";

export type DrawingStandard = "ASME_Y14_5" | "ISO_GPS" | "ANSI_Y14_5M" | "UNKNOWN";

export type ProcessDomain =
  | "CNC_MILLING"
  | "TURNING"
  | "SHEET_METAL"
  | "INJECTION_MOLDING"
  | "CASTING"
  | "FORGING"
  | "ADDITIVE_MANUFACTURING"
  | "GENERAL_GD_AND_T"
  | "MATERIAL_SELECTION"
  | "INSPECTION";

export interface DrawingMetadata {
  partNumber: string;
  revision: string;
  sheet?: string;
  material: string;
  materialFamily: MaterialFamily;
  finish?: string;
  weight?: string;
  scale?: string;
  units: "mm" | "inches";
  drawingStandard: DrawingStandard;
  gdtStandard?: string;
  datums: string[];
  notes: string[];
  holeTables: string[];
  threads: string[];
  weldSymbols: string[];
  surfaceFinishSymbols: string[];
  generalToleranceBlock?: string;
}

export type GDTCharacteristic =
  | "FLATNESS"
  | "STRAIGHTNESS"
  | "CIRCULARITY"
  | "CYLINDRICITY"
  | "PERPENDICULARITY"
  | "PARALLELISM"
  | "ANGULARITY"
  | "PROFILE_SURFACE"
  | "PROFILE_LINE"
  | "POSITION"
  | "CONCENTRICITY"
  | "SYMMETRY"
  | "CIRCULAR_RUNOUT"
  | "TOTAL_RUNOUT"
  | "HOLE_FIT"
  | "SURFACE_ROUGHNESS"
  | "POCKET_ASPECT_RATIO"
  | "WALL_THICKNESS"
  | "THREAD_SPEC"
  | "DIMENSION_GENERIC";

export interface ExtractedCallout {
  id: string;
  rawText: string;
  characteristic: GDTCharacteristic;
  numericValue: number; // e.g. 0.03 for flatness 0.03mm
  unit: "mm" | "inches";
  modifier?: "MMC" | "LMC" | "RFS";
  datumsReferenced: string[]; // e.g. ["A", "B", "C"]
  featureType?: "HOLE" | "POCKET" | "WALL" | "SURFACE" | "THREAD" | "BORE" | "GENERAL";
  aspectRatio?: number; // Depth to diameter / cutter ratio
  wallThicknessMm?: number;
  surfaceFinishRa?: number; // Ra in µm
}

export interface RuleImpacts {
  manufacturingComplexityDelta: number; // 0 to 40
  engineeringDifficultyDelta: number; // 0 to 40
  inspectionDifficultyDelta: number; // 0 to 40
  supplierComplexityDelta: number; // 0 to 30
  materialRiskDelta: number; // 0 to 40
  scrapProbabilityDelta: number; // percentage increment, e.g. 15 for +15%
}

export interface RuleTriggerResult {
  ruleId: string;
  ruleName: string;
  processDomain: ProcessDomain;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidenceScore: number; // 0.0 to 1.0
  impacts: RuleImpacts;
  why: string;
  evidence: string;
  recommendation: string;
}

export interface ExplainabilityItem {
  id: string;
  featureCallout: string;
  why: string;
  evidence: string;
  ruleTriggered: string;
  ruleId: string;
  historicalPrecedentUsed: string; // Precedent details or "No historical manufacturing evidence available - synthesized via engineering heuristics"
  recommendation: string;
  category: RiskCategoryName;
  riskRating: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  engineeringConfidence: number; // 0.0 to 1.0
  historicalConfidence: number; // 0.0 to 1.0
  overallConfidence: number; // 0.0 to 1.0
}

export type RiskCategoryName =
  | "Manufacturing Risk"
  | "Inspection Risk"
  | "Material Risk"
  | "Supply Chain Risk"
  | "Assembly Risk"
  | "Quality Risk"
  | "Cost Risk"
  | "Lead Time Risk";

export interface CategoryRiskBreakdown {
  category: RiskCategoryName;
  score: number; // 0 to 100
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  keyDrivers: string[];
}

export interface LayerAssessment {
  score: number; // 0 to 100
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number; // 0.0 to 1.0
  confidenceLabel: "High" | "Medium" | "Low";
  summary: string;
}

export interface FusedDrawingRiskResult {
  metadata: DrawingMetadata;
  callouts: ExtractedCallout[];
  overallRiskScore: number; // 0 to 100
  overallRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidenceMetrics: {
    historicalConfidence: number; // 0.0 to 1.0
    engineeringConfidence: number; // 0.0 to 1.0
    overallConfidence: number; // 0.0 to 1.0
  };
  assessments: {
    historicalAssessment: LayerAssessment;
    engineeringAssessment: LayerAssessment;
    overallAssessment: LayerAssessment;
  };
  riskBreakdown: {
    historicalRisk: number;
    engineeringDifficulty: number;
    inspectionDifficulty: number;
    manufacturingComplexity: number;
    supplierComplexity: number;
    materialRisk: number;
  };
  categoryBreakdown: CategoryRiskBreakdown[];
  explainability: ExplainabilityItem[];
  triggeredRules: RuleTriggerResult[];
}
