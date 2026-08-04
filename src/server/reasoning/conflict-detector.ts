import {
  AlternativeData,
  AssumptionData,
  ConflictData,
  ConstraintData,
  EngineeringPrincipleData,
  EvidenceInput,
  TradeoffData,
} from "./types";

export interface ConflictDetectionInput {
  evidenceList: EvidenceInput[];
  principles: EngineeringPrincipleData[];
  constraints: ConstraintData[];
  assumptions: AssumptionData[];
  alternatives: AlternativeData[];
  tradeoffs: TradeoffData[];
}

/**
 * Runs full conflict detection algorithm across all inputs.
 */
export function detectReasoningConflicts(input: ConflictDetectionInput): ConflictData[] {
  const conflicts: ConflictData[] = [];

  // 1. Detect Conflicting Evidence
  for (let i = 0; i < input.evidenceList.length; i++) {
    for (let j = i + 1; j < input.evidenceList.length; j++) {
      const e1 = input.evidenceList[i];
      const e2 = input.evidenceList[j];
      if (
        e1.hasConflict ||
        e2.hasConflict ||
        (e1.content && e2.content && checkOpposingContent(e1.content, e2.content))
      ) {
        conflicts.push({
          conflictType: "EVIDENCE_CONTRADICTION",
          severity: "HIGH",
          description: `Evidence contradiction detected between '${e1.title}' and '${e2.title}'.`,
          entitiesInvolved: [e1.id, e2.id],
          mitigationRecommendation:
            "Perform independent empirical validation testing to resolve discrepant evidence.",
          isResolved: false,
        });
      }
    }
  }

  // 2. Detect Constraint Violations
  for (const c of input.constraints) {
    if (
      c.isViolated ||
      (c.limitValue !== undefined && c.violationDegree && c.violationDegree > 0)
    ) {
      conflicts.push({
        conflictType: "CONSTRAINT_VIOLATION",
        severity: c.isHardConstraint ? "CRITICAL" : "MEDIUM",
        description: `Constraint '${c.name}' (${c.category}) is violated by degree ${c.violationDegree ?? 1.0}. ${c.description}`,
        entitiesInvolved: [c.id || c.name],
        mitigationRecommendation: c.isHardConstraint
          ? "Hard constraint violation requires design redesign or material specification change."
          : "Soft constraint violation requires formal waiver or tradeoff adjustment.",
        isResolved: false,
      });
    }
  }

  // 3. Detect Unsupported Assumptions
  for (const a of input.assumptions) {
    if (!a.isVerified && (a.riskLevel === "HIGH" || a.riskLevel === "CRITICAL")) {
      conflicts.push({
        conflictType: "UNSUPPORTED_ASSUMPTION",
        severity: a.riskLevel,
        description: `High-risk assumption '${a.statement}' is unverified. Impact if invalid: ${a.impactIfInvalid}`,
        entitiesInvolved: [a.id || a.statement],
        mitigationRecommendation:
          "Validate assumption with empirical test data or simulation prior to sign-off.",
        isResolved: false,
      });
    }
  }

  // 4. Detect Outdated Evidence
  const NOW = Date.now();
  const FIVE_YEARS_MS = 5 * 365.25 * 24 * 3600 * 1000;
  for (const e of input.evidenceList) {
    if (e.recencyDate && NOW - new Date(e.recencyDate).getTime() > FIVE_YEARS_MS) {
      conflicts.push({
        conflictType: "OUTDATED_EVIDENCE",
        severity: "LOW",
        description: `Evidence '${e.title}' is older than 5 years (${e.recencyDate}) and may not reflect current standards.`,
        entitiesInvolved: [e.id],
        mitigationRecommendation: "Re-verify test results against modern standard specifications.",
        isResolved: false,
      });
    }
  }

  // 5. Detect Incompatible Engineering Principles
  const categories = input.principles.map((p) => p.category);
  if (categories.includes("Thermal") && categories.includes("Structural")) {
    const thermalP = input.principles.find((p) => p.code === "PRIN-THERMAL-EXP");
    const structP = input.principles.find((p) => p.code === "PRIN-BUCKLING");
    if (thermalP && structP) {
      conflicts.push({
        conflictType: "PRINCIPLE_INCOMPATIBILITY",
        severity: "MEDIUM",
        description:
          "Interaction conflict between Thermal Expansion and Structural Buckling under thermal gradient.",
        entitiesInvolved: [thermalP.code, structP.code],
        mitigationRecommendation: "Evaluate thermal stress accumulation in buckling analysis.",
        isResolved: false,
      });
    }
  }

  // 6. Detect Circular Reasoning (simulated check for node self-dependencies or feedback loops)
  for (const t of input.tradeoffs) {
    if (t.alternativeAId === t.alternativeBId) {
      conflicts.push({
        conflictType: "CIRCULAR_REASONING",
        severity: "HIGH",
        description: `Tradeoff evaluation '${t.criterion}' compares an alternative against itself (${t.alternativeAId}).`,
        entitiesInvolved: [t.alternativeAId],
        mitigationRecommendation: "Compare distinct design alternatives in tradeoff matrix.",
        isResolved: false,
      });
    }
  }

  return conflicts;
}

function checkOpposingContent(c1: string, c2: string): boolean {
  const l1 = c1.toLowerCase();
  const l2 = c2.toLowerCase();
  if (
    (l1.includes("pass") && l2.includes("fail")) ||
    (l1.includes("fail") && l2.includes("pass"))
  ) {
    return true;
  }
  if (
    (l1.includes("safe") && l2.includes("unsafe")) ||
    (l1.includes("unsafe") && l2.includes("safe"))
  ) {
    return true;
  }
  return false;
}
