export type EnterpriseRole =
  | "CHIEF_ENGINEER"
  | "PROGRAM_MANAGER"
  | "QUALITY_ENGINEER"
  | "CERTIFICATION_ENGINEER"
  | "MANUFACTURING_ENGINEER"
  | "SUPPLIER"
  | "AUDITOR"
  | "ADMINISTRATOR"
  | "VIEWER";

export interface UserContext {
  userId: string;
  organizationId: string;
  programIds: string[];
  role: EnterpriseRole;
  ipAddress: string;
}

export interface PermissionCheckRequest {
  user: UserContext;
  resourceOrganizationId: string;
  resourceProgramId?: string;
  requiredRole?: EnterpriseRole;
  action: "READ" | "WRITE" | "DELETE" | "APPROVE" | "AUDIT_EXPORT";
}

export interface PermissionCheckResult {
  granted: boolean;
  reason: string;
  evaluatedAt: string;
}

/**
 * Enterprise Multi-Tenancy & RBAC Enforcement Engine
 */
export function evaluateEnterprisePermission(
  request: PermissionCheckRequest,
): PermissionCheckResult {
  const { user, resourceOrganizationId, resourceProgramId, action } = request;

  // 1. Strict Tenant Isolation
  if (user.organizationId !== resourceOrganizationId && user.role !== "ADMINISTRATOR") {
    return {
      granted: false,
      reason: `Tenant Isolation Violation: User org (${user.organizationId}) cannot access resource org (${resourceOrganizationId}).`,
      evaluatedAt: new Date().toISOString(),
    };
  }

  // 2. Program Isolation for Suppliers / External Viewers
  if (
    resourceProgramId &&
    user.role === "SUPPLIER" &&
    !user.programIds.includes(resourceProgramId)
  ) {
    return {
      granted: false,
      reason: `Program Isolation Violation: Supplier (${user.userId}) is not assigned to Program (${resourceProgramId}).`,
      evaluatedAt: new Date().toISOString(),
    };
  }

  // 3. Action / Role Hierarchy Check
  if (action === "DELETE" && !["ADMINISTRATOR", "CHIEF_ENGINEER"].includes(user.role)) {
    return {
      granted: false,
      reason: `RBAC Violation: Role ${user.role} does not possess DELETE authority.`,
      evaluatedAt: new Date().toISOString(),
    };
  }

  if (
    action === "APPROVE" &&
    !["CHIEF_ENGINEER", "PROGRAM_MANAGER", "CERTIFICATION_ENGINEER"].includes(user.role)
  ) {
    return {
      granted: false,
      reason: `RBAC Violation: Role ${user.role} does not possess APPROVE authority.`,
      evaluatedAt: new Date().toISOString(),
    };
  }

  return {
    granted: true,
    reason: `Permission granted for user ${user.userId} (${user.role}) on resource org ${resourceOrganizationId}.`,
    evaluatedAt: new Date().toISOString(),
  };
}
