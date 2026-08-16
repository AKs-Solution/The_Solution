export {
  createOrganization,
  listUserOrganizations,
  getOrganization,
  updateOrganization,
  switchOrganization,
} from "./organization-service";

export type { CreateOrganizationInput, OrganizationResult } from "./organization-service";

export {
  listMembers,
  inviteMember,
  acceptInvitation,
  acceptInvitationByToken,
  acceptInvitationForUser,
  previewInvitationByToken,
  assertInvitationEmailMatches,
  declineInvitation,
  removeMember,
  leaveOrganization,
  listPendingInvitations,
  listOrganizationInvitations,
} from "./membership-service";

export type {
  MemberResult,
  InvitationResult,
  InviteCreatedResult,
  InvitationPreview,
} from "./membership-service";

export {
  getActiveOrganizationId,
  setActiveOrganizationId,
  clearActiveOrganizationId,
  requireActiveOrganization,
  requireOrganizationMembership,
  resolveActiveOrganization,
} from "./organization-context";
