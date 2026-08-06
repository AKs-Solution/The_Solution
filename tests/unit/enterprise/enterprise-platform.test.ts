import { describe, it, expect } from "vitest";
import {
  evaluateEnterprisePermission,
  UserContext,
} from "../../../src/server/enterprise/rbac-middleware";
import {
  logEnterpriseAuditEvent,
  verifyAuditIntegrity,
} from "../../../src/server/enterprise/audit-logger";
import {
  getActiveConnectors,
  triggerConnectorSync,
} from "../../../src/server/enterprise/connectors-engine";
import {
  getEnterpriseHealthMetrics,
  generateEnterpriseReadinessReport,
} from "../../../src/server/enterprise/observability-engine";

describe("Phase 8: Enterprise Platform, Security & Integrations Test Suite", () => {
  const sampleOrgId = "org-enterprise-acme-corp";

  const chiefEngineerUser: UserContext = {
    userId: "user-chief-01",
    organizationId: sampleOrgId,
    programIds: ["prog-titan-heavy"],
    role: "CHIEF_ENGINEER",
    ipAddress: "10.0.4.12",
  };

  const supplierUser: UserContext = {
    userId: "user-supplier-09",
    organizationId: "org-supplier-tpd",
    programIds: ["prog-other-program"],
    role: "SUPPLIER",
    ipAddress: "192.168.1.100",
  };

  it("enforces tenant isolation and fine-grained RBAC permissions", () => {
    // Valid chief engineer approval
    const allowed = evaluateEnterprisePermission({
      user: chiefEngineerUser,
      resourceOrganizationId: sampleOrgId,
      action: "APPROVE",
    });
    expect(allowed.granted).toBe(true);

    // Tenant isolation violation (supplier accessing acme corp)
    const tenantViolation = evaluateEnterprisePermission({
      user: supplierUser,
      resourceOrganizationId: sampleOrgId,
      action: "READ",
    });
    expect(tenantViolation.granted).toBe(false);
    expect(tenantViolation.reason).toContain("Tenant Isolation Violation");
  });

  it("creates immutable audit log records with verified SHA-256 integrity signatures", async () => {
    const auditRecord = await logEnterpriseAuditEvent({
      organizationId: sampleOrgId,
      actorId: chiefEngineerUser.userId,
      action: "DECISION_APPROVAL",
      resourceId: "dec-prop-102",
      previousValueJson: JSON.stringify({ status: "DRAFT" }),
      newValueJson: JSON.stringify({ status: "APPROVED" }),
      ipAddress: chiefEngineerUser.ipAddress,
    });

    expect(auditRecord).toBeDefined();
    expect(auditRecord.integrityHash.length).toBe(64);

    const isIntegrityValid = verifyAuditIntegrity(auditRecord);
    expect(isIntegrityValid).toBe(true);
  });

  it("queries active enterprise integration connectors and triggers incremental sync", async () => {
    const connectors = await getActiveConnectors(sampleOrgId);
    expect(connectors).toBeDefined();
    expect(Array.isArray(connectors)).toBe(true);
    expect(connectors.length).toBeGreaterThan(0);

    const syncRes = await triggerConnectorSync(connectors[0].id);
    expect(syncRes).toBeDefined();
    expect(syncRes.status).toBe("SUCCESS");
  });

  it("computes enterprise health metrics and readiness report", async () => {
    const health = await getEnterpriseHealthMetrics(sampleOrgId);
    expect(health).toBeDefined();
    expect(health.auditTrailIntegrityScore).toBe(100);

    const report = await generateEnterpriseReadinessReport(sampleOrgId);
    expect(report).toBeDefined();
    expect(report.overallStatus).toBe("ENTERPRISE_READY");
    expect(report.multiTenantIsolationVerified).toBe(true);
    expect(report.readinessScore).toBeGreaterThanOrEqual(95);
  });
});
