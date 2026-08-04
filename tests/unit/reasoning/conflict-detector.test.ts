import { describe, it, expect } from "vitest";
import { detectReasoningConflicts } from "@/server/reasoning/conflict-detector";

describe("Conflict Detection Engine", () => {
  it("detects evidence contradictions when reports state opposing pass/fail results", () => {
    const input = {
      evidenceList: [
        {
          id: "e1",
          title: "Pressure Test Pass",
          type: "TEST",
          content: "Component passed pressure test at 500 bar",
        },
        {
          id: "e2",
          title: "Pressure Test Failure",
          type: "TEST",
          content: "Component failed pressure test at 480 bar",
        },
      ],
      principles: [],
      constraints: [],
      assumptions: [],
      alternatives: [],
      tradeoffs: [],
    };

    const conflicts = detectReasoningConflicts(input);

    expect(conflicts.some((c) => c.conflictType === "EVIDENCE_CONTRADICTION")).toBe(true);
    expect(conflicts[0].severity).toBe("HIGH");
  });

  it("detects hard constraint violations", () => {
    const input = {
      evidenceList: [],
      principles: [],
      constraints: [
        {
          name: "Maximum Stress Limit",
          category: "Structural",
          description: "Limit exceeded",
          isHardConstraint: true,
          isViolated: true,
          violationDegree: 1.25,
        },
      ],
      assumptions: [],
      alternatives: [],
      tradeoffs: [],
    };

    const conflicts = detectReasoningConflicts(input);

    expect(conflicts.some((c) => c.conflictType === "CONSTRAINT_VIOLATION")).toBe(true);
    expect(conflicts[0].severity).toBe("CRITICAL");
  });

  it("detects unverified high-risk assumptions", () => {
    const input = {
      evidenceList: [],
      principles: [],
      constraints: [],
      assumptions: [
        {
          statement: "Zero moisture exposure during 10 year service",
          justification: "Theoretical spec",
          riskLevel: "HIGH" as const,
          isVerified: false,
          impactIfInvalid: "Severe galvanic corrosion collapse",
        },
      ],
      alternatives: [],
      tradeoffs: [],
    };

    const conflicts = detectReasoningConflicts(input);

    expect(conflicts.some((c) => c.conflictType === "UNSUPPORTED_ASSUMPTION")).toBe(true);
  });
});
