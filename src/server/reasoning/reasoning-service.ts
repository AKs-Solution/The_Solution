import { prisma } from "@/server/db";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { runReasoningPipeline } from "./pipeline/orchestrator";
import { getEngineeringPrinciples } from "./principles-library";
import {
  AlternativeData,
  AssumptionData,
  ConflictData,
  EngineeringConclusionData,
  EvidenceWeightResult,
  ReasoningExplanationPayload,
  ReasoningGraphData,
  ReasoningStepData,
  StartReasoningSessionInput,
} from "./types";

/**
 * Creates a QUEUED reasoning session and executes the 14-stage reasoning pipeline synchronously.
 */
export async function startReasoningSession(
  organizationId: string,
  triggeredById: string,
  input: StartReasoningSessionInput,
) {
  if (!input.title || !input.problemStatement) {
    throw new ValidationError("Reasoning session title and problem statement are required.");
  }

  const session = await prisma.reasoningSession.create({
    data: {
      organizationId,
      triggeredById,
      title: input.title,
      problemStatement: input.problemStatement,
      context: input.context ? (input.context as unknown as object) : undefined,
      status: "QUEUED",
    },
  });

  // Execute reasoning pipeline
  await runReasoningPipeline(session.id);

  return getReasoningSession(session.id, organizationId);
}

/**
 * Lists reasoning sessions for an organization with optional status filtering and pagination.
 */
export async function listReasoningSessions(
  organizationId: string,
  params?: { status?: string; search?: string; page?: number; pageSize?: number },
) {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;

  const where: Record<string, unknown> = { organizationId };
  if (params?.status) where.status = params.status;
  if (params?.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { problemStatement: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.reasoningSession.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        conclusions: true,
        _count: {
          select: {
            steps: true,
            conflicts: true,
            evidenceWeights: true,
          },
        },
      },
    }),
    prisma.reasoningSession.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Retrieves single reasoning session details.
 */
export async function getReasoningSession(id: string, organizationId: string) {
  const session = await prisma.reasoningSession.findFirst({
    where: { id, organizationId },
    include: {
      steps: { orderBy: { stageIndex: "asc" } },
      conclusions: true,
      conflicts: true,
      evidenceWeights: true,
      constraints: true,
      assumptions: true,
      tradeoffs: true,
      alternatives: true,
    },
  });

  if (!session) {
    throw new NotFoundError("ReasoningSession", id);
  }

  return session;
}

/**
 * Retrieves step-by-step reasoning chains for a session.
 */
export async function getReasoningChains(
  sessionId: string,
  organizationId: string,
): Promise<ReasoningStepData[]> {
  await getReasoningSession(sessionId, organizationId);

  const steps = await prisma.reasoningStep.findMany({
    where: { sessionId },
    orderBy: { stageIndex: "asc" },
  });

  return steps.map((s) => ({
    id: s.id,
    stageIndex: s.stageIndex,
    stageName: s.stageName as ReasoningStepData["stageName"],
    status: s.status as ReasoningStepData["status"],
    inputData: (s.inputData as Record<string, unknown>) ?? {},
    outputData: (s.outputData as Record<string, unknown>) ?? {},
    durationMs: s.durationMs ?? 0,
    errorMessage: s.errorMessage ?? undefined,
    startedAt: s.startedAt ?? undefined,
    completedAt: s.completedAt ?? undefined,
  }));
}

/**
 * Retrieves evidence weight records and explanations for a session.
 */
export async function getEvidenceWeights(
  sessionId: string,
  organizationId: string,
): Promise<EvidenceWeightResult[]> {
  await getReasoningSession(sessionId, organizationId);

  const records = await prisma.evidenceWeightRecord.findMany({
    where: { sessionId },
    orderBy: { finalWeight: "desc" },
  });

  return records.map((r) => ({
    evidenceId: r.evidenceId,
    evidenceType: r.evidenceType,
    title: r.title,
    verificationLevel: r.verificationLevel,
    sourceQuality: r.sourceQuality,
    recencyScore: r.recencyScore,
    relevanceScore: r.relevanceScore,
    repeatabilityScore: r.repeatabilityScore,
    independentConfirmation: r.independentConfirmation,
    engineeringConfidence: r.engineeringConfidence,
    historicalAccuracy: r.historicalAccuracy,
    conflictingScore: r.conflictingScore,
    finalWeight: r.finalWeight,
    weightExplanation: r.weightExplanation,
  }));
}

