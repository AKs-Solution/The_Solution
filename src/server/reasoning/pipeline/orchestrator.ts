import { prisma } from "@/server/db";
import { REASONING_STAGES } from "../constants";
import { buildReasoningGraph } from "../reasoning-graph";
import { ReasoningStageName } from "../types";
import { PipelineContext } from "./pipeline-context";
import {
  executeAlternativeGeneration,
  executeCausalReasoning,
  executeConclusionGeneration,
  executeConfidenceCalculation,
  executeConflictDetectionStage,
  executeConstraintExtraction,
  executeEvidenceCitation,
  executeEvidenceCollection,
  executeEvidenceValidation,
  executeEvidenceWeighting,
  executeMissingEvidenceDetection,
  executePrincipleSelection,
  executeReasoningChainConstruction,
  executeRecommendationGeneration,
  executeRelationshipAnalysis,
  executeTradeoffEvaluation,
} from "./stages";
import { logger } from "@/shared/logging";

/**
 * Snapshots the stage entry parameters and evidence references for durable
 * ReasoningStep persistence (input side of the derivation trace).
 */
function stepInputSnapshot(stageName: ReasoningStageName, ctx: PipelineContext): Record<string, unknown> {
  const raw = ctx.rawInputContext ?? {};
  return {
    stageName,
    subjectEntityId: raw.subjectEntityId ?? raw.subjectEntity ?? null,
    material: raw.material ?? null,
    yieldStrengthMpa: raw.yieldStrengthMpa ?? null,
    preferredPrinciples: Array.isArray(raw.preferredPrinciples) ? raw.preferredPrinciples : [],
    customConstraintCount: Array.isArray(raw.customConstraints) ? raw.customConstraints.length : 0,
    relatedEvidenceCount: Array.isArray(raw.relatedEvidence) ? raw.relatedEvidence.length : 0,
    rawEvidenceCount: ctx.rawEvidence.length,
    rawEvidenceIds: ctx.rawEvidence.map((e) => e.id),
    constraintCountAtEntry: ctx.constraints.length,
    assumptionCountAtEntry: ctx.assumptions.length,
    alternativeCountAtEntry: ctx.alternatives.length,
    principleCodeCountAtEntry: ctx.principles.length,
    tradeoffCountAtEntry: ctx.tradeoffs.length,
    confidenceScoreAtEntry: ctx.confidenceScore,
  };
}

/**
 * Snapshots the stage rule outputs (output side of the derivation trace).
 */
