import { describe, it, expect } from "vitest";
import {
  calculateEvidenceWeight,
  weightEvidenceCollection,
} from "@/server/reasoning/evidence-weighting";

describe("Evidence Weighting Engine", () => {
  it("calculates transparent evidence weight with independent confirmation bonus", () => {
    const evidence = {
      id: "ev-1",
      title: "Certified Tensile Strength Test",
      type: "TEST_REPORT",
      verificationLevel: 0.9,
      sourceQuality: 0.95,
      relevanceScore: 0.9,
      repeatabilityScore: 0.85,
      independentConfirmation: true,
      historicalAccuracy: 0.9,
    };

    const weight = calculateEvidenceWeight(evidence);

    expect(weight.evidenceId).toBe("ev-1");
    expect(weight.finalWeight).toBeGreaterThan(0.85);
    expect(weight.weightExplanation).toContain("independent confirmation boost");
  });

  it("applies conflict penalty when conflicting evidence exists", () => {
    const clearEvidence = {
      id: "ev-2",
      title: "Lab Test A",
      type: "TEST_REPORT",
      verificationLevel: 0.8,
      sourceQuality: 0.8,
      hasConflict: false,
    };

    const conflictingEvidence = {
      ...clearEvidence,
      id: "ev-3",
      title: "Lab Test B",
      hasConflict: true,
    };

    const wClear = calculateEvidenceWeight(clearEvidence);
    const wConflicting = calculateEvidenceWeight(conflictingEvidence);

    expect(wConflicting.finalWeight).toBeLessThan(wClear.finalWeight);
    expect(wConflicting.weightExplanation).toContain(
      "penalty due to detected conflicting evidence",
    );
  });

  it("weights an array of evidence items and computes aggregate metrics", () => {
    const collection = [
      {
        id: "e-1",
        title: "Test 1",
        type: "TEST",
        verificationLevel: 0.9,
        sourceQuality: 0.9,
        independentConfirmation: true,
      },
      {
        id: "e-2",
        title: "Test 2",
        type: "DOC",
        verificationLevel: 0.7,
        sourceQuality: 0.7,
      },
    ];

    const result = weightEvidenceCollection(collection);

    expect(result.weights).toHaveLength(2);
    expect(result.aggregateWeight).toBeGreaterThan(0.7);
    expect(result.highQualityEvidenceCount).toBe(2);
  });
});
