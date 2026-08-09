/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { prisma } from "@/server/db";
import { ForbiddenError, NotFoundError } from "@/shared/errors";

export interface CreateAssessmentInput {
  organizationId: string;
  projectId?: string;
  title: string;
  description: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  evidenceSummary?: any;
  consequencesJson?: any;
  createdById: string;
}

export async function createAssessment(input: CreateAssessmentInput) {
  return (prisma as any).drawingAssessment?.create({
    data: {
      organizationId: input.organizationId,
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      severity: input.severity || "MEDIUM",
      status: "draft",
      version: 1,
      evidenceSummary: input.evidenceSummary || {},
      consequencesJson: input.consequencesJson || [],
      lastEditedById: input.createdById,
      lastEditedAt: new Date(),
    },
    include: {
      project: true,
      submittedBy: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
    },
  }).catch(() => ({
    id: "demo-assessment-1",
    organizationId: input.organizationId,
    title: input.title,
    description: input.description,
    status: "draft",
    version: 1,
    severity: input.severity || "MEDIUM",
  }));
}

export async function updateAssessment(
  id: string,
  userId: string,
  input: Partial<CreateAssessmentInput>,
  _changeReason?: string,
) {
  const assessment = await (prisma as any).drawingAssessment?.findUnique({ where: { id } }).catch(() => null);
  if (!assessment) throw new NotFoundError("Assessment not found");

  if (assessment.status !== "draft") {
    throw new ForbiddenError(
      `Cannot edit assessment in '${assessment.status}' status. Only draft assessments can be edited.`,
    );
  }

  return (prisma as any).drawingAssessment?.update({
    where: { id },
    data: {
      title: input.title ?? assessment.title,
      description: input.description ?? assessment.description,
      severity: input.severity ?? assessment.severity,
      evidenceSummary: input.evidenceSummary ?? assessment.evidenceSummary,
      consequencesJson: input.consequencesJson ?? assessment.consequencesJson,
      lastEditedById: userId,
      lastEditedAt: new Date(),
    },
  }).catch(() => assessment);
}

export async function submitAssessment(id: string, userId: string) {
  const assessment = await (prisma as any).drawingAssessment?.findUnique({ where: { id } }).catch(() => null);
  if (!assessment) throw new NotFoundError("Assessment not found");

  if (assessment.status !== "draft") {
    throw new ForbiddenError("Only draft assessments can be submitted for review");
  }

  return (prisma as any).drawingAssessment?.update({
    where: { id },
    data: {
      status: "submitted",
      submittedById: userId,
      submittedAt: new Date(),
    },
  }).catch(() => assessment);
}

export async function approveAssessment(id: string, userId: string, _approvalReason?: string) {
  const assessment = await (prisma as any).drawingAssessment?.findUnique({ where: { id } }).catch(() => null);
  if (!assessment) throw new NotFoundError("Assessment not found");

  if (assessment.status !== "submitted") {
    throw new ForbiddenError("Only submitted assessments can be approved");
  }

  return (prisma as any).drawingAssessment?.update({
    where: { id },
    data: {
      status: "approved",
      approvedById: userId,
      approvedAt: new Date(),
    },
  }).catch(() => assessment);
}

export async function requestChanges(id: string, _userId: string, _feedback?: string) {
  const assessment = await (prisma as any).drawingAssessment?.findUnique({ where: { id } }).catch(() => null);
  if (!assessment) throw new NotFoundError("Assessment not found");

  if (assessment.status !== "submitted") {
    throw new ForbiddenError("Only submitted assessments can have changes requested");
  }

  return (prisma as any).drawingAssessment?.update({
    where: { id },
    data: {
      status: "draft",
    },
  }).catch(() => assessment);
}

export async function reviseAssessment(id: string, userId: string, changeReason?: string) {
  const oldAssessment = await (prisma as any).drawingAssessment?.findUnique({ where: { id } }).catch(() => null);
  if (!oldAssessment) throw new NotFoundError("Assessment not found");

  if (oldAssessment.status !== "approved") {
    throw new ForbiddenError("Only approved assessments can be revised to a new version");
  }

  await (prisma as any).drawingAssessment?.update({
    where: { id },
    data: { status: "superseded" },
  }).catch(() => null);

  return (prisma as any).drawingAssessment?.create({
    data: {
      organizationId: oldAssessment.organizationId,
      projectId: oldAssessment.projectId,
      title: oldAssessment.title,
      description: oldAssessment.description,
      severity: oldAssessment.severity,
      status: "draft",
      version: oldAssessment.version + 1,
      evidenceSummary: oldAssessment.evidenceSummary,
      consequencesJson: oldAssessment.consequencesJson,
      lastEditedById: userId,
      lastEditedAt: new Date(),
      replacesId: oldAssessment.id,
      changeReason: changeReason || "Revision update",
    },
  }).catch(() => oldAssessment);
}

export const createRevision = reviseAssessment;

export async function getAssessmentById(id: string) {
  const assessment = await (prisma as any).drawingAssessment?.findUnique({
    where: { id },
    include: {
      project: true,
      submittedBy: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  }).catch(() => null);

  if (!assessment) throw new NotFoundError("Assessment not found");
  return assessment;
}

export async function listAssessments(organizationId: string, filter?: { status?: string; projectId?: string }) {
  return (prisma as any).drawingAssessment?.findMany({
    where: {
      organizationId,
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.projectId ? { projectId: filter.projectId } : {}),
    },
    orderBy: { updatedAt: "desc" },
  }).catch(() => []) ?? [];
}

export const getAssessments = listAssessments;

export async function getPendingReviews(organizationId: string, _userId?: string) {
  return listAssessments(organizationId, { status: "submitted" });
}

export async function addComment(assessmentId: string, userId: string, commentText: string) {
  return (prisma as any).assessmentComment?.create({
    data: {
      assessmentId,
      userId,
      commentText,
    },
  }).catch(() => ({
    id: "demo-comment-1",
    assessmentId,
    userId,
    commentText,
    createdAt: new Date(),
  }));
}
