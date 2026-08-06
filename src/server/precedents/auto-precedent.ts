import { prisma } from "@/server/db";
import { createPrecedent, updatePrecedent } from "./precedent-service";
import { PrecedentMatchContext } from "@/features/precedents/types";
import { logger } from "@/shared/logging";

interface DecisionData {
  organizationId: string;
  userId?: string;
  question?: string;
  entityId?: string;
  entityName?: string;
  entityType?: string;
  decision?: string;
  outcome?: string;
  supportingEvidence?: string[];
  contradictions?: string[];
  missingEvidence?: string[];
  suppliers?: string[];
  components?: string[];
  standards?: string[];
  certifications?: string[];
  requirements?: string[];
  documents?: string[];
  tags?: string[];
  confidence?: number;
}

/**
 * Automatically create or update a precedent based on completed decision data.
 */
export async function autoCreatePrecedent(data: DecisionData): Promise<void> {
  if (!data.organizationId) {
    logger.warn("autoCreatePrecedent skipped: no organizationId");
    return;
  }

  const title = data.entityName
    ? `Decision: ${data.entityName}`
    : data.question
      ? `Decision: ${data.question.slice(0, 80)}`
      : `Engineering Decision ${new Date().toISOString().slice(0, 10)}`;

  const existing = await prisma.historicalPrecedent.findFirst({
    where: {
      organizationId: data.organizationId,
      deletedAt: null,
      OR: [
        data.entityId ? { sourceEntityId: data.entityId } : undefined,
        { title: { contains: title.slice(0, 60) } },
      ].filter((x): x is Exclude<typeof x, undefined> => Boolean(x)),
    },
    orderBy: { createdAt: "desc" },
  });

  const input = {
    organizationId: data.organizationId,
    title,
    summary: data.question
      ? `Engineering decision for: ${data.question}`
      : `Engineering decision for ${data.entityName || "unknown entity"}`,
    engineeringQuestion: data.question || "",
    decisionMade: data.decision || "Decision recorded.",
    supportingEvidence: data.supportingEvidence || [],
    contradictions: data.contradictions || [],
    missingEvidence: data.missingEvidence || [],
    outcome: data.outcome || "",
    lessonsLearned: "",
    relatedSuppliers: data.suppliers || [],
    relatedComponents: data.components || [],
    relatedStandards: data.standards || [],
    relatedCertifications: data.certifications || [],
    relatedRequirements: data.requirements || [],
    relatedDocuments: data.documents || [],
    tags: data.tags || [],
    userId: data.userId,
  };

  if (existing) {
    await updatePrecedent(existing.id, data.organizationId, input);
    logger.info("Auto-precedent updated", { id: existing.id, title });
  } else {
    await createPrecedent(input);
    logger.info("Auto-precedent created", { title });
  }
}

export function buildPrecedentMatchContext(data: DecisionData): PrecedentMatchContext {
  return {
    question: data.question,
    suppliers: data.suppliers,
    components: data.components,
    requirements: data.requirements,
    standards: data.standards,
    certifications: data.certifications,
    documents: data.documents,
    contradictions: data.contradictions,
    evidence: data.supportingEvidence,
    missingEvidence: data.missingEvidence,
    tags: data.tags,
  };
}

export const createPrecedentFromAssessment = autoCreatePrecedent;