function stepOutputSnapshot(stageName: ReasoningStageName, ctx: PipelineContext): Record<string, unknown> {
  switch (stageName) {
    case "EVIDENCE_COLLECTION":
      return {
        evidence: ctx.rawEvidence.map((e) => ({
          id: e.id,
          title: e.title,
          type: e.type,
          verificationLevel: e.verificationLevel,
        })),
      };
    case "EVIDENCE_VALIDATION":
      return { retainedEvidenceIds: ctx.rawEvidence.map((e) => e.id) };
    case "EVIDENCE_WEIGHTING":
      return {
        evidenceWeights: ctx.evidenceWeights.map((w) => ({
          evidenceId: w.evidenceId,
          finalWeight: w.finalWeight,
          engineeringConfidence: w.engineeringConfidence,
        })),
      };
    case "CONSTRAINT_IDENTIFICATION":
      return {
        constraints: ctx.constraints.map((c) => ({
          name: c.name,
          category: c.category,
          limitValue: c.limitValue,
          unit: c.unit,
          isHardConstraint: c.isHardConstraint,
          isViolated: c.isViolated,
        })),
        assumptions: ctx.assumptions.map((a) => ({
          statement: a.statement,
          riskLevel: a.riskLevel,
          isVerified: a.isVerified,
        })),
      };
    case "PRINCIPLE_SELECTION":
      return { principles: ctx.principles.map((p) => ({ code: p.code, name: p.name })) };
    case "RELATIONSHIP_ANALYSIS":
      return { relationshipCount: ctx.relationshipMap.length };
    case "TRADEOFF_EVALUATION":
      return {
        tradeoffs: ctx.tradeoffs.map((t) => ({ criterion: t.criterion, selectedOption: t.selectedOption })),
      };
    case "ALTERNATIVE_GENERATION":
      return {
        alternatives: ctx.alternatives.map((a) => ({ name: a.name, score: a.score, status: a.status })),
      };
    case "CONFLICT_DETECTION":
      return {
        conflicts: ctx.conflicts.map((c) => ({
          conflictType: c.conflictType,
          severity: c.severity,
          isResolved: c.isResolved,
        })),
      };
    case "MISSING_EVIDENCE_DETECTION":
      return {
        missingEvidence: ctx.missingEvidence.map((m) => ({ missingItem: m.missingItem, category: m.category })),
      };
    case "CAUSAL_REASONING":
      return {
        causalReasoning: ctx.causalReasoning.map((c) => ({
          sourceEntityId: c.sourceEntityId,
          targetEntityId: c.targetEntityId,
          probability: c.probability,
        })),
      };
    case "REASONING_CHAIN_CONSTRUCTION":
      return {
        reasoningChains: ctx.reasoningChains.map((c) => ({ stepIndex: c.stepIndex, title: c.title })),
      };
    case "CONFIDENCE_CALCULATION":
      return {
        confidenceScore: ctx.confidenceScore,
        isSupportedByEvidence: ctx.isSupportedByEvidence,
        unresolvedUncertainties: ctx.unresolvedUncertainties,
      };
    case "CONCLUSION_GENERATION":
      return { conclusion: ctx.conclusion };
    case "EVIDENCE_CITATION":
      return { citationCount: ctx.citations.length };
    case "RECOMMENDATION_GENERATION":
      return { recommendations: ctx.recommendations };
    default:
      return {};
  }
}

