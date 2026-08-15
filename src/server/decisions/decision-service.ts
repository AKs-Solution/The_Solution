/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { createPrecedent } from "@/server/precedents/precedent-service";

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
  approvalType: "APPROVED" | "APPROVED_WITH_CONDITIONS" | "REJECTED" | "DEFERRED";
  comment?: string;
  conditions?: string[];
}

export interface DecisionMilestoneInput {
  decisionId: string;
  milestoneType: "FIRST_ARTICLE" | "PRODUCTION" | "PROGRAM_DELIVERY" | "FIELD_OPERATION";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETE" | "FAILED";
  actualOutcome?: string;
  metrics?: Record<string, unknown>;
}

// Live session memory cache for decisions (active when DB is offline)
const MEMORY_DECISIONS: any[] = [];

export async function createDecision(input: CreateDecisionInput) {
  if ("question" in input && input.question) {
    if (!input.question || input.question.trim().length === 0) {
      throw new ValidationError({ question: ["Question is required"] });
    }
    try {
      if ((prisma as any).decision?.create) {
        return await (prisma as any).decision.create({
          data: {
            organizationId: input.organizationId,
            question: input.question,
            context: input.context,
            status: "INTAKE",
          },
        });
      }
    } catch {
      // offline fallback
    }
  }

  try {
    const record = await (prisma as any).engineeringDecision?.create({
      data: {
        organizationId: input.organizationId,
        partId: input.partId,
        supplierId: input.supplierId,
        programId: input.programId,
        decisionType: input.decisionType || "DESIGN_CHOICE",
        description: input.description || input.question || "",
        rationale: input.rationale || input.context || "",
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
    if (record) {
      MEMORY_DECISIONS.unshift(record);
      return record;
    }
  } catch (err) {
    console.warn("[DecisionService] DB offline fallback decision creation:", err);
  }

  const memoryRecord = {
    id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    organizationId: input.organizationId,
    partId: input.partId || null,
    supplierId: input.supplierId || null,
    programId: input.programId || null,
    decisionType: input.decisionType || "TOLERANCE_CHANGE",
    description: input.description || input.question || "",
    rationale: input.rationale || input.context || "",
    proposedById: input.proposedById || "demo-user-101",
    proposedBy: {
      id: input.proposedById || "demo-user-101",
      name: "Flight Engineer",
      email: "engineer@consecuencia.io",
    },
    reusableFor: input.reusableFor || [],
    status: "PROPOSED",
    epistemicStatus: "RECORDED",
    createdAt: new Date(),
    approvals: [],
    milestones: [],
  };
  MEMORY_DECISIONS.unshift(memoryRecord);
  return memoryRecord;
}

export async function updateDecision(
  id: string,
  organizationId: string,
  updates: {
    status?: string;
    subjectEntityId?: string;
    supportingEvidence?: any[];
    contradictions?: any[];
    unresolvedGaps?: any[];
    precedents?: any[];
    finalDecision?: string;
    rationale?: string;
  },
) {
  if (updates.status === "FINALIZED") {
    throw new ValidationError({
      status: ["Cannot finalize directly through updateDecision. Use finalizeDecision."],
    });
  }

  try {
    const existing = await (prisma as any).decision?.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
    if (existing && (prisma as any).decision?.update) {
      return await (prisma as any).decision.update({
        where: { id },
        data: {
          status: updates.status,
          subjectEntityId: updates.subjectEntityId,
          supportingEvidence: updates.supportingEvidence,
          contradictions: updates.contradictions,
          unresolvedGaps: updates.unresolvedGaps,
          precedents: updates.precedents,
          finalDecision: updates.finalDecision,
          rationale: updates.rationale,
        },
      });
    }
  } catch {
    // offline fallback
  }

  const memIdx = MEMORY_DECISIONS.findIndex((d) => d.id === id);
  if (memIdx >= 0) {
    MEMORY_DECISIONS[memIdx] = { ...MEMORY_DECISIONS[memIdx], ...updates };
    return MEMORY_DECISIONS[memIdx];
  }

  return { id, organizationId, ...updates };
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

  let result: any = null;
  try {
    const existing = await (prisma as any).decision?.findFirst({
      where: { id, organizationId, deletedAt: null },
    });
    if (existing && (prisma as any).decision?.update) {
      result = await (prisma as any).decision.update({
        where: { id },
        data: {
          status: "FINALIZED",
          finalDecision,
          rationale,
          finalizedAt: new Date(),
          finalizedById: userId,
        },
      });
    }
  } catch {
    // offline fallback
  }

  if (!result) {
    result = {
      id,
      organizationId,
      status: "FINALIZED",
      finalDecision,
      rationale,
      finalizedAt: new Date(),
      finalizedById: userId,
    };
  }

  const memIdx = MEMORY_DECISIONS.findIndex((d) => d.id === id);
  if (memIdx >= 0) {
    MEMORY_DECISIONS[memIdx] = {
      ...MEMORY_DECISIONS[memIdx],
      status: "FINALIZED",
      finalDecision,
      rationale,
      finalizedAt: new Date(),
    };
  }

  try {
    if (typeof createPrecedent === "function") {
      await createPrecedent({
        organizationId,
        decisionId: id,
        title: "Engineering Decision",
        engineeringQuestion: "Engineering verification inquiry",
        decisionMade: finalDecision,
        summary: rationale,
        domain: "ENGINEERING",
        context: "",
        rationale,
        outcome: finalDecision,
      } as any).catch(() => null);
    }
  } catch {
    // Ignore precedent creation error
  }

  return result;
}

export async function approveDecision(input: ApproveDecisionInput) {
  try {
    const approval = await (prisma as any).decisionApproval?.create({
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

    await (prisma as any).engineeringDecision?.update({
      where: { id: input.decisionId },
      data: { status: newStatus },
    });

    return approval;
  } catch {
    // offline fallback
  }

  const mem = MEMORY_DECISIONS.find((d) => d.id === input.decisionId);
  if (mem) {
    mem.status = input.approvalType === "REJECTED" ? "CLOSED" : "APPROVED";
  }
  return { id: `appr-${Date.now()}`, ...input };
}

export async function addDecisionMilestone(input: DecisionMilestoneInput) {
  try {
    return await (prisma as any).decisionMilestone?.create({
      data: {
        decisionId: input.decisionId,
        milestoneType: input.milestoneType,
        status: input.status,
        actualOutcome: input.actualOutcome,
        metrics: (input.metrics as any) || {},
        completedAt: input.status === "COMPLETE" ? new Date() : null,
      },
    });
  } catch {
    return { id: `mile-${Date.now()}`, ...input };
  }
}

export async function getDecisions(organizationId: string) {
  try {
    const records = await (prisma as any).engineeringDecision?.findMany({
      where: { organizationId },
      include: {
        proposedBy: { select: { id: true, name: true, email: true } },
        supplier: { select: { id: true, name: true } },
        program: { select: { id: true, name: true, aircraft: true } },
        approvals: { include: { approver: { select: { name: true } } } },
        milestones: true,
      },
      orderBy: { createdAt: "desc" },
    });
    if (records && records.length > 0) return records;
  } catch {
    // DB offline
  }

  return MEMORY_DECISIONS.filter((d) => !d.organizationId || d.organizationId === organizationId);
}

export async function getDecisionAuditTrail(decisionId: string) {
  try {
    const record = await (prisma as any).engineeringDecision?.findUnique({
      where: { id: decisionId },
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
    if (record) return record;
  } catch {
    // DB offline
  }

  const mem = MEMORY_DECISIONS.find((d) => d.id === decisionId);
  return mem || null;
}
