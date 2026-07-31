import { describe, it, expect } from "vitest";
import { parseGDTCallouts } from "../../../src/server/drawings/gdt-parser";
import { ManufacturingRuleEngine } from "../../../src/server/drawings/rules/manufacturing-rule-engine";
import { computeFusedDrawingRisk } from "../../../src/server/drawings/rules/risk-fusion-engine";
import { DrawingMetadata } from "../../../src/server/drawings/rules/types";

describe("Drawing Manufacturing Rule Engine & Risk Fusion", () => {
  const sampleMetadata: DrawingMetadata = {
    partNumber: "AFT_BRACKET_1032",
    revision: "B",
    material: "Titanium Ti-6Al-4V",
    materialFamily: "TITANIUM",
    finish: "Hard Anodize Type III",
    units: "mm",
    drawingStandard: "ASME_Y14_5",
    datums: ["A", "B", "C"],
    notes: ["1. Deburr all edges."],
    holeTables: [],
    threads: ["M6x1.0"],
    weldSymbols: [],
    surfaceFinishSymbols: ["Ra 0.8 µm"],
  };

  it("parses tight flatness callout correctly", () => {
    const lines = ["Flatness < 0.03 mm relative to Datum A"];
    const callouts = parseGDTCallouts(lines);
    expect(callouts).toHaveLength(1);
    expect(callouts[0].characteristic).toBe("FLATNESS");
    expect(callouts[0].numericValue).toBe(0.03);
  });

  it("parses precision position callout with MMC", () => {
    const lines = ["Position Ø0.08 MMC relative to A|B|C"];
    const callouts = parseGDTCallouts(lines);
    expect(callouts).toHaveLength(1);
    expect(callouts[0].characteristic).toBe("POSITION");
    expect(callouts[0].numericValue).toBe(0.08);
    expect(callouts[0].modifier).toBe("MMC");
  });

  it("evaluates Titanium and Flatness manufacturing rules", () => {
    const ruleEngine = new ManufacturingRuleEngine();
    const callouts = parseGDTCallouts(["Flatness < 0.03 mm", "Position Ø0.08 MMC"]);
    const triggered = ruleEngine.evaluateRules(sampleMetadata, callouts);

    expect(triggered.length).toBeGreaterThanOrEqual(2);
    expect(triggered.some((r) => r.ruleId === "RULE_MAT_TITANIUM")).toBe(true);
    expect(triggered.some((r) => r.ruleId.includes("FLATNESS"))).toBe(true);
  });

  it("computes 3-layer risk fusion with 8 category breakdowns and explainability", async () => {
    const lines = [
      "Flatness < 0.03 mm",
      "Position Ø0.08 MMC relative to A B C",
      "Bore Ø12 H7 (+0.015/0)",
      "Surface finish Ra 0.8 µm",
      "Deep pocket depth 35mm cutter 6mm",
      "Thin wall 1.5mm",
    ];
    const callouts = parseGDTCallouts(lines);
    const fused = await computeFusedDrawingRisk(sampleMetadata, callouts);

    expect(fused.overallRiskScore).toBeGreaterThan(50);
    expect(["HIGH", "CRITICAL"]).toContain(fused.overallRiskLevel);

    // Verify 3 Layer Assessments exist and replace "No History"
    expect(fused.assessments.engineeringAssessment).toBeDefined();
    expect(fused.assessments.historicalAssessment).toBeDefined();
    expect(fused.assessments.overallAssessment).toBeDefined();
    expect(fused.assessments.engineeringAssessment.summary).not.toContain("No History");

    // Verify 8 Category Breakdowns exist
    expect(fused.categoryBreakdown).toHaveLength(8);
    expect(fused.categoryBreakdown.some((c) => c.category === "Manufacturing Risk")).toBe(true);
    expect(fused.categoryBreakdown.some((c) => c.category === "Inspection Risk")).toBe(true);
    expect(fused.categoryBreakdown.some((c) => c.category === "Material Risk")).toBe(true);

    // Verify Explainability items contain why, evidence, ruleTriggered, recommendation
    expect(fused.explainability.length).toBeGreaterThan(0);
    const exp = fused.explainability[0];
    expect(exp.why).toBeDefined();
    expect(exp.evidence).toBeDefined();
    expect(exp.ruleTriggered).toBeDefined();
    expect(exp.recommendation).toBeDefined();
  });
});
