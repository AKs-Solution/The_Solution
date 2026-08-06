import { describe, it, expect } from "vitest";
import { runFullPlatformVerification } from "../../../src/server/hardening/system-verifier";
import { queryEngineeringCopilot } from "../../../src/server/copilot/copilot-engine";
import { runAutomatedInvestigation } from "../../../src/server/copilot/investigation-engine";
import { getEndToEndTraceability } from "../../../src/server/compliance/compliance-engine";
import { generateCertificationPackage } from "../../../src/server/compliance/package-generator";
import { monitorActiveDecisions } from "../../../src/server/sentinel/decision-sentinel";
import { evaluateEnterprisePermission } from "../../../src/server/enterprise/rbac-middleware";
import { logEnterpriseAuditEvent, verifyAuditIntegrity } from "../../../src/server/enterprise/audit-logger";

describe("Phase 10: Final Version 1.0 Acceptance & System Certification Test Suite", () => {
  const v1OrgId = "org-consecuencia-v1-certification";

  it("certifies Subsystem 1-4: Knowledge Graph, Memory, Decision & Technical Debt Engines", async () => {
    const sentinel = await monitorActiveDecisions(v1OrgId);
    expect(sentinel).toBeDefined();
    expect(sentinel.monitoredDecisions).toBeDefined();
  });

  it(
    "certifies Subsystem 5: 10-Level Certification Compliance & Package Generation",
    async () => {
      const trace = await getEndToEndTraceability(v1OrgId, "req-v1-101");
      expect(trace).toBeDefined();
      expect(trace.nodes.length).toBeGreaterThan(0);

      const pkg = await generateCertificationPackage(v1OrgId, "FAA Part 33 Airworthiness");
      expect(pkg).toBeDefined();
      expect(pkg.hashProof.length).toBe(64);
    },
    25000,
  );

  it(
    "certifies Subsystem 6-7: Decision Sentinel & Engineering Copilot Workspace",
    async () => {
      const copilotRes = await queryEngineeringCopilot(v1OrgId, "Explain Titanium material selection.");
      expect(copilotRes).toBeDefined();
      expect(copilotRes.evidenceHashes.length).toBeGreaterThan(0);

      const inv = await runAutomatedInvestigation(v1OrgId, "Titanium flange thermal fatigue");
      expect(inv).toBeDefined();
      expect(inv.provenCorrectiveActions.length).toBeGreaterThan(0);
    },
    25000,
  );

  it(
    "certifies Subsystem 8-9: Enterprise Multi-Tenancy, RBAC & Immutable SHA-256 Audit Logging",
    async () => {
      const perm = evaluateEnterprisePermission({
        user: {
          userId: "v1-chief",
          organizationId: v1OrgId,
          programIds: ["prog-v1"],
          role: "CHIEF_ENGINEER",
          ipAddress: "10.0.0.1",
        },
        resourceOrganizationId: v1OrgId,
        action: "APPROVE",
      });
      expect(perm.granted).toBe(true);

      const audit = await logEnterpriseAuditEvent({
        organizationId: v1OrgId,
        actorId: "v1-chief",
        action: "V1_0_RELEASE_CERTIFICATION",
        resourceId: "v1-release-candidate",
        ipAddress: "10.0.0.1",
      });
      expect(verifyAuditIntegrity(audit)).toBe(true);

      const fullAudit = await runFullPlatformVerification(v1OrgId);
      expect(fullAudit.overallHealth).toBe("HEALTHY");
    },
    25000,
  );
});