/**
 * Retrieves tradeoffs and alternatives for a session.
 */
export async function getTradeoffsAndAlternatives(sessionId: string, organizationId: string) {
  await getReasoningSession(sessionId, organizationId);

  const [tradeoffs, alternatives] = await Promise.all([
    prisma.tradeoffRecord.findMany({ where: { sessionId } }),
    prisma.alternativeRecord.findMany({ where: { sessionId } }),
  ]);

  return {
    tradeoffs: tradeoffs.map((t) => ({
      id: t.id,
      criterion: t.criterion,
      alternativeAId: t.alternativeAId,
      alternativeBId: t.alternativeBId,
      comparisonDetails: t.comparisonDetails,
      selectedOption: t.selectedOption ?? undefined,
    })),
    alternatives: alternatives.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      pros: (a.pros as string[]) ?? [],
      cons: (a.cons as string[]) ?? [],
      score: a.score,
      status: a.status as AlternativeData["status"],
      rejectionReason: a.rejectionReason ?? undefined,
    })),
  };
}

/**
 * Retrieves detected conflicts for a session.
 */
export async function getConflicts(
  sessionId: string,
  organizationId: string,
): Promise<ConflictData[]> {
  await getReasoningSession(sessionId, organizationId);

  const conflicts = await prisma.conflictRecord.findMany({
    where: { sessionId },
    orderBy: { severity: "desc" },
  });

  return conflicts.map((c) => ({
    id: c.id,
    conflictType: c.conflictType as ConflictData["conflictType"],
    severity: c.severity as ConflictData["severity"],
    description: c.description,
    entitiesInvolved: (c.entitiesInvolved as string[]) ?? [],
    mitigationRecommendation: c.mitigationRecommendation,
    isResolved: c.isResolved,
  }));
}

/**
 * Retrieves dedicated Reasoning Graph nodes and edges.
 */
export async function getReasoningGraph(
  sessionId: string,
  organizationId: string,
): Promise<ReasoningGraphData> {
  await getReasoningSession(sessionId, organizationId);

  const [nodes, edges] = await Promise.all([
    prisma.reasoningGraphNode.findMany({ where: { sessionId, organizationId } }),
    prisma.reasoningGraphEdge.findMany({ where: { sessionId, organizationId } }),
  ]);

  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      nodeType: n.nodeType as ReasoningGraphData["nodes"][0]["nodeType"],
      label: n.label,
      confidence: n.confidence,
      weight: n.weight,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
      edgeType: e.edgeType as ReasoningGraphData["edges"][0]["edgeType"],
      justification: e.justification,
      weight: e.weight,
    })),
  };
}

/**
 * Retrieves full end-to-end transparent explanation payload.
 */
