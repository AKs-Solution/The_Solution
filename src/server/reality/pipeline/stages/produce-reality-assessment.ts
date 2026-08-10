import type { WorkflowStage } from "@/server/orchestrator";
import type { RealityAssessmentResult, RealityPipelineContext } from "../../types";
import type { RealityOutcome } from "../../constants";
import { prisma } from "@/server/db";

/**
 * Stage 8 - pure derivation, no I/O. Fixed precedence:
 *   1. Missing evidence (or the source run itself was INSUFFICIENT_EVIDENCE) -> INSUFFICIENT_EVIDENCE
 *   2. Ingestion incomplete (pending or failed jobs for in-scope documents)  -> INCOMPLETE
 *   3. Any contradiction still open as of right now                        -> CONTRADICTED
 *   4. Source run NEEDS_REVIEW/BLOCKED, or any current rule outcome is      -> NEEDS_REVIEW
 *      NEEDS_REVIEW/BLOCKED
 *   5. Source run FAILED                                                   -> NEEDS_REVIEW
 *   6. Source run PASSED but conflicting evidence was recorded             -> CONDITIONALLY_VERIFIED
 *   7. Otherwise (PASSED, no open contradictions, ingestion complete,      -> VERIFIED
 *      no conflicting evidence)
 * Never invents a conclusion beyond what stages 1-7 already established.
 */
export function deriveRealityAssessment(ctx: RealityPipelineContext): RealityAssessmentResult {
  const evidence = ctx.evidenceSummary;
  const ingestion = ctx.ingestionCompleteness;
  const openContradictionCount = ctx.openContradictionCount ?? 0;
  const ruleOutcomes = new Set((ctx.ruleSummary ?? []).map((r) => r.outcome));

  let outcome: RealityOutcome;
  let reasoning: string;

  if (
    (evidence?.missingEvidenceCount ?? 0) > 0 ||
    ctx.orchestrationOutcome === "INSUFFICIENT_EVIDENCE"
  ) {
    outcome = "INSUFFICIENT_EVIDENCE";
    reasoning = "Required evidence is missing; engineering reality cannot be established.";
  } else if (ingestion && !ingestion.allComplete) {
    outcome = "INCOMPLETE";
    reasoning = `${ingestion.pendingJobCount} pending and ${ingestion.failedJobCount} failed ingestion job(s) affect the evidence base for this entity.`;
  } else if (openContradictionCount > 0) {
    outcome = "CONTRADICTED";
    reasoning = `${openContradictionCount} contradiction(s) remain open as of this assessment.`;
  } else if (
    ctx.orchestrationOutcome === "NEEDS_REVIEW" ||
    ctx.orchestrationOutcome === "BLOCKED" ||
    ruleOutcomes.has("NEEDS_REVIEW") ||
    ruleOutcomes.has("BLOCKED")
  ) {
    outcome = "NEEDS_REVIEW";
    reasoning = "The source orchestration run or a re-read rule outcome requires human review.";
  } else if (ctx.orchestrationOutcome === "FAILED") {
    outcome = "NEEDS_REVIEW";
    reasoning =
      "The source orchestration run recorded a failed rule; review is required before reality can be confirmed.";
  } else if ((evidence?.conflictingEvidenceCount ?? 0) > 0) {
    outcome = "CONDITIONALLY_VERIFIED";
    reasoning =
      "All rules passed and no contradictions are open, but conflicting evidence was recorded for this entity.";
  } else {
    outcome = "VERIFIED";
    reasoning =
      "All rules passed, no contradictions are open, ingestion is complete, and no conflicting evidence was recorded.";
  }

  // Modify outcome based on production readiness if requested
  if (ctx.productionReadiness) {
    if (!ctx.productionReadiness.isReady && outcome === "VERIFIED") {
      outcome = "CONDITIONALLY_VERIFIED";
      reasoning += ` However, production readiness is at risk: ${ctx.productionReadiness.risks.join("; ")}`;
    } else if (!ctx.productionReadiness.isReady) {
      reasoning += ` Additionally, production readiness is at risk: ${ctx.productionReadiness.risks.join("; ")}`;
    }
  }

  return { outcome, reasoning, productionReadiness: ctx.productionReadiness };
}

export const produceRealityAssessmentStage: WorkflowStage<RealityPipelineContext> = {
  name: "PRODUCE_REALITY_ASSESSMENT",
  execute: async (ctx) => {
    // Assess Production Readiness
    let isReady = true;
    const risks: string[] = [];
    let prScore = 100;

    try {
      if (ctx.entitiesEvaluated && ctx.entitiesEvaluated.length > 0) {
        // Look up any active NCRs for the suppliers attached to these entities
        // In AKSCI, EngineeringEntities relate to Suppliers via ManufacturingEvents or SupplierRelationships
        // For simplicity, we just check manufacturing events and quality events for the specific entities
        const ncrCount = await (prisma as any).qualityEvent?.count({
          where: {
            organizationId: ctx.organizationId,
            entityId: { in: ctx.entitiesEvaluated },
            status: "OPEN",
          },
        }).catch(() => 0) ?? 0;

        if (ncrCount > 0) {
          isReady = false;
          risks.push(
            `${ncrCount} open Non-Conformance Reports (NCRs) found for evaluated components`,
          );
          prScore -= ncrCount * 15;
        }

        const mfgEvents = await (prisma as any).manufacturingEvent?.findMany({
          where: {
            organizationId: ctx.organizationId,
            entityId: { in: ctx.entitiesEvaluated },
          },
          select: { quantityProduced: true, quantityScrapped: true },
        }).catch(() => []) ?? [];

        let totalProduced = 0;
        let totalScrapped = 0;
        mfgEvents.forEach((e: any) => {
          totalProduced += e.quantityProduced;
          totalScrapped += e.quantityScrapped;
        });

        if (totalProduced > 0) {
          const scrapRate = (totalScrapped / totalProduced) * 100;
          if (scrapRate > 10) {
            isReady = false;
            risks.push(`High historical scrap rate (${scrapRate.toFixed(1)}%) detected`);
            prScore -= 30;
          }
        }
      }
    } catch {
      // Ignore errors for this optional check
    }

    ctx.productionReadiness = {
      isReady,
      risks,
      score: Math.max(0, prScore),
    };

    const assessment = deriveRealityAssessment(ctx);
    return {
      patch: {
        assessment,
        productionReadiness: ctx.productionReadiness,
      },
      output: { outcome: assessment.outcome },
    };
  },
};
