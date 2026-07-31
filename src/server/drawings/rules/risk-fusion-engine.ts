import {
  DrawingMetadata,
  ExtractedCallout,
  FusedDrawingRiskResult,
  ExplainabilityItem,
  CategoryRiskBreakdown,
  LayerAssessment,
  RiskCategoryName,
} from "./types";
import { ManufacturingRuleEngine } from "./manufacturing-rule-engine";
import { queryHistoricalEvidence } from "./historical-evidence-engine";

/**
 * Staff-Level Risk Fusion Engine
 * Implements the 3-layer risk formula:
 * Risk = Historical Risk + Engineering Difficulty + Inspection Difficulty + Manufacturing Complexity + Supplier Complexity + Material Risk
 * Fuses Historical Evidence, Engineering Heuristics, and Manufacturing Knowledge.
 */
export async function computeFusedDrawingRisk(
  metadata: DrawingMetadata,
  callouts: ExtractedCallout[],
  organizationId?: string,
): Promise<FusedDrawingRiskResult> {
  const ruleEngine = new ManufacturingRuleEngine();

  // 1. Evaluate Rule Engine across metadata and extracted callouts
  const triggeredRules = ruleEngine.evaluateRules(metadata, callouts);

  // 2. Query Historical Evidence Engine
  const historicalEvidence = await queryHistoricalEvidence(organizationId, metadata, callouts);

  // 3. Calculate Risk Components (0 to 100 scale)
  let engineeringDifficulty = 15;
  let inspectionDifficulty = 10;
  let manufacturingComplexity = 15;
  let supplierComplexity = 10;
  let materialRisk = 10;

  for (const rule of triggeredRules) {
    engineeringDifficulty += rule.impacts.engineeringDifficultyDelta;
    inspectionDifficulty += rule.impacts.inspectionDifficultyDelta;
    manufacturingComplexity += rule.impacts.manufacturingComplexityDelta;
    supplierComplexity += rule.impacts.supplierComplexityDelta;
    materialRisk += rule.impacts.materialRiskDelta;
  }

  // Cap sub-components at 100
  engineeringDifficulty = Math.min(100, Math.round(engineeringDifficulty));
  inspectionDifficulty = Math.min(100, Math.round(inspectionDifficulty));
  manufacturingComplexity = Math.min(100, Math.round(manufacturingComplexity));
  supplierComplexity = Math.min(100, Math.round(supplierComplexity));
  materialRisk = Math.min(100, Math.round(materialRisk));
  const historicalRisk = Math.min(100, historicalEvidence.historicalRiskScore);

  // 4. Calculate Composite Formula:
  // Risk = Historical Risk + Engineering Difficulty + Inspection Difficulty + Manufacturing Complexity + Supplier Complexity + Material Risk
  // Weighted normalized total (0 to 100 scale)
  const rawSum =
    0.2 * historicalRisk +
    0.2 * engineeringDifficulty +
    0.15 * inspectionDifficulty +
    0.2 * manufacturingComplexity +
    0.1 * supplierComplexity +
    0.15 * materialRisk;

  const overallRiskScore = Math.min(100, Math.max(0, Math.round(rawSum)));
  const overallRiskLevel = getRiskLevel(overallRiskScore);

  // 5. Calculate Confidence Metrics
  const historicalConfidence = historicalEvidence.historicalConfidence;
  const engineeringConfidence = triggeredRules.length > 0 ? 0.9 : 0.75;
  const overallConfidence = parseFloat(
    (0.4 * historicalConfidence + 0.6 * engineeringConfidence).toFixed(2),
  );

  // 6. Build 3 Layer Assessments
  const historicalAssessment: LayerAssessment = {
    score: historicalRisk,
    level: getRiskLevel(historicalRisk),
    confidence: historicalConfidence,
    confidenceLabel: getConfidenceLabel(historicalConfidence),
    summary: historicalEvidence.summary,
  };

  const engineeringAssessment: LayerAssessment = {
    score: Math.round((engineeringDifficulty + manufacturingComplexity + inspectionDifficulty) / 3),
    level: getRiskLevel(
      Math.round((engineeringDifficulty + manufacturingComplexity + inspectionDifficulty) / 3),
    ),
    confidence: engineeringConfidence,
    confidenceLabel: getConfidenceLabel(engineeringConfidence),
    summary: `Evaluated ${triggeredRules.length} deterministic manufacturing rules across GD&T tolerances, tool geometry, and material behavior. Key drivers: ${triggeredRules.map((r) => r.ruleName).join(", ") || "Standard machining tolerances"}.`,
  };

  const overallAssessment: LayerAssessment = {
    score: overallRiskScore,
    level: overallRiskLevel,
    confidence: overallConfidence,
    confidenceLabel: getConfidenceLabel(overallConfidence),
    summary: `Composite 3-Layer Risk Rating: ${overallRiskLevel} (${overallRiskScore}/100). ${triggeredRules.length > 0 ? `Primary risk driver: ${triggeredRules[0].ruleName}.` : "No critical manufacturability flags detected."} Confidence: ${getConfidenceLabel(overallConfidence)} (${Math.round(overallConfidence * 100)}%).`,
  };

  // 7. Calculate 8 Risk Categories
  const categoryBreakdown: CategoryRiskBreakdown[] = [
    {
      category: "Manufacturing Risk",
      score: manufacturingComplexity,
      level: getRiskLevel(manufacturingComplexity),
      keyDrivers: triggeredRules
        .filter(
          (r) =>
            r.processDomain === "CNC_MILLING" ||
            r.processDomain === "TURNING" ||
            r.processDomain === "GENERAL_GD_AND_T",
        )
        .map((r) => r.ruleName),
    },
    {
      category: "Inspection Risk",
      score: inspectionDifficulty,
      level: getRiskLevel(inspectionDifficulty),
      keyDrivers: triggeredRules
        .filter(
          (r) => r.processDomain === "INSPECTION" || r.impacts.inspectionDifficultyDelta >= 20,
        )
        .map((r) => r.ruleName),
    },
    {
      category: "Material Risk",
      score: materialRisk,
      level: getRiskLevel(materialRisk),
      keyDrivers: triggeredRules
        .filter(
          (r) => r.processDomain === "MATERIAL_SELECTION" || r.impacts.materialRiskDelta >= 15,
        )
        .map((r) => r.ruleName),
    },
    {
      category: "Supply Chain Risk",
      score: supplierComplexity,
      level: getRiskLevel(supplierComplexity),
      keyDrivers: triggeredRules
        .filter((r) => r.impacts.supplierComplexityDelta >= 15)
        .map((r) => r.ruleName),
    },
    {
      category: "Assembly Risk",
      score: Math.round(engineeringDifficulty * 0.7 + inspectionDifficulty * 0.3),
      level: getRiskLevel(Math.round(engineeringDifficulty * 0.7 + inspectionDifficulty * 0.3)),
      keyDrivers: ["Datum stackup alignment", "Interface fastener clearances"],
    },
    {
      category: "Quality Risk",
      score: Math.round(historicalRisk * 0.5 + manufacturingComplexity * 0.5),
      level: getRiskLevel(Math.round(historicalRisk * 0.5 + manufacturingComplexity * 0.5)),
      keyDrivers: [
        `Scrap probability increment: +${triggeredRules.reduce((acc, r) => acc + r.impacts.scrapProbabilityDelta, 0)}%`,
      ],
    },
    {
      category: "Cost Risk",
      score: Math.round(materialRisk * 0.4 + manufacturingComplexity * 0.6),
      level: getRiskLevel(Math.round(materialRisk * 0.4 + manufacturingComplexity * 0.6)),
      keyDrivers: ["Specialized tooling shanks", "Secondary finishing passes"],
    },
    {
      category: "Lead Time Risk",
      score: Math.round(supplierComplexity * 0.5 + inspectionDifficulty * 0.5),
      level: getRiskLevel(Math.round(supplierComplexity * 0.5 + inspectionDifficulty * 0.5)),
      keyDrivers: ["CMM programming & gauge calibration", "Sub-tier heat-treat lead time"],
    },
  ];

  // 8. Build Explainability Items for Callouts & Rules
  const explainability: ExplainabilityItem[] = [];

  // Map triggered rules to explainability items
  triggeredRules.forEach((rule, idx) => {
    explainability.push({
      id: `exp-rule-${idx}`,
      featureCallout: rule.evidence || rule.ruleName,
      why: rule.why,
      evidence: rule.evidence,
      ruleTriggered: `${rule.ruleName} (${rule.ruleId})`,
      ruleId: rule.ruleId,
      historicalPrecedentUsed:
        historicalEvidence.matchedPrecedentsCount > 0
          ? historicalEvidence.summary
          : "No historical manufacturing evidence available - synthesized via engineering heuristics",
      recommendation: rule.recommendation,
      category: getCategoryForDomain(rule.processDomain),
      riskRating: rule.impacts.manufacturingComplexityDelta >= 30 ? "HIGH" : "MEDIUM",
      engineeringConfidence,
      historicalConfidence,
      overallConfidence,
    });
  });

  // If no rules were triggered, create a clean default explainability item
  if (explainability.length === 0) {
    explainability.push({
      id: "exp-clean-default",
      featureCallout: `${metadata.partNumber} - Nominal Tolerances`,
      why: "All extracted tolerances and geometric features fall within standard CNC machining capabilities (ISO 2768-m / ASME Y14.5 standard tolerances).",
      evidence: `Material: ${metadata.material}, Standard: ${metadata.drawingStandard}`,
      ruleTriggered: "Standard Nominal Manufacturability Check",
      ruleId: "RULE_NOMINAL_PASS",
      historicalPrecedentUsed:
        historicalEvidence.matchedPrecedentsCount > 0
          ? historicalEvidence.summary
          : "No historical manufacturing evidence available - synthesized via engineering heuristics",
      recommendation:
        "Proceed with standard 3-axis CNC milling setup. Perform first-piece CMM inspection.",
      category: "Manufacturing Risk",
      riskRating: "LOW",
      engineeringConfidence,
      historicalConfidence,
      overallConfidence,
    });
  }

  return {
    metadata,
    callouts,
    overallRiskScore,
    overallRiskLevel,
    confidenceMetrics: {
      historicalConfidence,
      engineeringConfidence,
      overallConfidence,
    },
    assessments: {
      historicalAssessment,
      engineeringAssessment,
      overallAssessment,
    },
    riskBreakdown: {
      historicalRisk,
      engineeringDifficulty,
      inspectionDifficulty,
      manufacturingComplexity,
      supplierComplexity,
      materialRisk,
    },
    categoryBreakdown,
    explainability,
    triggeredRules,
  };
}

function getRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

function getConfidenceLabel(confidence: number): "High" | "Medium" | "Low" {
  if (confidence >= 0.8) return "High";
  if (confidence >= 0.5) return "Medium";
  return "Low";
}

function getCategoryForDomain(domain: string): RiskCategoryName {
  switch (domain) {
    case "MATERIAL_SELECTION":
      return "Material Risk";
    case "INSPECTION":
      return "Inspection Risk";
    case "SUPPLIER_COMPLEXITY":
      return "Supply Chain Risk";
    default:
      return "Manufacturing Risk";
  }
}
