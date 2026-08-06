import { describe, it, expect } from "vitest";
import { detectTechnicalDebt } from "../../../src/server/reasoning/technical-debt-engine";
import { calculateDecisionHealth } from "../../../src/server/reasoning/decision-health-calculator";
import { analyzeDependencyImpact } from "../../../src/server/reasoning/dependency-analyzer";
import { detectContradictionsAndGaps } from "../../../src/server/reasoning/contradiction-engine";
import { analyzeDesignEvolution } from "../../../src/server/reasoning/design-evolution-engine";

describe("Phase 4: Deterministic Engineering Reasoning & Technical Debt Test Suite", () => {
  const sampleOrgId = "org-reasoning-test-101";

  it("scans and detects technical debt categories with severity, confidence, and mitigations", async () => {
    const debtItems = await detectTechnicalDebt(sampleOrgId);
    expect(Array.isArray(debtItems)).toBe(true);
    expect(debtItems.length).toBeGreaterThan(0);

    const first = debtItems[0];
    expect(first).toHaveProperty("category");
    expect(first).toHaveProperty("severity");
    expect(first).toHaveProperty("confidence");
    expect(first).toHaveProperty("recommendedActions");
  });

  it("calculates 10-dimension explainable decision health score", async () => {
    const health = await calculateDecisionHealth(sampleOrgId, "decision-test-101");
    expect(health).toBeDefined();
    expect(health.overallScore).toBeGreaterThanOrEqual(0);
    expect(health.overallScore).toBeLessThanOrEqual(100);
    expect(health.dimensions).toHaveProperty("evidenceCompleteness");
    expect(health.dimensions).toHaveProperty("requirementCoverage");
    expect(health.dimensions).toHaveProperty("traceabilityCompleteness");
    expect(health.explanation.length).toBeGreaterThan(0);
  });

  it("executes multi-hop dependency and change impact analysis", async () => {
    const impact = await analyzeDependencyImpact(sampleOrgId, "decision-test-101");
    expect(impact).toBeDefined();
    expect(impact.dependentDecisions.length).toBeGreaterThan(0);
    expect(impact.affectedComponents.length).toBeGreaterThan(0);
    expect(impact.affectedSuppliers.length).toBeGreaterThan(0);
    expect(impact.riskAssessment).toHaveProperty("overallRisk");
  });

  it("detects contradictions and missing evidence knowledge gaps", async () => {
    const result = await detectContradictionsAndGaps(sampleOrgId);
    expect(result).toBeDefined();
    expect(Array.isArray(result.contradictions)).toBe(true);
    expect(Array.isArray(result.knowledgeGaps)).toBe(true);
    expect(result.contradictions.length).toBeGreaterThan(0);
    expect(result.knowledgeGaps.length).toBeGreaterThan(0);
  });

  it("reconstructs deterministic design evolution timeline explaining revision triggers", async () => {
    const evolution = await analyzeDesignEvolution(sampleOrgId, "FLG-840");
    expect(evolution).toBeDefined();
    expect(evolution.history.length).toBeGreaterThan(0);

    const latestRev = evolution.history[evolution.history.length - 1];
    expect(latestRev).toHaveProperty("revision");
    expect(latestRev).toHaveProperty("primaryReason");
  });
});
