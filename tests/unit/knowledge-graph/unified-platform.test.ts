import { describe, it, expect } from "vitest";
import { executeUnifiedSearch } from "../../../src/server/retrieval/unified-search";
import {
  findPathsBetweenNodes,
  DOMAIN_RELATIONSHIP_TYPES,
} from "../../../src/server/knowledge-graph/graph-service";
import { EngineeringDecisionEntity, DomainEntityType } from "../../../src/shared/types/domain";

describe("Phase 2: Unified Engineering Knowledge Platform Test Suite", () => {
  const sampleOrgId = "org-test-unified-platform-101";

  it("exports canonical domain entity types and relationships", () => {
    const validEntityType: DomainEntityType = "ENGINEERING_DECISION";
    expect(validEntityType).toBe("ENGINEERING_DECISION");

    expect(DOMAIN_RELATIONSHIP_TYPES).toContain("AFFECTS");
    expect(DOMAIN_RELATIONSHIP_TYPES).toContain("SUPPLIED_BY");
    expect(DOMAIN_RELATIONSHIP_TYPES).toContain("JUSTIFIED_BY");
    expect(DOMAIN_RELATIONSHIP_TYPES).toContain("CAUSED_BY");
    expect(DOMAIN_RELATIONSHIP_TYPES).toContain("SATISFIED_BY");
    expect(DOMAIN_RELATIONSHIP_TYPES).toContain("IMPACTS");
    expect(DOMAIN_RELATIONSHIP_TYPES).toContain("SUPERSEDES");
    expect(DOMAIN_RELATIONSHIP_TYPES).toContain("ASSOCIATED_WITH");

    const sampleDecision: EngineeringDecisionEntity = {
      id: "dec-101",
      organizationId: sampleOrgId,
      entityType: "ENGINEERING_DECISION",
      identifier: "DEC-2026-001",
      name: "Tighten Propulsion Flange Tolerance",
      question: "Should we tighten bore tolerance from ±0.015 to ±0.010?",
      decisionMade: "Tightened bore tolerance to ±0.010 mm",
      rationale: "Eliminates high-pressure seal leakage at 400 bar operating pressure.",
      decisionType: "TOLERANCE_CHANGE",
      affectedComponentIds: ["comp-101"],
      justifyingEvidenceIds: ["doc-101"],
      version: "1.0.0",
      status: "APPROVED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provenance: {
        sourceDocumentId: "doc-101",
        sourceFileName: "Stress_Analysis_Flange.pdf",
        confidence: 0.98,
        extractedAt: new Date().toISOString(),
      },
    };

    expect(sampleDecision.id).toBe("dec-101");
    expect(sampleDecision.decisionType).toBe("TOLERANCE_CHANGE");
    expect(sampleDecision.provenance?.confidence).toBe(0.98);
  });

  it("executes unified search across entities, decisions, and documents without throwing", async () => {
    const searchResult = await executeUnifiedSearch({
      organizationId: sampleOrgId,
      query: "propulsion",
      limit: 10,
    });

    expect(searchResult).toBeDefined();
    expect(searchResult.query).toBe("propulsion");
    expect(Array.isArray(searchResult.data)).toBe(true);
  });

  it("supports multi-hop path traversal between graph nodes gracefully", async () => {
    const paths = await findPathsBetweenNodes("node-start", "node-end", sampleOrgId, 3);
    expect(Array.isArray(paths)).toBe(true);
  });
});
