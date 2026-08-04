import { prisma } from "@/server/db";
import { REASONING_STAGES } from "../constants";
import { buildReasoningGraph } from "../reasoning-graph";
import { ReasoningStageName } from "../types";
import { PipelineContext } from "./pipeline-context";
import {
  executeAlternativeGeneration,
  executeConclusionGeneration,
  executeConfidenceCalculation,
  executeConflictDetectionStage,
  executeConstraintIdentification,
  executeEvidenceCitation,
  executeEvidenceCollection,
  executeEvidenceValidation,
  executeEvidenceWeightingStage,
  executePrincipleSelection,
  executeRecommendationGeneration,
  executeRelationshipAnalysis,
  executeTradeoffEvaluation,
  executeReasoningChainConstruction,
} from "./stages";
import { logger } from "@/shared/logging";

export async function runReasoningPipeline(sessionId: string): Promise<PipelineContext> {
  const session = await prisma.reasoningSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error(`ReasoningSession '${sessionId}' not found`);
  }

  // Update status to RUNNING
  await prisma.reasoningSession.update({
    where: { id: sessionId },
    data: { status: "RUNNING", startedAt: new Date() },
  });

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
    EVIDENCE_WEIGHTING: executeEvidenceWeightingStage,
    CONSTRAINT_IDENTIFICATION: executeConstraintIdentification,
    PRINCIPLE_SELECTION: executePrincipleSelection,
    RELATIONSHIP_ANALYSIS: executeRelationshipAnalysis,
    TRADEOFF_EVALUATION: executeTradeoffEvaluation,
    ALTERNATIVE_GENERATION: executeAlternativeGeneration,
    CONFLICT_DETECTION: executeConflictDetectionStage,
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
      const checkCancel = await prisma.reasoningSession.findUnique({
        where: { id: sessionId },
        select: { cancelRequested: true },
      });

      if (checkCancel?.cancelRequested) {
        await prisma.reasoningSession.update({
          where: { id: sessionId },
          data: { status: "CANCELLED", completedAt: new Date() },
        });
        return ctx;
      }

      const stepStartTime = Date.now();
      const stepRecord = await prisma.reasoningStep.create({
        data: {
          sessionId,
          stageIndex: i + 1,
          stageName,
          status: "RUNNING",
          startedAt: new Date(),
        },
      });

      try {
        const handler = stageHandlers[stageName];
        if (handler) {
          await handler(ctx);
        }

        const durationMs = Date.now() - stepStartTime;
        await prisma.reasoningStep.update({
          where: { id: stepRecord.id },
          data: {
            status: "COMPLETED",
            durationMs,
            completedAt: new Date(),
          },
        });

        ctx.stepsExecuted.push({
          id: stepRecord.id,
          stageIndex: i + 1,
          stageName,
          status: "COMPLETED",
          durationMs,
        });
      } catch (err) {
        const durationMs = Date.now() - stepStartTime;
        const errorMessage = err instanceof Error ? err.message : String(err);
        await prisma.reasoningStep.update({
          where: { id: stepRecord.id },
          data: {
            status: "FAILED",
            durationMs,
            errorMessage,
            completedAt: new Date(),
          },
        });
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

    // Persist all domain records in single transaction / parallel writes
    await Promise.all([
      // 1. Evidence Weight Records
      ...ctx.evidenceWeights.map((w) =>
        prisma.evidenceWeightRecord.create({
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
        }),
      ),

      // 2. Constraints
      ...ctx.constraints.map((c) =>
        prisma.constraintRecord.create({
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
        }),
      ),

      // 3. Assumptions
      ...ctx.assumptions.map((a) =>
        prisma.assumptionRecord.create({
          data: {
            sessionId: ctx.sessionId,
            statement: a.statement,
            justification: a.justification,
            riskLevel: a.riskLevel,
            isVerified: a.isVerified,
            impactIfInvalid: a.impactIfInvalid,
          },
        }),
      ),

      // 4. Alternatives
      ...ctx.alternatives.map((alt) =>
        prisma.alternativeRecord.create({
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
        }),
      ),

      // 5. Tradeoffs
      ...ctx.tradeoffs.map((tr) =>
        prisma.tradeoffRecord.create({
          data: {
            sessionId: ctx.sessionId,
            criterion: tr.criterion,
            alternativeAId: tr.alternativeAId,
            alternativeBId: tr.alternativeBId,
            comparisonDetails: tr.comparisonDetails,
            selectedOption: tr.selectedOption,
          },
        }),
      ),

      // 6. Conflicts
      ...ctx.conflicts.map((cf) =>
        prisma.conflictRecord.create({
          data: {
            sessionId: ctx.sessionId,
            conflictType: cf.conflictType,
            severity: cf.severity,
            description: cf.description,
            entitiesInvolved: cf.entitiesInvolved,
            mitigationRecommendation: cf.mitigationRecommendation,
            isResolved: cf.isResolved ?? false,
          },
        }),
      ),
    ]);

    // Persist Conclusion
    if (ctx.conclusion) {
      await prisma.engineeringConclusionRecord.create({
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
      });
    }

    // Persist Graph Nodes & Edges
    const createdNodes = new Map<string, string>();
    for (const node of graph.nodes) {
      const dbNode = await prisma.reasoningGraphNode.create({
        data: {
          sessionId: ctx.sessionId,
          organizationId: ctx.organizationId,
          nodeType: node.nodeType,
          label: node.label,
          confidence: node.confidence,
          weight: node.weight,
        },
      });
      createdNodes.set(node.id, dbNode.id);
    }

    for (const edge of graph.edges) {
      const dbSrc = createdNodes.get(edge.sourceNodeId);
      const dbTgt = createdNodes.get(edge.targetNodeId);
      if (dbSrc && dbTgt) {
        await prisma.reasoningGraphEdge.create({
          data: {
            sessionId: ctx.sessionId,
            organizationId: ctx.organizationId,
            sourceNodeId: dbSrc,
            targetNodeId: dbTgt,
            edgeType: edge.edgeType,
            justification: edge.justification,
            weight: edge.weight,
          },
        });
      }
    }

    // Update Session to COMPLETED
    await prisma.reasoningSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        summary: ctx.conclusion?.statement,
        confidenceScore: ctx.confidenceScore,
        uncertaintyNotes: ctx.unresolvedUncertainties,
        completedAt: new Date(),
      },
    });

    return ctx;
  } catch (error) {
    logger.error("Reasoning pipeline execution error", { sessionId, error });
    await prisma.reasoningSession.update({
      where: { id: sessionId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
      },
    });
    throw error;
  }
}