export async function getReasoningExplanation(
  sessionId: string,
  organizationId: string,
): Promise<ReasoningExplanationPayload> {
  const session = await getReasoningSession(sessionId, organizationId);
  const principles = await getEngineeringPrinciples(organizationId);

  const conclusionRecord = session.conclusions[0];
  const conclusion: EngineeringConclusionData | null = conclusionRecord
    ? {
        id: conclusionRecord.id,
        statement: conclusionRecord.statement,
        confidenceScore: conclusionRecord.confidenceScore,
        supportingEvidenceIds: (conclusionRecord.supportingEvidenceIds as string[]) ?? [],
        appliedPrincipleIds: (conclusionRecord.appliedPrincipleIds as string[]) ?? [],
        tradeoffIds: (conclusionRecord.tradeoffIds as string[]) ?? [],
        unresolvedUncertainties: (conclusionRecord.unresolvedUncertainties as string[]) ?? [],
        isSupportedByEvidence: conclusionRecord.isSupportedByEvidence,
        recommendation: conclusionRecord.recommendation,
      }
    : null;

  return {
    sessionId: session.id,
    title: session.title,
    problemStatement: session.problemStatement,
    status: session.status as ReasoningExplanationPayload["status"],
    confidenceScore: session.confidenceScore ?? 0,
    isSupportedByEvidence: conclusion?.isSupportedByEvidence ?? false,
    conclusion,
    evidenceUsed: session.evidenceWeights.map((w) => ({
      evidenceId: w.evidenceId,
      evidenceType: w.evidenceType,
      title: w.title,
      verificationLevel: w.verificationLevel,
      sourceQuality: w.sourceQuality,
      recencyScore: w.recencyScore,
      relevanceScore: w.relevanceScore,
      repeatabilityScore: w.repeatabilityScore,
      independentConfirmation: w.independentConfirmation,
      engineeringConfidence: w.engineeringConfidence,
      historicalAccuracy: w.historicalAccuracy,
      conflictingScore: w.conflictingScore,
      finalWeight: w.finalWeight,
      weightExplanation: w.weightExplanation,
    })),
    appliedPrinciples: principles,
    constraintsInfluencing: session.constraints.map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      description: c.description,
      limitValue: c.limitValue ?? undefined,
      unit: c.unit ?? undefined,
      isHardConstraint: c.isHardConstraint,
      isViolated: c.isViolated,
      violationDegree: c.violationDegree ?? undefined,
    })),
    assumptionsMade: session.assumptions.map((a) => ({
      id: a.id,
      statement: a.statement,
      justification: a.justification,
      riskLevel: a.riskLevel as AssumptionData["riskLevel"],
      isVerified: a.isVerified,
      impactIfInvalid: a.impactIfInvalid,
    })),
    tradeoffsConsidered: session.tradeoffs.map((t) => ({
      id: t.id,
      criterion: t.criterion,
      alternativeAId: t.alternativeAId,
      alternativeBId: t.alternativeBId,
      comparisonDetails: t.comparisonDetails,
      selectedOption: t.selectedOption ?? undefined,
    })),
    rejectedAlternatives: session.alternatives
      .filter((a) => a.status === "REJECTED")
      .map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        pros: (a.pros as string[]) ?? [],
        cons: (a.cons as string[]) ?? [],
        score: a.score,
        status: "REJECTED",
        rejectionReason: a.rejectionReason ?? undefined,
      })),
    remainingUncertainties: (session.uncertaintyNotes as string[]) ?? [],
    conflictsDetected: session.conflicts.map((c) => ({
      id: c.id,
      conflictType: c.conflictType as ConflictData["conflictType"],
      severity: c.severity as ConflictData["severity"],
      description: c.description,
      entitiesInvolved: (c.entitiesInvolved as string[]) ?? [],
      mitigationRecommendation: c.mitigationRecommendation,
      isResolved: c.isResolved,
    })),
    reasoningChainSteps: session.steps.map((s) => ({
      id: s.id,
      stageIndex: s.stageIndex,
      stageName: s.stageName as ReasoningStepData["stageName"],
      status: s.status as ReasoningStepData["status"],
      durationMs: s.durationMs ?? 0,
    })),
  };
}

/**
 * Requests cancellation of an in-flight reasoning session.
 */
export async function cancelReasoningSession(id: string, organizationId: string) {
  const session = await getReasoningSession(id, organizationId);
  if (
    session.status === "COMPLETED" ||
    session.status === "FAILED" ||
    session.status === "CANCELLED"
  ) {
    throw new ValidationError(`Session is already ${session.status.toLowerCase()}`);
  }

  return prisma.reasoningSession.update({
    where: { id },
    data: { cancelRequested: true },
  });
}
