import { describe, it, expect } from "vitest";
import { buildReasoningGraph } from "@/server/reasoning/reasoning-graph";
import { executeConclusionGeneration } from "@/server/reasoning/pipeline/stages";
import { PipelineContext } from "@/server/reasoning/pipeline/pipeline-context";

describe("Engineering Reasoning Pipeline & Graph Integration", () => {
  it("generates insufficient evidence conclusion when evidence quality is below threshold", async () => {
    const ctx: Partial<PipelineContext> = {
      sessionId: "session-123",
      title: "Untested Subsea Valve Design",
      principles: [
        {
          code: "PRIN-STRESS-DIST",
          name: "Stress Distribution",
          category: "Structural",
          description: "Stress distribution",
          governingEquations: [],
          domain: "Mechanical",
          version: 1,
          status: "ACTIVE",
        },
      ],
      tradeoffs: [],
      rawEvidence: [],
      confidenceScore: 0.2,
      isSupportedByEvidence: false,
      unresolvedUncertainties: ["No empirical test evidence available."],
    };

    await executeConclusionGeneration(ctx as PipelineContext);

    expect(ctx.conclusion).toBeDefined();
    expect(ctx.conclusion?.isSupportedByEvidence).toBe(false);
    expect(ctx.conclusion?.statement).toContain(
      "INSUFFICIENT EVIDENCE: No supported engineering conclusion exists",
    );
  });

  it("builds dedicated reasoning graph with explicit WHY justifications on edges", () => {
    const graph = buildReasoningGraph({
      sessionId: "session-456",
      evidence: [
        {
          evidenceId: "ev-1",
          evidenceType: "TEST_REPORT",
          title: "Lab Endurance Test",
          verificationLevel: 0.9,
          sourceQuality: 0.9,
          recencyScore: 0.9,
          relevanceScore: 0.9,
          repeatabilityScore: 0.9,
          independentConfirmation: 1,
          engineeringConfidence: 0.85,
          historicalAccuracy: 0.9,
          conflictingScore: 0,
          finalWeight: 0.92,
          weightExplanation: "High quality evidence",
        },
      ],
      principles: [
        {
          code: "PRIN-STRESS-DIST",
          name: "Stress Distribution",
          category: "Structural",
          description: "Stress principles",
          governingEquations: ["sigma = P/A"],
          domain: "Mechanical",
          version: 1,
          status: "ACTIVE",
        },
      ],
      constraints: [
        {
          name: "Max Stress Limit",
          category: "Structural",
          description: "Limit 350 MPa",
          isHardConstraint: true,
          isViolated: false,
        },
      ],
      assumptions: [],
      tradeoffs: [],
      alternatives: [],
      conflicts: [],
      conclusion: {
        statement: "Design satisfies all structural constraints.",
        confidenceScore: 0.92,
        supportingEvidenceIds: ["ev-1"],
        appliedPrincipleIds: ["PRIN-STRESS-DIST"],
        tradeoffIds: [],
        unresolvedUncertainties: [],
        isSupportedByEvidence: true,
        recommendation: "Proceed with production sign-off.",
      },
    });

    expect(graph.nodes.some((n) => n.nodeType === "EVIDENCE")).toBe(true);
    expect(graph.nodes.some((n) => n.nodeType === "PRINCIPLE")).toBe(true);
    expect(graph.nodes.some((n) => n.nodeType === "CONCLUSION")).toBe(true);

    const edge = graph.edges.find((e) => e.edgeType === "SUPPORTS");
    expect(edge).toBeDefined();
    expect(edge?.justification).toContain("empirical foundation");
  });
});
