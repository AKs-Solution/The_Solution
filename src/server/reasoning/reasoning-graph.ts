import {
  AlternativeData,
  AssumptionData,
  ConflictData,
  ConstraintData,
  EngineeringConclusionData,
  EngineeringPrincipleData,
  EvidenceWeightResult,
  ReasoningEdgeType,
  ReasoningGraphData,
  ReasoningNodeType,
  TradeoffData,
} from "./types";

export interface GraphBuilderInput {
  sessionId: string;
  evidence: EvidenceWeightResult[];
  principles: EngineeringPrincipleData[];
  constraints: ConstraintData[];
  assumptions: AssumptionData[];
  tradeoffs: TradeoffData[];
  alternatives: AlternativeData[];
  conflicts: ConflictData[];
  conclusion?: EngineeringConclusionData | null;
}

export function buildReasoningGraph(input: GraphBuilderInput): ReasoningGraphData {
  const nodes: ReasoningGraphData["nodes"] = [];
  const edges: ReasoningGraphData["edges"] = [];

  // Helper to add node
  const addNode = (
    id: string,
    nodeType: ReasoningNodeType,
    label: string,
    confidence?: number,
    weight?: number,
    properties?: Record<string, unknown>,
  ) => {
    nodes.push({ id, nodeType, label, confidence, weight, properties });
  };

  // Helper to add edge
  const addEdge = (
    sourceNodeId: string,
    targetNodeId: string,
    edgeType: ReasoningEdgeType,
    justification: string,
    weight?: number,
  ) => {
    edges.push({
      id: `edge-${sourceNodeId}-${targetNodeId}-${edgeType}`,
      sourceNodeId,
      targetNodeId,
      edgeType,
      justification,
      weight,
    });
  };

  // 1. Evidence Nodes
  for (const ev of input.evidence) {
    const nodeId = `ev-${ev.evidenceId}`;
    addNode(nodeId, "EVIDENCE", ev.title, ev.engineeringConfidence, ev.finalWeight, {
      verificationLevel: ev.verificationLevel,
      sourceQuality: ev.sourceQuality,
    });
  }

  // 2. Principle Nodes
  for (const pr of input.principles) {
    const nodeId = `pr-${pr.code}`;
    addNode(nodeId, "PRINCIPLE", pr.name, 1.0, 1.0, {
      code: pr.code,
      category: pr.category,
      domain: pr.domain,
    });
  }

  // 3. Constraint Nodes
  for (const cs of input.constraints) {
    const nodeId = `cs-${cs.id || cs.name}`;
    addNode(nodeId, "CONSTRAINT", cs.name, 0.9, cs.isViolated ? 0.2 : 0.9, {
      category: cs.category,
      isHardConstraint: cs.isHardConstraint,
      isViolated: cs.isViolated,
    });
  }

  // 4. Assumption Nodes
  for (const as of input.assumptions) {
    const nodeId = `as-${as.id || as.statement.slice(0, 20)}`;
    addNode(nodeId, "ASSUMPTION", as.statement, as.isVerified ? 0.9 : 0.4, 0.5, {
      riskLevel: as.riskLevel,
      isVerified: as.isVerified,
    });
  }

  // 5. Alternative Nodes & Edges
  for (const alt of input.alternatives) {
    const nodeId = `alt-${alt.id || alt.name}`;
    addNode(nodeId, "ALTERNATIVE", alt.name, alt.score, alt.score, {
      status: alt.status,
      pros: alt.pros,
      cons: alt.cons,
    });
  }

  // 6. Tradeoff Nodes & Edges
  for (const tr of input.tradeoffs) {
    const nodeId = `tr-${tr.id || tr.criterion}`;
    addNode(nodeId, "TRADEOFF", `Tradeoff: ${tr.criterion}`, 0.85, 0.8, {
      comparisonDetails: tr.comparisonDetails,
    });

    // Link tradeoffs to alternatives with WHY explanation
    if (tr.alternativeAId) {
      addEdge(
        nodeId,
        `alt-${tr.alternativeAId}`,
        "INFLUENCES",
        `Tradeoff analysis on ${tr.criterion} evaluates baseline design option ${tr.alternativeAId}`,
      );
    }
    if (tr.alternativeBId) {
      addEdge(
        nodeId,
        `alt-${tr.alternativeBId}`,
        "INFLUENCES",
        `Tradeoff analysis on ${tr.criterion} evaluates comparative design option ${tr.alternativeBId}`,
      );
    }
  }

  // 7. Conflict Nodes & Edges
  for (const cf of input.conflicts) {
    const nodeId = `cf-${cf.id || cf.conflictType}`;
    addNode(nodeId, "RISK", `Conflict: ${cf.conflictType}`, 0.95, 0.9, {
      severity: cf.severity,
      description: cf.description,
    });

    for (const inv of cf.entitiesInvolved) {
      const targetId = nodes.find((n) => n.id.includes(inv))?.id || `ev-${inv}`;
      if (targetId) {
        addEdge(
          nodeId,
          targetId,
          "CONTRADICTS",
          `Conflict surfaced: ${cf.description} involving target entity ${inv}`,
        );
      }
    }
  }

  // 8. Conclusion Node & Relationships
  if (input.conclusion) {
    const concNodeId = `conc-${input.sessionId}`;
    addNode(
      concNodeId,
      "CONCLUSION",
      input.conclusion.statement,
      input.conclusion.confidenceScore,
      1.0,
      {
        recommendation: input.conclusion.recommendation,
        isSupportedByEvidence: input.conclusion.isSupportedByEvidence,
      },
    );

    // Link evidence -> conclusion with CITING / SUPPORTS
    for (const ev of input.evidence) {
      const evNodeId = `ev-${ev.evidenceId}`;
      addEdge(
        evNodeId,
        concNodeId,
        "SUPPORTS",
        `Evidence '${ev.title}' (weight ${ev.finalWeight}) provides empirical foundation for conclusion.`,
        ev.finalWeight,
      );
    }

    // Link principles -> conclusion with APPLIES
    for (const pr of input.principles) {
      const prNodeId = `pr-${pr.code}`;
      addEdge(
        prNodeId,
        concNodeId,
        "APPLIES",
        `Engineering principle '${pr.name}' governs validity of derived engineering conclusions.`,
        1.0,
      );
    }

    // Link constraints -> conclusion with CONSTRAINS
    for (const cs of input.constraints) {
      const csNodeId = `cs-${cs.id || cs.name}`;
      addEdge(
        csNodeId,
        concNodeId,
        "CONSTRAINS",
        `Constraint '${cs.name}' bounds allowable operational parameters of conclusion.`,
        cs.isViolated ? 0.2 : 0.9,
      );
    }
  }

  return { nodes, edges };
}
