import { prisma } from "@/server/db";
import { ValidationError, NotFoundError } from "@/shared/errors";
import { createPrecedent } from "@/server/precedents/precedent-service";
import type { Prisma } from "@prisma/client";

export interface CreateDecisionInput {
  organizationId: string;
  partId?: string;
  supplierId?: string;
  programId?: string;
  decisionType?: string;
  description?: string;
  rationale?: string;
  proposedById?: string;
  reusableFor?: string[];
  question?: string;
  context?: string;
  subjectEntityId?: string;
  requiredEvidenceTypes?: string[];
}

export interface ApproveDecisionInput {
  decisionId: string;
  approverId: string;
  organizationId: string;
  approvalType: "APPROVED" | "APPROVED_WITH_CONDITIONS" | "REJECTED" | "DEFERRED";
  comment?: string;
  conditions?: string[];
}

export interface DecisionMilestoneInput {
  decisionId: string;
  organizationId: string;
  milestoneType: "FIRST_ARTICLE" | "PRODUCTION" | "PROGRAM_DELIVERY" | "FIELD_OPERATION";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETE" | "FAILED";
  actualOutcome?: string;
  metrics?: Record<string, unknown>;
}

export async function createDecision(input: CreateDecisionInput) {
  if (input.question !== undefined) {
    if (!input.question || input.question.trim().length === 0) {
      throw new ValidationError({ question: ["Question is required"] });
    }
    return prisma.decision.create({
      data: {
        organizationId: input.organizationId,
        question: input.question,
        context: input.context,
        status: "INTAKE",
      },
    });
  }

  if (!input.proposedById) {
    throw new ValidationError({ proposedById: ["Proposer is required"] });
  }

  return prisma.engineeringDecision.create({
    data: {
      organizationId: input.organizationId,
      partId: input.partId,
      supplierId: input.supplierId,
      programId: input.programId,
      decisionType: input.decisionType || "DESIGN_CHOICE",
      description: input.description || "",
      rationale: input.rationale || "",
      proposedById: input.proposedById,
      reusableFor: input.reusableFor || [],
      status: "PROPOSED",
    },
    include: {
      proposedBy: { select: { id: true, name: true, email: true } },
      approvals: true,
      milestones: true,
    },
  });
}

export async function updateDecision(
  id: string,
  organizationId: string,
  updates: {
    status?: string;
    subjectEntityId?: string;
    supportingEvidence?: unknown[];
    contradictions?: unknown[];
    unresolvedGaps?: unknown[];
    precedents?: unknown[];
    finalDecision?: string;
    rationale?: string;
  },
) {
  if (updates.status === "FINALIZED") {
    throw new ValidationError({
      status: ["Cannot finalize directly through updateDecision. Use finalizeDecision."],
    });
  }

  const existing = await prisma.decision.findFirst({
    where: { id, organizationId, deletedAt: null },
  });
  if (!existing) {
    throw new NotFoundError("Decision", id);
  }

  return prisma.decision.update({
    where: { id },
    data: {
      status: updates.status,
      subjectEntityId: updates.subjectEntityId,
      supportingEvidence: updates.supportingEvidence as Prisma.InputJsonValue | undefined,
      contradictions: updates.contradictions as Prisma.InputJsonValue | undefined,
      unresolvedGaps: updates.unresolvedGaps as Prisma.InputJsonValue | undefined,
      precedents: updates.precedents as Prisma.InputJsonValue | undefined,
      finalDecision: updates.finalDecision,
      rationale: updates.rationale,
    },
  });
}

export async function finalizeDecision(
  id: string,
  organizationId: string,
  userId: string,
  finalDecision: string,
  rationale: string,
) {
  if (!finalDecision || finalDecision.trim().length === 0) {
    throw new ValidationError({ finalDecision: ["Final decision text is required"] });
  }
  if (!rationale || rationale.trim().length === 0) {
    throw new ValidationError({ rationale: ["Rationale is required"] });
  }

  const existing = await prisma.decision.findFirst({
    where: { id, organizationId, deletedAt: null },
  });
  if (!existing) {
    throw new NotFoundError("Decision", id);
  }

  const result = await prisma.decision.update({
    where: { id },
    data: {
      status: "FINALIZED",
      finalDecision,
      rationale,
      finalizedAt: new Date(),
      finalizedById: userId,
    },
  });

  await createPrecedent({
    organizationId,
    title: existing.question || "Engineering Decision",
    summary: rationale,
    engineeringQuestion: existing.question || "Engineering verification inquiry",
    decisionMade: finalDecision,
    supportingEvidence: [],
    contradictions: [],
    missingEvidence: [],
    outcome: finalDecision,
    lessonsLearned: rationale,
    tags: [],
    userId,
  });

  return result;
}

export async function approveDecision(input: ApproveDecisionInput) {
  const decision = await prisma.engineeringDecision.findFirst({
    where: { id: input.decisionId, organizationId: input.organizationId },
  });
  if (!decision) {
    throw new NotFoundError("Decision", input.decisionId);
  }

  const approval = await prisma.decisionApproval.create({
    data: {
      decisionId: input.decisionId,
      approverId: input.approverId,
      approvalType: input.approvalType,
      comment: input.comment,
      conditions: input.conditions || [],
    },
  });

  const newStatus =
    input.approvalType === "APPROVED" || input.approvalType === "APPROVED_WITH_CONDITIONS"
      ? "APPROVED"
      : input.approvalType === "REJECTED"
        ? "CLOSED"
        : "PROPOSED";

  await prisma.engineeringDecision.update({
    where: { id: input.decisionId },
    data: { status: newStatus },
  });

  return approval;
}

export async function addDecisionMilestone(input: DecisionMilestoneInput) {
  const decision = await prisma.engineeringDecision.findFirst({
    where: { id: input.decisionId, organizationId: input.organizationId },
  });
  if (!decision) {
    throw new NotFoundError("Decision", input.decisionId);
  }

  return prisma.decisionMilestone.create({
    data: {
      decisionId: input.decisionId,
      milestoneType: input.milestoneType,
      status: input.status,
      actualOutcome: input.actualOutcome,
      metrics: (input.metrics ?? {}) as Prisma.InputJsonValue,
      completedAt: input.status === "COMPLETE" ? new Date() : null,
    },
  });
}

export async function getDecisions(organizationId: string) {
  const [ledger, engineering] = await Promise.all([
    prisma.decision.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.engineeringDecision.findMany({
      where: { organizationId },
      include: {
        proposedBy: { select: { id: true, name: true, email: true } },
        supplier: { select: { id: true, name: true } },
        program: { select: { id: true, name: true, aircraft: true } },
        approvals: { include: { approver: { select: { name: true } } } },
        milestones: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return [...engineering, ...ledger];
}

export async function getDecisionAuditTrail(decisionId: string, organizationId: string) {
  const engineering = await prisma.engineeringDecision.findFirst({
    where: { id: decisionId, organizationId },
    include: {
      proposedBy: { select: { id: true, name: true, email: true } },
      supplier: { select: { id: true, name: true } },
      program: { select: { id: true, name: true, aircraft: true } },
      approvals: {
        include: { approver: { select: { id: true, name: true } } },
        orderBy: { approvedAt: "asc" },
      },
      milestones: { orderBy: { createdAt: "asc" } },
    },
  });
  if (engineering) return engineering;

  return prisma.decision.findFirst({
    where: { id: decisionId, organizationId, deletedAt: null },
  });
}
