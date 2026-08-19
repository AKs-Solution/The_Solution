import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { sendAdminReplyEmail } from "@/server/mail";
import { AppError } from "@/shared/errors";
import { logger } from "@/shared/logging";

interface InboxReply {
  body: string;
  createdAt: string;
}

type InboxMetadata = { category?: string; replies?: InboxReply[] } | null;

function metadataOf(value: Prisma.JsonValue | null): InboxMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as InboxMetadata;
}

function repliesOf(value: Prisma.JsonValue | null): InboxReply[] {
  const replies = metadataOf(value)?.replies;
  return Array.isArray(replies) ? replies : [];
}

export async function getAdminSummary() {
  const [totalUsers, activeUsers, totalOrganizations, totalInbox, openInbox] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, status: "active" } }),
    prisma.organization.count({ where: { deletedAt: null } }),
    prisma.inboxSubmission.count(),
    prisma.inboxSubmission.count({
      where: {
        OR: [
          { metadata: { equals: Prisma.DbNull } },
          { metadata: { path: ["replies"], equals: Prisma.DbNull } },
        ],
      },
    }),
  ]);

  const usersPerOrganization = await prisma.organization.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      ownerId: true,
      _count: { select: { members: true } },
    },
  });

  return {
    totals: { totalUsers, activeUsers, totalOrganizations, totalInbox, openInbox },
    usersPerOrganization: usersPerOrganization.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      memberCount: org._count.members,
    })),
  };
}

export async function listAdminUsers() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      isEmailVerified: true,
      createdAt: true,
      lastLoginAt: true,
      memberships: {
        where: { status: "active" },
        select: { role: true, organization: { select: { id: true, name: true } } },
      },
    },
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    organizations: user.memberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      role: membership.role,
    })),
  }));
}

export async function listAdminOrganizations() {
  const organizations = await prisma.organization.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
      owner: { select: { email: true, name: true } },
      _count: {
        select: { members: true, decisions: true, drawingProjects: true, suppliers: true },
      },
    },
  });

  return organizations.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    status: org.status,
    createdAt: org.createdAt,
    ownerEmail: org.owner.email,
    ownerName: org.owner.name,
    memberCount: org._count.members,
    decisionCount: org._count.decisions,
    drawingProjectCount: org._count.drawingProjects,
    supplierCount: org._count.suppliers,
  }));
}

export async function listInboxSubmissions() {
  const submissions = await prisma.inboxSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return submissions.map((submission) => ({
    id: submission.id,
    kind: submission.kind,
    email: submission.email,
    name: submission.name,
    organization: submission.organization,
    subject: submission.subject,
    message: submission.message,
    delivered: submission.delivered,
    category: metadataOf(submission.metadata)?.category ?? null,
    replies: repliesOf(submission.metadata),
    createdAt: submission.createdAt,
  }));
}

export async function replyToInboxSubmission(
  id: string,
  body: string,
): Promise<{ emailed: boolean }> {
  const trimmed = body.trim();
  if (!trimmed) throw new AppError("Reply body is required", "REPLY_REQUIRED", 400);

  const submission = await prisma.inboxSubmission.findUnique({ where: { id } });
  if (!submission) throw new AppError("Submission not found", "NOT_FOUND", 404);

  const metadata = metadataOf(submission.metadata) ?? {};
  const previous = repliesOf(submission.metadata);
  const reply: InboxReply = { body: trimmed, createdAt: new Date().toISOString() };

  await prisma.inboxSubmission.update({
    where: { id },
    data: {
      metadata: { ...metadata, replies: [...previous, reply] } as unknown as Prisma.InputJsonValue,
    },
  });

  const emailed = await sendAdminReplyEmail({
    to: submission.email,
    name: submission.name ?? undefined,
    originalSubject: submission.subject ?? "Your Consecuencia inquiry",
    body: trimmed,
  });

  logger.info("Admin replied to inbox submission", { id, emailed });
  return { emailed };
}

export async function setUserStatus(
  userId: string,
  status: string,
  actorUserId: string,
): Promise<void> {
  if (status !== "active" && status !== "deactivated") {
    throw new AppError("Status must be active or deactivated", "INVALID_STATUS", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", "NOT_FOUND", 404);
  if (user.id === actorUserId) {
    throw new AppError("You cannot change your own account status", "SELF_STATUS", 400);
  }

  await prisma.user.update({ where: { id: userId }, data: { status } });
  await prisma.authEvent.create({
    data: {
      userId,
      action: status === "active" ? "admin.user.reactivate" : "admin.user.deactivate",
      metadata: { actorUserId },
    },
  });
}
