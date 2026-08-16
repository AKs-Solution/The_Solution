import { randomBytes } from "crypto";
import { prisma } from "@/server/db";
import { validateSession } from "@/server/auth/session-service";
import { DEFAULT_ROLES } from "@/server/rbac/permissions";
import { sendInvitationEmail } from "@/server/mail";
import { config } from "@/shared/config";
import { createSession } from "@/server/auth/session-service";
import { NotFoundError, ValidationError, ForbiddenError } from "@/shared/errors";
import type { Invitation } from "@prisma/client";

export const INVITABLE_ROLE_SLUGS = new Set(
  DEFAULT_ROLES.filter((r) => r.slug !== "owner").map((r) => r.slug),
);

export interface MemberResult {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  joinedAt: Date | null;
}

export interface InvitationResult {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string | null;
  role: string;
  status: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface InviteCreatedResult {
  invitationId: string;
  email: string;
  role: string;
  expiresAt: Date;
  inviteUrl: string;
  emailSent: boolean;
}

export interface InvitationPreview {
  organizationName: string;
  emailHint: string | null;
  role: string;
  expiresAt: Date;
  status: string;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}

function inviteUrlFor(token: string): string {
  return `${config.appUrl.replace(/\/$/, "")}/invite?token=${encodeURIComponent(token)}`;
}

async function requireOrgAccess(organizationId: string, userId: string): Promise<string> {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!membership || membership.status !== "active") {
    throw new NotFoundError("Organization", organizationId);
  }

  return membership.role;
}

export async function listMembers(organizationId: string): Promise<MemberResult[]> {
  const session = await validateSession();
  if (!session) throw new ForbiddenError("Not authenticated");

  await requireOrgAccess(organizationId, session.userId);

  const members = await prisma.organizationMember.findMany({
    where: { organizationId },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    email: m.user.email,
    name: m.user.name,
    role: m.role,
    status: m.status,
    joinedAt: m.joinedAt,
  }));
}

export async function inviteMember(
  organizationId: string,
  email: string,
  role: string = "viewer",
  name?: string,
): Promise<InviteCreatedResult> {
  const session = await validateSession();
  if (!session) throw new ForbiddenError("Not authenticated");

  const userRole = await requireOrgAccess(organizationId, session.userId);

  if (userRole !== "owner" && userRole !== "admin" && userRole !== "manager") {
    throw new ForbiddenError("Only organization owners, admins, and managers can invite members");
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new ValidationError({ email: ["Valid email is required"] });
  }

  const normalizedRole = role.toLowerCase().trim();
  if (!INVITABLE_ROLE_SLUGS.has(normalizedRole)) {
    throw new ValidationError({
      role: [`Role must be one of: ${Array.from(INVITABLE_ROLE_SLUGS).join(", ")}`],
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const invitee = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (invitee) {
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: invitee.id,
        },
      },
    });
    if (existingMember) {
      throw new ValidationError({ email: ["User is already a member of this organization"] });
    }
  }

  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      organizationId,
      email: normalizedEmail,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
  });
  if (existingInvitation) {
    throw new ValidationError({ email: ["An active invitation already exists for this email"] });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await prisma.invitation.create({
    data: {
      organizationId,
      email: normalizedEmail,
      userId: invitee?.id,
      token,
      role: normalizedRole,
      invitedBy: session.userId,
      expiresAt,
    },
    include: { organization: { select: { name: true } } },
  });

  await prisma.authEvent
    .create({
      data: {
        userId: session.userId,
        action: "organization.member.invited",
        metadata: { organizationId, email: normalizedEmail },
      },
    })
    .catch(() => null);

  const inviteUrl = inviteUrlFor(token);
  const emailSent = await sendInvitationEmail(
    normalizedEmail,
    invitation.organization.name,
    normalizedRole,
    inviteUrl,
    name,
  );

  return {
    invitationId: invitation.id,
    email: normalizedEmail,
    role: normalizedRole,
    expiresAt,
    inviteUrl,
    emailSent,
  };
}

async function completeInvitationAcceptance(
  invitation: Invitation & { organization: { name: string } },
  userId: string,
  userEmail: string,
): Promise<{ organizationId: string; organizationName: string }> {
  if (invitation.status !== "pending") {
    throw new ValidationError({ invitation: ["Invitation is no longer pending"] });
  }
  if (invitation.expiresAt < new Date()) {
    throw new ValidationError({ invitation: ["Invitation has expired"] });
  }
  if (invitation.email && invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new ForbiddenError("This invitation was sent to a different email address");
  }

  await prisma.$transaction(async (tx) => {
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted", acceptedAt: new Date(), userId },
    });

    await tx.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId,
        },
      },
      create: {
        organizationId: invitation.organizationId,
        userId,
        role: invitation.role,
        status: "active",
        invitedBy: invitation.invitedBy,
        joinedAt: new Date(),
      },
      update: {
        status: "active",
        role: invitation.role,
        joinedAt: new Date(),
      },
    });

    await tx.authEvent.create({
      data: {
        userId,
        action: "organization.invitation.accepted",
        metadata: {
          organizationId: invitation.organizationId,
          organizationName: invitation.organization.name,
        },
      },
    });
  });

  await createSession(userId, invitation.organizationId);
  return {
    organizationId: invitation.organizationId,
    organizationName: invitation.organization.name,
  };
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  const session = await validateSession();
  if (!session) throw new ForbiddenError("Not authenticated");

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { organization: { select: { name: true } } },
  });

  if (!invitation) throw new NotFoundError("Invitation", invitationId);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });
  if (!user) throw new ForbiddenError("Not authenticated");

  await completeInvitationAcceptance(invitation, session.userId, user.email);
}

