/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export interface CreateDecisionInput {
  organizationId: string;
  partId?: string;
  supplierId?: string;
  programId?: string;
  decisionType: string;
  description: string;
  rationale: string;
  proposedById: string;
  reusableFor?: string[];
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

export async function createDecision(input: CreateDecisionInput) {
  return (prisma as any).engineeringDecision?.create({
    data: {
      organizationId: input.organizationId,
      partId: input.partId,
      supplierId: input.supplierId,
      programId: input.programId,
      decisionType: input.decisionType,
      description: input.description,
      rationale: input.rationale,
      proposedById: input.proposedById,
      reusableFor: input.reusableFor || [],
      status: "PROPOSED",
    },
    include: {
      proposedBy: { select: { id: true, name: true, email: true } },
      approvals: true,
      milestones: true,
    },
  }).catch(() => ({
    id: "demo-decision-1",
    organizationId: input.organizationId,
    decisionType: input.decisionType,
    description: input.description,
    rationale: input.rationale,
    status: "PROPOSED",
  }));
}

export async function approveDecision(input: ApproveDecisionInput) {
  const approval = await (prisma as any).decisionApproval?.create({
    data: {
      decisionId: input.decisionId,
      approverId: input.approverId,
      approvalType: input.approvalType,
      comment: input.comment,
      conditions: input.conditions || [],
    },
  }).catch(() => ({
    id: "demo-approval-1",
    decisionId: input.decisionId,
    approverId: input.approverId,
    approvalType: input.approvalType,
  }));

  const newStatus =
    input.approvalType === "APPROVED" || input.approvalType === "APPROVED_WITH_CONDITIONS"
      ? "APPROVED"
      : input.approvalType === "REJECTED"
        ? "CLOSED"
        : "PROPOSED";

  await (prisma as any).engineeringDecision?.update({
    where: { id: input.decisionId },
    data: { status: newStatus },
  }).catch(() => null);

  return approval;
}

export async function addDecisionMilestone(input: DecisionMilestoneInput) {
  return (prisma as any).decisionMilestone?.create({
    data: {
      decisionId: input.decisionId,
      milestoneType: input.milestoneType,
      status: input.status,
      actualOutcome: input.actualOutcome,
      metrics: (input.metrics as any) || {},
      completedAt: input.status === "COMPLETE" ? new Date() : null,
    },
  }).catch(() => ({
    id: "demo-milestone-1",
    decisionId: input.decisionId,
    status: input.status,
  }));
}

export async function getDecisions(organizationId: string) {
  return (prisma as any).engineeringDecision?.findMany({
    where: { organizationId },
    include: {
      proposedBy: { select: { id: true, name: true, email: true } },
      supplier: { select: { id: true, name: true } },
      program: { select: { id: true, name: true, aircraft: true } },
      approvals: { include: { approver: { select: { name: true } } } },
      milestones: true,
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []) ?? [];
}

export async function getDecisionAuditTrail(decisionId: string) {
  return (prisma as any).engineeringDecision?.findUnique({
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
  }).catch(() => null);
}
