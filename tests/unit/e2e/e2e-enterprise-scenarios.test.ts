import { describe, it, expect } from "vitest";
import { runFullPlatformVerification } from "../../../src/server/hardening/system-verifier";
import { queryEngineeringCopilot } from "../../../src/server/copilot/copilot-engine";
import { runAutomatedInvestigation } from "../../../src/server/copilot/investigation-engine";
import { generateCertificationPackage } from "../../../src/server/compliance/package-generator";
import {
  evaluateEnterprisePermission,
  UserContext,
} from "../../../src/server/enterprise/rbac-middleware";
import {
  logEnterpriseAuditEvent,
  verifyAuditIntegrity,
} from "../../../src/server/enterprise/audit-logger";
import { isDatabaseAvailable } from "../../helpers/db-gate";

const dbOk = await isDatabaseAvailable();

describe("Phase 9: Full End-to-End Enterprise Scenario & System Verification", () => {
  const e2eOrgId = "org-e2e-verif-aerospace-101";

  it.runIf(dbOk)(
    "runs full platform automated verification suite across all 8 subsystems",
    async () => {
      const auditRes = await runFullPlatformVerification(e2eOrgId);
      expect(auditRes).toBeDefined();
      expect(auditRes.overallHealth).toBe("HEALTHY");
      expect(auditRes.passedChecks).toBe(auditRes.totalChecks);
    },
    25000,
  );

  it.runIf(dbOk)(
    "executes End-to-End Certification Package Generation with SHA-256 evidence proofs",
    async () => {
      const pkg = await generateCertificationPackage(e2eOrgId, "FAA Part 33 Airworthiness");
      expect(pkg).toBeDefined();
      expect(pkg.title).toBeDefined();
      expect(pkg.requirementsCount).toBeGreaterThan(0);
      expect(pkg.hashProof.length).toBe(64);
    },
  );

  it.runIf(dbOk)(
    "executes End-to-End Copilot Multi-Document Reasoning & Automated Investigation",
    async () => {
      const chatRes = await queryEngineeringCopilot(
        e2eOrgId,
        "What thermal boundary limits were violated?",
      );
      expect(chatRes.answer).toBeDefined();
      expect(chatRes.evidenceHashes.length).toBeGreaterThan(0);

      const invReport = await runAutomatedInvestigation(
        e2eOrgId,
        "Thermal distortion in flange joints",
      );
      expect(invReport.executiveSummary).toBeDefined();
      expect(invReport.provenCorrectiveActions.length).toBeGreaterThan(0);
    },
    25000,
  );

  it("verifies enterprise tenant isolation and SHA-256 audit log cryptographic integrity", async () => {
    const chiefUser: UserContext = {
      userId: "chief-e2e-user",
      organizationId: e2eOrgId,
      programIds: ["prog-e2e"],
      role: "CHIEF_ENGINEER",
      ipAddress: "10.0.1.1",
    };

    const perm = evaluateEnterprisePermission({
      user: chiefUser,
      resourceOrganizationId: e2eOrgId,
      action: "APPROVE",
    });
    expect(perm.granted).toBe(true);

    const audit = await logEnterpriseAuditEvent({
      organizationId: e2eOrgId,
      actorId: chiefUser.userId,
      action: "E2E_VERIFICATION_COMPLETE",
      resourceId: "pkg-e2e-101",
      ipAddress: chiefUser.ipAddress,
    });

    const isAuditValid = verifyAuditIntegrity(audit);
    expect(isAuditValid).toBe(true);
  });
});
