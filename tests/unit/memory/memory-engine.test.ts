import { describe, it, expect } from "vitest";
import {
  captureComprehensiveDecision,
  invalidateAssumption,
  getRejectedAlternatives,
  harvestLessonsLearned,
  generateEngineeringTimeline,
} from "../../../src/server/memory/memory-engine";

describe("Phase 3: Deterministic Engineering Memory Engine Test Suite", () => {
  const sampleOrgId = "org-test-memory-engine-101";
  const sampleUserId = "user-test-engineer-101";

  it("captures comprehensive decision with options, rejected alternatives, assumptions, and snapshots", async () => {
    const decisionResult = await captureComprehensiveDecision({
      organizationId: sampleOrgId,
      proposedById: sampleUserId,
      decisionType: "MATERIAL_SUB",
      problemStatement:
        "Replace Inconel 718 with Titanium 6Al-4V to reduce propulsion manifold weight by 18%",
      rationale:
        "Titanium 6Al-4V meets ultimate yield requirements under 300C operating environment.",
      options: [
        {
          name: "Titanium 6Al-4V (Grade 5)",
          description: "High strength-to-weight ratio aerospace alloy.",
          isSelected: true,
          pros: ["18% weight reduction", "High corrosion resistance"],
          cons: ["Higher raw material cost"],
        },
        {
          name: "Aluminum 7075-T6",
          description: "Low density structural aluminum.",
          isSelected: false,
          rejectionReason: "Fails temperature degradation limits above 150C operating limit.",
          pros: ["Low cost"],
          cons: ["Low temperature threshold"],
        },
      ],
      assumptions: [
        {
          statement: "Operating temperature will not exceed 300C during peak thrust phase.",
          justification: "Thermal CFD simulation run #402.",
          riskLevel: "HIGH",
          impactIfInvalid: "Material yield strength drops by 35%, causing manifold distortion.",
          isVerified: true,
        },
      ],
      evidenceHashes: ["a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"],
      costImpact: 45000,
      scheduleImpactDays: 14,
    });

    expect(decisionResult).toBeDefined();
    expect(decisionResult.decision).toBeDefined();
    expect(decisionResult.alternatives.length).toBe(2);
    expect(decisionResult.assumptions.length).toBe(1);
  });

  it("invalidates assumption and returns downstream invalidation impact report", async () => {
    const report = await invalidateAssumption({
      organizationId: sampleOrgId,
      assumptionId: "asm-test-101",
      invalidatedById: sampleUserId,
      reasonForInvalidation:
        "New thermal sensor log shows peak transient temperature reached 340C.",
    });

    expect(report).toBeDefined();
    expect(report.status).toBe("INVALIDATED");
    expect(report.reason).toContain("340C");
    expect(Array.isArray(report.affectedDecisions)).toBe(true);
    expect(Array.isArray(report.affectedComponents)).toBe(true);
  });

  it("queries rejected alternatives to prevent repeating rejected work", async () => {
    const rejectedList = await getRejectedAlternatives(sampleOrgId, "Aluminum");
    expect(Array.isArray(rejectedList)).toBe(true);
  });

  it("harvests institutional lessons learned from precedents and quality events", async () => {
    const lessons = await harvestLessonsLearned(sampleOrgId);
    expect(Array.isArray(lessons)).toBe(true);
  });

  it("generates chronological engineering timeline stream", async () => {
    const timeline = await generateEngineeringTimeline(sampleOrgId);
    expect(Array.isArray(timeline)).toBe(true);
  });
});