export async function acceptInvitationByToken(
  token: string,
): Promise<{ organizationId: string; organizationName: string }> {
  const session = await validateSession();
  if (!session) throw new ForbiddenError("Not authenticated");

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: { select: { name: true } } },
  });
  if (!invitation) throw new NotFoundError("Invitation");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });
  if (!user) throw new ForbiddenError("Not authenticated");

  return completeInvitationAcceptance(invitation, session.userId, user.email);
}

export async function acceptInvitationForUser(
  userId: string,
  userEmail: string,
  token: string,
): Promise<{ organizationId: string; organizationName: string }> {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: { select: { name: true } } },
  });
  if (!invitation) throw new NotFoundError("Invitation");
  return completeInvitationAcceptance(invitation, userId, userEmail);
}

export async function assertInvitationEmailMatches(token: string, email: string): Promise<void> {
  if (!token || token.length < 16) {
    throw new ValidationError({ token: ["Invitation token is invalid"] });
  }
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    select: { email: true, status: true, expiresAt: true },
  });
  if (!invitation) throw new NotFoundError("Invitation");
  if (invitation.status !== "pending" || invitation.expiresAt < new Date()) {
    throw new ValidationError({ invitation: ["Invitation is no longer valid"] });
  }
  if (invitation.email && invitation.email.toLowerCase() !== email.toLowerCase()) {
    throw new ForbiddenError("Use the email address this invitation was sent to");
  }
}

export async function previewInvitationByToken(token: string): Promise<InvitationPreview> {
  if (!token || token.length < 16) {
    throw new ValidationError({ token: ["Invitation token is invalid"] });
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: { select: { name: true } } },
  });
  if (!invitation) throw new NotFoundError("Invitation");

  let status = invitation.status;
  if (invitation.status === "pending" && invitation.expiresAt < new Date()) {
    status = "expired";
  }

  return {
    organizationName: invitation.organization.name,
    emailHint: invitation.email ? maskEmail(invitation.email) : null,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
    status,
  };
}

export async function declineInvitation(invitationId: string): Promise<void> {
  const session = await validateSession();
  if (!session) throw new ForbiddenError("Not authenticated");

  const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } });
  if (!invitation) throw new NotFoundError("Invitation", invitationId);
  if (invitation.status !== "pending") return;

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "declined", declinedAt: new Date() },
  });
}

export async function removeMember(organizationId: string, memberUserId: string): Promise<void> {
  const session = await validateSession();
  if (!session) throw new ForbiddenError("Not authenticated");

  const userRole = await requireOrgAccess(organizationId, session.userId);
  if (userRole !== "owner") {
    throw new ForbiddenError("Only organization owners can remove members");
  }

  const targetMembership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: memberUserId,
      },
    },
  });

  if (!targetMembership) throw new NotFoundError("Member", memberUserId);
  if (targetMembership.role === "owner") {
    throw new ValidationError({ member: ["Cannot remove the organization owner"] });
  }

  await prisma.organizationMember.delete({
    where: { id: targetMembership.id },
  });

  await prisma.authEvent.create({
    data: {
      userId: session.userId,
      action: "organization.member.removed",
      metadata: { organizationId, removedUserId: memberUserId },
    },
  });
}

export async function leaveOrganization(organizationId: string): Promise<void> {
  const session = await validateSession();
  if (!session) throw new ForbiddenError("Not authenticated");

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: session.userId,
      },
    },
  });

  if (!membership) throw new NotFoundError("Membership");
  if (membership.role === "owner") {
    throw new ValidationError({
      organization: ["Organization owners cannot leave. Transfer ownership first."],
    });
  }

  await prisma.organizationMember.delete({
    where: { id: membership.id },
  });
}

export async function listPendingInvitations(): Promise<InvitationResult[]> {
  const session = await validateSession();
  if (!session) return [];

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });

  const invitations = await prisma.invitation.findMany({
    where: {
      status: "pending",
      expiresAt: { gt: new Date() },
      OR: [
        { userId: session.userId },
        ...(user?.email ? [{ email: user.email.toLowerCase() }] : []),
      ],
    },
    include: {
      organization: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return invitations.map((inv) => ({
    id: inv.id,
    organizationId: inv.organizationId,
    organizationName: inv.organization.name,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    createdAt: inv.createdAt,
    expiresAt: inv.expiresAt,
  }));
}

export async function listOrganizationInvitations(
  organizationId: string,
): Promise<InvitationResult[]> {
  const session = await validateSession();
  if (!session) throw new ForbiddenError("Not authenticated");

  await requireOrgAccess(organizationId, session.userId);

  const invitations = await prisma.invitation.findMany({
    where: {
      organizationId,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
    include: {
      organization: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return invitations.map((inv) => ({
    id: inv.id,
    organizationId: inv.organizationId,
    organizationName: inv.organization.name,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    createdAt: inv.createdAt,
    expiresAt: inv.expiresAt,
  }));
}
