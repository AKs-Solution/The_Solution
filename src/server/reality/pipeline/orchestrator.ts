import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { logger } from "@/shared/logging";
import { recordAuditEvent } from "@/server/audit";
import { createNotification } from "@/server/notifications";
import {
  runWorkflow,
  WorkflowCancelledError,
  StageExecutionError,
  type WorkflowStage,
} from "@/server/orchestrator";
import { DEFAULT_REALITY_STAGE_RETRY, DEFAULT_REALITY_STAGE_TIMEOUT_MS } from "../constants";
import type { RealityPipelineContext } from "../types";
import {
  loadEngineeringContextStage,
  resolveDependenciesStage,
  gatherEvidenceStage,
  executeRuleEvaluationsStage,
  evaluateContradictionsStage,
  evaluateTraceabilityStage,
  assessEvidenceCompletenessStage,
  produceRealityAssessmentStage,
} from "./stages";

/** The fixed, deterministic 8-stage assessment order (mission-specified). Every stage always runs - none are condition-gated, since each is a cheap read of already-computed data rather than an expensive re-execution. */
function buildStages(): WorkflowStage<RealityPipelineContext>[] {
  const withDefaults = (stage: WorkflowStage<RealityPipelineContext>) => ({
    ...stage,
    retry: DEFAULT_REALITY_STAGE_RETRY,
    timeoutMs: DEFAULT_REALITY_STAGE_TIMEOUT_MS,
  });

  return [
    withDefaults(loadEngineeringContextStage),
    withDefaults(resolveDependenciesStage),
    withDefaults(gatherEvidenceStage),
    withDefaults(executeRuleEvaluationsStage),
    withDefaults(evaluateContradictionsStage),
    withDefaults(evaluateTraceabilityStage),
    withDefaults(assessEvidenceCompletenessStage),
    withDefaults(produceRealityAssessmentStage),
  ];
}

async function shouldCancel(assessmentId: string): Promise<boolean> {
  const current = await prisma.realityAssessment.findUnique({
    where: { id: assessmentId },
    select: { cancelRequested: true },
  });
  return current?.cancelRequested ?? false;
}

/** Runs the full 8-stage pipeline for one previously-created QUEUED RealityAssessment. Never throws - every outcome is reflected in the assessment's persisted status. */
export async function runRealityAssessment(assessmentId: string): Promise<void> {
  const assessment = await prisma.realityAssessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) {
    logger.error("Reality assessment not found", { assessmentId });
    return;
  }

  const startedAt = new Date();

  await prisma.realityAssessment.update({
    where: { id: assessmentId },
    data: { status: "RUNNING", startedAt, cancelRequested: false },
  });
  await recordAuditEvent(
    assessment.organizationId,
    "REALITY_ASSESSMENT_STARTED",
    "RealityAssessment",
    assessmentId,
    {
      subjectEntityId: assessment.subjectEntityId,
      orchestrationRunId: assessment.orchestrationRunId,
    },
  );

  const initialContext: RealityPipelineContext = {
    organizationId: assessment.organizationId,
    triggeredById: assessment.triggeredById ?? undefined,
    subjectEntityId: assessment.subjectEntityId,
    orchestrationRunId: assessment.orchestrationRunId ?? undefined,
  };

  let stageIndex = 0;

  try {
    const { context } = await runWorkflow(buildStages(), initialContext, {
      shouldCancel: () => shouldCancel(assessmentId),
      onStageEvent: async (event) => {
        stageIndex = event.stageIndex;
        await prisma.realityStageLog.create({
          data: {
            assessmentId,
            stageName: event.stageName,
            stageIndex: event.stageIndex,
            status: event.status,
            attempt: event.attempt,
            startedAt: event.startedAt,
            completedAt: event.completedAt,
            durationMs: event.durationMs,
            errorMessage: event.errorMessage,
            output: (event.output ?? Prisma.DbNull) as Prisma.InputJsonValue,
          },
        });
        await prisma.realityAssessment.update({
          where: { id: assessmentId },
          data: { currentStage: event.stageName, stageIndex: event.stageIndex },
        });
      },
    });

    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    await prisma.realityAssessment.update({
      where: { id: assessmentId },
      data: {
        status: "COMPLETED",
        currentStage: null,
        completedAt,
        durationMs,
        outcome: context.assessment?.outcome,
        reasoning: context.assessment?.reasoning,
        entitiesEvaluated: (context.entitiesEvaluated ?? []) as Prisma.InputJsonValue,
        evidenceSummary: (context.evidenceSummary ?? Prisma.DbNull) as Prisma.InputJsonValue,
        ruleSummary: (context.ruleSummary ?? []) as Prisma.InputJsonValue,
        contradictionSummary: (context.contradictionSummary ?? []) as Prisma.InputJsonValue,
        traceabilitySummary: {
          recordCount: context.traceabilityRecordCount ?? 0,
        } as Prisma.InputJsonValue,
        ingestionCompleteness: (context.ingestionCompleteness ??
          Prisma.DbNull) as Prisma.InputJsonValue,
      },
    });

    await recordAuditEvent(
      assessment.organizationId,
      "REALITY_ASSESSMENT_COMPLETED",
      "RealityAssessment",
      assessmentId,
      { outcome: context.assessment?.outcome },
    );

    if (assessment.triggeredById) {
      await createNotification(assessment.organizationId, {
        userId: assessment.triggeredById,
        type: "reality.completed",
        title: "Engineering reality assessment complete",
        message: `Outcome: ${context.assessment?.outcome ?? "UNKNOWN"}`,
        link: `/reality/${assessmentId}`,
      });
    }
  } catch (error) {
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    if (error instanceof WorkflowCancelledError) {
      await prisma.realityAssessment.update({
        where: { id: assessmentId },
        data: {
          status: "CANCELLED",
          currentStage: null,
          completedAt,
          durationMs,
          errorStage: error.stageName,
          errorMessage: "Assessment was cancelled",
        },
      });
      await recordAuditEvent(
        assessment.organizationId,
        "REALITY_ASSESSMENT_CANCELLED",
        "RealityAssessment",
        assessmentId,
        { stageName: error.stageName },
      );
      if (assessment.triggeredById) {
        await createNotification(assessment.organizationId, {
          userId: assessment.triggeredById,
          type: "reality.cancelled",
          title: "Engineering reality assessment cancelled",
          message: `Cancelled before stage "${error.stageName}"`,
          link: `/reality/${assessmentId}`,
        });
      }
      return;
    }

    const stageName = error instanceof StageExecutionError ? error.stageName : "UNKNOWN";
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Reality assessment failed", { assessmentId, stage: stageName, error: message });

    await prisma.realityAssessment.update({
      where: { id: assessmentId },
      data: {
        status: "FAILED",
        currentStage: null,
        completedAt,
        durationMs,
        errorStage: stageName,
        errorMessage: message,
        stageIndex,
      },
    });
    await recordAuditEvent(
      assessment.organizationId,
      "REALITY_ASSESSMENT_FAILED",
      "RealityAssessment",
      assessmentId,
      { stageName, errorMessage: message },
    );
    if (assessment.triggeredById) {
      await createNotification(assessment.organizationId, {
        userId: assessment.triggeredById,
        type: "reality.failed",
        title: "Engineering reality assessment failed",
        message: `Failed at stage "${stageName}": ${message}`,
        link: `/reality/${assessmentId}`,
      });
    }
  }
}
