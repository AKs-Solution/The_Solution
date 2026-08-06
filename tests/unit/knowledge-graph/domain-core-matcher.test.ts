import { describe, it, expect } from "vitest";
import {
  KnowledgeGraph,
  EvidenceBindingError,
  convertSI,
  twoPhaseMatch,
  DimensionMismatchError,
} from "../../../packages/domain-core/src";

describe("Knowledge Graph Core & 2-Phase SI Matcher Test Suite", () => {
  it("enforces evidence binding on edge creation and throws EvidenceBindingError when evidence_hashes is empty or invalid", () => {
    const graph = new KnowledgeGraph();

    const matNode = graph.addNode({
      tenant_id: "tenant-1",
      node_type: "material",
      properties: { name: "Steel A" },
      active: true,
    });

    const eqNode = graph.addNode({
      tenant_id: "tenant-1",
      node_type: "equation",
      properties: { name: "Stress Eq" },
      active: true,
    });

    // Expect error when evidence_hashes is empty
    expect(() => {
      graph.addEdge({
        tenant_id: "tenant-1",
        edge_type: "constrains",
        source_id: eqNode.id,
        target_id: matNode.id,
        evidence_hashes: [],
        active: true,
      });
    }).toThrow(EvidenceBindingError);

    // Expect error when evidence hash is invalid
    expect(() => {
      graph.addEdge({
        tenant_id: "tenant-1",
        edge_type: "constrains",
        source_id: eqNode.id,
        target_id: matNode.id,
        evidence_hashes: ["invalid-hash"],
        active: true,
      });
    }).toThrow(EvidenceBindingError);

    // Valid edge creation with SHA-256 hash
    const validEdge = graph.addEdge({
      tenant_id: "tenant-1",
      edge_type: "constrains",
      source_id: eqNode.id,
      target_id: matNode.id,
      evidence_hashes: ["a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"],
      active: true,
    });

    expect(validEdge.id).toBeDefined();
    expect(validEdge.evidence_hashes.length).toBe(1);
  });

  it("performs SI unit conversions accurately and throws DimensionMismatchError on mismatched dimensions", () => {
    // 300 MPa to Pa
    const paVal = convertSI(300, "MPa", "Pa");
    expect(paVal).toBe(300e6);

    // 1 bar to kPa
    const barVal = convertSI(1, "bar", "kPa");
    expect(barVal).toBe(100);

    // 12.5 mm to m
    const mVal = convertSI(12.5, "mm", "m");
    expect(mVal).toBe(0.0125);

    // Expect DimensionMismatchError when converting mm to MPa
    expect(() => {
      convertSI(12.5, "mm", "MPa");
    }).toThrow(DimensionMismatchError);
  });

  it("executes 2-phase cross-domain matching and generates ConstraintDemotionWarning when stress exceeds yield strength", () => {
    const graph = new KnowledgeGraph();

    const matNode = graph.addNode({
      tenant_id: "tenant-1",
      node_type: "material",
      properties: {
        name: "Steel A",
        yield_strength: { value: 250, unit: "MPa", dimension: [1, -1, -2, 0, 0, 0, 0] },
      },
      active: true,
    });

    const eqNode = graph.addNode({
      tenant_id: "tenant-1",
      node_type: "equation",
      properties: {
        name: "Stress Equation",
        operating_stress: { value: 300, unit: "MPa", dimension: [1, -1, -2, 0, 0, 0, 0] },
      },
      active: true,
    });

    graph.addEdge({
      tenant_id: "tenant-1",
      edge_type: "constrains",
      source_id: eqNode.id,
      target_id: matNode.id,
      evidence_hashes: ["a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"],
      active: true,
    });

    const matchResult = twoPhaseMatch(graph, {
      sourceNodeId: eqNode.id,
      targetNodeId: matNode.id,
    });

    expect(matchResult.overallStatus).toBe("CONSTRAINT_DEMOTED");
    expect(matchResult.matchedPaths.length).toBe(1);
    expect(matchResult.matchedPaths[0].warnings.length).toBe(1);
    expect(matchResult.matchedPaths[0].warnings[0].reason).toContain("Constraint Demotion");
  });
});