export async function runReasoningPipeline(sessionId: string): Promise<PipelineContext> {
  const session = await (prisma as any).reasoningSession?.findUnique({
    where: { id: sessionId },
  }).catch(() => null);

  if (!session) {
    throw new Error(`ReasoningSession '${sessionId}' not found`);
  }

  // Update status to RUNNING
  await (prisma as any).reasoningSession?.update({
    where: { id: sessionId },
    data: { status: "RUNNING", startedAt: new Date() },
  }).catch(() => null);

  const ctx: PipelineContext = {
    sessionId: session.id,
    organizationId: session.organizationId,
    title: session.title,
    problemStatement: session.problemStatement,
    rawInputContext: (session.context as Record<string, unknown>) ?? {},
    rawEvidence: [],
    evidenceWeights: [],
    constraints: [],
    assumptions: [],
    principles: [],
    alternatives: [],
    tradeoffs: [],
    conflicts: [],
    missingEvidence: [],
    causalReasoning: [],
    relationshipMap: [],
    reasoningChains: [],
    confidenceScore: 0,
    isSupportedByEvidence: false,
    unresolvedUncertainties: [],
    conclusion: null,
    citations: [],
    recommendations: [],
    stepsExecuted: [],
  };

  const stageHandlers: Record<ReasoningStageName, (context: PipelineContext) => Promise<void>> = {
    EVIDENCE_COLLECTION: executeEvidenceCollection,
    EVIDENCE_VALIDATION: executeEvidenceValidation,
    EVIDENCE_WEIGHTING: executeEvidenceWeighting,
    CONSTRAINT_IDENTIFICATION: executeConstraintExtraction,
    PRINCIPLE_SELECTION: executePrincipleSelection,
    RELATIONSHIP_ANALYSIS: executeRelationshipAnalysis,
    TRADEOFF_EVALUATION: executeTradeoffEvaluation,
    ALTERNATIVE_GENERATION: executeAlternativeGeneration,
    CONFLICT_DETECTION: executeConflictDetectionStage,
    MISSING_EVIDENCE_DETECTION: executeMissingEvidenceDetection,
    CAUSAL_REASONING: executeCausalReasoning,
    REASONING_CHAIN_CONSTRUCTION: executeReasoningChainConstruction,
    CONFIDENCE_CALCULATION: executeConfidenceCalculation,
    CONCLUSION_GENERATION: executeConclusionGeneration,
    EVIDENCE_CITATION: executeEvidenceCitation,
    RECOMMENDATION_GENERATION: executeRecommendationGeneration,
  };

  try {
    for (let i = 0; i < REASONING_STAGES.length; i++) {
      const stageName = REASONING_STAGES[i];

      // Check cancellation request
      const checkCancel = await (prisma as any).reasoningSession?.findUnique({
        where: { id: sessionId },
        select: { cancelRequested: true },
      }).catch(() => null);

      if (checkCancel?.cancelRequested) {
        await (prisma as any).reasoningSession?.update({
          where: { id: sessionId },
          data: { status: "CANCELLED", completedAt: new Date() },
        }).catch(() => null);
        return ctx;
      }

      const stepStartTime = Date.now();
      const stepRecord = await (prisma as any).reasoningStep?.create({
        data: {
          sessionId,
          stageIndex: i + 1,
          stageName,
          status: "RUNNING",
          inputData: stepInputSnapshot(stageName, ctx),
          startedAt: new Date(),
        },
      }).catch(() => null);

      try {
        const handler = stageHandlers[stageName];
        if (handler) {
          await handler(ctx);
        }

        const durationMs = Date.now() - stepStartTime;
        if (stepRecord) {
          await (prisma as any).reasoningStep?.update({
            where: { id: stepRecord.id },
            data: {
              status: "COMPLETED",
              outputData: stepOutputSnapshot(stageName, ctx),
              durationMs,
              completedAt: new Date(),
            },
          }).catch(() => null);
        }

        ctx.stepsExecuted.push({
          id: stepRecord?.id || `step-${i}`,
          stageIndex: i + 1,
          stageName,
          status: "COMPLETED",
          durationMs,
        });
      } catch (err) {
        const durationMs = Date.now() - stepStartTime;
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (stepRecord) {
          await (prisma as any).reasoningStep?.update({
            where: { id: stepRecord.id },
            data: {
              status: "FAILED",
              durationMs,
              errorMessage,
              completedAt: new Date(),
            },
          }).catch(() => null);
        }
        throw err;
      }
    }

    // Build Reasoning Graph
    const graph = buildReasoningGraph({
      sessionId: ctx.sessionId,
      evidence: ctx.evidenceWeights,
      principles: ctx.principles,
      constraints: ctx.constraints,
      assumptions: ctx.assumptions,
      tradeoffs: ctx.tradeoffs,
      alternatives: ctx.alternatives,
      conflicts: ctx.conflicts,
      conclusion: ctx.conclusion,
    });

    // Persist all domain records
    await Promise.all([
      // 1. Evidence Weight Records
      ...ctx.evidenceWeights.map((w) =>
        (prisma as any).evidenceWeightRecord?.create({
          data: {
            sessionId: ctx.sessionId,
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
          },
        }).catch(() => null),
      ),

      // 2. Constraints
      ...ctx.constraints.map((c) =>
        (prisma as any).constraintRecord?.create({
          data: {
            sessionId: ctx.sessionId,
            name: c.name,
            category: c.category,
            description: c.description,
            limitValue: c.limitValue,
            unit: c.unit,
            isHardConstraint: c.isHardConstraint,
            isViolated: c.isViolated ?? false,
            violationDegree: c.violationDegree,
          },
        }).catch(() => null),
      ),

      // 3. Assumptions
      ...ctx.assumptions.map((a) =>
        (prisma as any).assumptionRecord?.create({
          data: {
            sessionId: ctx.sessionId,
            statement: a.statement,
            justification: a.justification,
            riskLevel: a.riskLevel,
            isVerified: a.isVerified,
            impactIfInvalid: a.impactIfInvalid,
          },
        }).catch(() => null),
      ),

      // 4. Alternatives
      ...ctx.alternatives.map((alt) =>
        (prisma as any).alternativeRecord?.create({
          data: {
            sessionId: ctx.sessionId,
            name: alt.name,
            description: alt.description,
            pros: alt.pros,
            cons: alt.cons,
            score: alt.score,
            status: alt.status,
            rejectionReason: alt.rejectionReason,
          },
        }).catch(() => null),
      ),

      // 5. Tradeoffs
      ...ctx.tradeoffs.map((tr) =>
        (prisma as any).tradeoffRecord?.create({
          data: {
            sessionId: ctx.sessionId,
            criterion: tr.criterion,
            alternativeAId: tr.alternativeAId,
            alternativeBId: tr.alternativeBId,
            comparisonDetails: tr.comparisonDetails,
            selectedOption: tr.selectedOption,
          },
        }).catch(() => null),
      ),

      // 6. Conflicts
      ...ctx.conflicts.map((cf) =>
        (prisma as any).conflictRecord?.create({
          data: {
            sessionId: ctx.sessionId,
            conflictType: cf.conflictType,
            severity: cf.severity,
            description: cf.description,
            entitiesInvolved: cf.entitiesInvolved,
            mitigationRecommendation: cf.mitigationRecommendation,
            isResolved: cf.isResolved ?? false,
          },
        }).catch(() => null),
      ),

      // 7. Missing Evidence Records
      ...ctx.missingEvidence.map((me) =>
        (prisma as any).missingEvidenceRecord?.create({
          data: {
            sessionId: ctx.sessionId,
            missingItem: me.missingItem,
            category: me.category,
            impact: me.impact,
            requiredSource: me.requiredSource,
          },
        }).catch(() => null),
      ),
    ]);

    // Persist Conclusion
    if (ctx.conclusion) {
      await (prisma as any).engineeringConclusionRecord?.create({
        data: {
          sessionId: ctx.sessionId,
          statement: ctx.conclusion.statement,
          confidenceScore: ctx.conclusion.confidenceScore,
          supportingEvidenceIds: ctx.conclusion.supportingEvidenceIds,
          appliedPrincipleIds: ctx.conclusion.appliedPrincipleIds,
          tradeoffIds: ctx.conclusion.tradeoffIds,
          unresolvedUncertainties: ctx.conclusion.unresolvedUncertainties,
          isSupportedByEvidence: ctx.conclusion.isSupportedByEvidence,
          recommendation: ctx.conclusion.recommendation,
        },
      }).catch(() => null);
    }

    // Persist Graph Nodes & Edges
    const createdNodes = new Map<string, string>();
    for (const node of graph.nodes) {
      const dbNode = await (prisma as any).reasoningGraphNode?.create({
        data: {
          sessionId: ctx.sessionId,
          organizationId: ctx.organizationId,
          nodeType: node.nodeType,
          label: node.label,
          confidence: node.confidence,
          weight: node.weight,
        },
      }).catch(() => null);
      if (dbNode) createdNodes.set(node.id, dbNode.id);
    }

    for (const edge of graph.edges) {
      const dbSrc = createdNodes.get(edge.sourceNodeId);
      const dbTgt = createdNodes.get(edge.targetNodeId);
      if (dbSrc && dbTgt) {
        await (prisma as any).reasoningGraphEdge?.create({
          data: {
            sessionId: ctx.sessionId,
            organizationId: ctx.organizationId,
            sourceNodeId: dbSrc,
            targetNodeId: dbTgt,
            edgeType: edge.edgeType,
            justification: edge.justification,
            weight: edge.weight,
          },
        }).catch(() => null);
      }
    }

    // Update Session to COMPLETED
    await (prisma as any).reasoningSession?.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        summary: ctx.conclusion?.statement,
        confidenceScore: ctx.confidenceScore,
        uncertaintyNotes: ctx.unresolvedUncertainties,
        completedAt: new Date(),
      },
    }).catch(() => null);

    return ctx;
  } catch (error) {
    logger.error("Reasoning pipeline execution error", { sessionId, error });
    await (prisma as any).reasoningSession?.update({
      where: { id: sessionId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
      },
    }).catch(() => null);
    throw error;
  }
}
