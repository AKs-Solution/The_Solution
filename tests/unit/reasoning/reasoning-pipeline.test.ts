import { describe, it, expect } from "vitest";
import { buildReasoningGraph } from "@/server/reasoning/reasoning-graph";
import {
  executeConclusionGeneration,
  executeMissingEvidenceDetection,
  executeCausalReasoning,
} from "@/server/reasoning/pipeline/stages";
import { PipelineContext } from "@/server/reasoning/pipeline/pipeline-context";

describe("Reasoning Pipeline & Graph Generator", () => {
  it("builds a typed reasoning graph with explicit 'WHY' justifications on edges", () => {
    const graph = buildReasoningGraph({
      sessionId: "session-100",
      evidence: [
        {
          evidenceId: "ev-001",
          evidenceType: "LAB_TEST",
          title: "Tensile Strength Test",
          verificationLevel: 0.9,
          sourceQuality: 0.9,
          recencyScore: 0.9,
          relevanceScore: 0.9,
          repeatabilityScore: 0.9,
          independentConfirmation: 1,
          engineeringConfidence: 0.9,
          historicalAccuracy: 0.9,
          conflictingScore: 0,
          finalWeight: 0.9,
          weightExplanation: "High quality evidence",
        },
      ],
      principles: [
        {
          code: "PRIN-ENERGY-CONS",
          name: "Conservation of Energy",
          category: "Thermal",
          description: "First law",
          governingEquations: ["dE = Q - W"],
          domain: "Mechanical",
          version: 1,
          status: "ACTIVE",
        },
      ],
      constraints: [
        {
          name: "Max Stress",
          category: "Structural",
          description: "Limit 300 MPa",
          isHardConstraint: true,
          isViolated: false,
        },
      ],
      assumptions: [],
      tradeoffs: [],
      alternatives: [],
      conflicts: [],
      conclusion: {
        statement: "Design approved based on energy conservation and test data.",
        confidenceScore: 0.9,
        supportingEvidenceIds: ["ev-001"],
        appliedPrincipleIds: ["PRIN-ENERGY-CONS"],
        tradeoffIds: [],
        unresolvedUncertainties: [],
        isSupportedByEvidence: true,
        recommendation: "Proceed to detail design",
      },
    });

    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);

    const supportsEdge = graph.edges.find((e) => e.edgeType === "SUPPORTS");
    expect(supportsEdge).toBeDefined();
    expect(supportsEdge?.justification).toBeTruthy();
  });

  it("detects missing evidence and executes causal reasoning propagation", async () => {
    const mockCtx: Partial<PipelineContext> = {
      rawEvidence: [],
      assumptions: [
        {
          statement: "Unverified Grain Orientation",
          justification: "Assumed isotropic",
          riskLevel: "MEDIUM",
          isVerified: false,
          impactIfInvalid: "Reduces fatigue strength by 15%",
        },
      ],
      missingEvidence: [],
      causalReasoning: [],
    };

    await executeMissingEvidenceDetection(mockCtx as PipelineContext);
    await executeCausalReasoning(mockCtx as PipelineContext);

    expect(mockCtx.missingEvidence?.length).toBeGreaterThan(0);
    expect(mockCtx.causalReasoning?.length).toBeGreaterThan(0);
  });

  it("generates insufficient evidence fallback conclusion when confidence is low", async () => {
    const mockCtx: Partial<PipelineContext> = {
      title: "Unknown Shaft Loading",
      confidenceScore: 0.2,
      isSupportedByEvidence: false,
      rawEvidence: [],
      principles: [],
      tradeoffs: [],
      unresolvedUncertainties: ["No verified empirical test data provided."],
      conclusion: null,
    };

    await executeConclusionGeneration(mockCtx as PipelineContext);

    expect(mockCtx.conclusion).toBeDefined();
    expect(mockCtx.conclusion?.isSupportedByEvidence).toBe(false);
    expect(mockCtx.conclusion?.statement).toContain("INSUFFICIENT EVIDENCE");
  });
});
