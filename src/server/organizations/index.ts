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
  declineInvitation,
  removeMember,
  leaveOrganization,
  listPendingInvitations,
  listOrganizationInvitations,
} from "./membership-service";

export type { MemberResult, InvitationResult } from "./membership-service";

export {
  getActiveOrganizationId,
  setActiveOrganizationId,
  clearActiveOrganizationId,
  requireActiveOrganization,
  resolveActiveOrganization,
} from "./organization-context";
