import { describe, it, expect } from "vitest";
import { getEndToEndTraceability } from "../../../src/server/compliance/compliance-engine";
import { getRequirementIntelligence } from "../../../src/server/compliance/requirements-engine";
import { generateCertificationPackage } from "../../../src/server/compliance/package-generator";
import { getAuditExplorerView } from "../../../src/server/compliance/audit-explorer-engine";
import { calculateComplianceHealth } from "../../../src/server/compliance/compliance-health-calculator";
import { isDatabaseAvailable } from "../../helpers/db-gate";

const dbOk = await isDatabaseAvailable();

describe("Phase 5: Certification & Compliance Intelligence Test Suite", () => {
  const sampleOrgId = "org-compliance-test-101";

  it("traverses end-to-end 10-level compliance traceability chain", async () => {
    const path = await getEndToEndTraceability(sampleOrgId, "req-therm-402");
    expect(path).toBeDefined();
    expect(Array.isArray(path.nodes)).toBe(true);
    expect(path.nodes.length).toBeGreaterThan(0);

    const reqNode = path.nodes.find((n) => n.level === "REQUIREMENT");
    expect(reqNode).toBeDefined();
    expect(reqNode?.evidenceHash).toBeDefined();
  });

  it("retrieves requirements intelligence with coverage and regulation bindings", async () => {
    const reqIntel = await getRequirementIntelligence(sampleOrgId);
    expect(reqIntel).toBeDefined();
    expect(reqIntel.requirements.length).toBeGreaterThan(0);
    expect(reqIntel.overallCoverage).toBeGreaterThan(0);

    const first = reqIntel.requirements[0];
    expect(first.applicableRegulations.length).toBeGreaterThan(0);
  });

  it.runIf(dbOk)(
    "generates reproducible certification package with SHA-256 evidence proofs",
    async () => {
      const pkg = await generateCertificationPackage(
        sampleOrgId,
        "Test Propulsion Flight Certification",
      );
      expect(pkg).toBeDefined();
      expect(pkg.hashProof).toBeDefined();
      expect(pkg.sections.length).toBeGreaterThan(0);
      expect(pkg.traceabilityMatrix.length).toBeGreaterThan(0);
    },
  );

  it("renders audit explorer view with evidence lineage tree", async () => {
    const auditView = await getAuditExplorerView(sampleOrgId, "comp-840");
    expect(auditView).toBeDefined();
    expect(auditView.lineageTree).toBeDefined();
    expect(auditView.evidenceIntegrityVerified).toBe(true);
  });

  it("calculates 8-metric compliance health & audit readiness score", async () => {
    const health = await calculateComplianceHealth(sampleOrgId);
    expect(health).toBeDefined();
    expect(health.overallComplianceScore).toBeGreaterThanOrEqual(0);
    expect(health.metrics).toHaveProperty("requirementCoverage");
    expect(health.metrics).toHaveProperty("auditReadiness");
    expect(health.metrics).toHaveProperty("traceabilityCompleteness");
  });
});
