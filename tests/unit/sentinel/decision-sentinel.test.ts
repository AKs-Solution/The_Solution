import { describe, it, expect } from "vitest";
import { monitorActiveDecisions } from "../../../src/server/sentinel/decision-sentinel";
import { queryFailurePrecedents } from "../../../src/server/sentinel/precedent-failure-engine";
import { getEngineeringRecommendations } from "../../../src/server/sentinel/recommendation-engine";
import { getExecutiveDashboardData } from "../../../src/server/sentinel/executive-dashboard-engine";
import { isDatabaseAvailable } from "../../helpers/db-gate";

const dbOk = await isDatabaseAvailable();

describe.skipIf(!dbOk)("Phase 6: Decision Sentinel & Innovation Acceleration Test Suite", () => {
  const sampleOrgId = "org-sentinel-test-101";

  it("monitors active decisions and detects expectation vs observed outcome deviations", async () => {
    const sentinelResult = await monitorActiveDecisions(sampleOrgId);
    expect(sentinelResult).toBeDefined();
    expect(Array.isArray(sentinelResult.monitoredDecisions)).toBe(true);
    expect(sentinelResult.monitoredDecisions.length).toBeGreaterThan(0);

    const first = sentinelResult.monitoredDecisions[0];
    expect(first).toHaveProperty("expectations");
    expect(first.expectations.length).toBeGreaterThan(0);
  });

  it("queries deterministic historical failure precedents with evidence proofs", async () => {
    const result = await queryFailurePrecedents(sampleOrgId, "Thermal");
    expect(result).toBeDefined();
    expect(Array.isArray(result.precedents)).toBe(true);
    expect(result.precedents.length).toBeGreaterThan(0);

    const first = result.precedents[0];
    expect(first).toHaveProperty("provenCorrectiveAction");
    expect(first.evidenceHashes.length).toBeGreaterThan(0);
  });

  it("generates evidence-backed engineering recommendations", async () => {
    const recs = await getEngineeringRecommendations(sampleOrgId);
    expect(recs).toBeDefined();
    expect(Array.isArray(recs)).toBe(true);
    expect(recs.length).toBeGreaterThan(0);

    const first = recs[0];
    expect(first).toHaveProperty("recommendationText");
    expect(first.confidenceScore).toBeGreaterThan(0);
  });

  it("computes executive dashboard metrics and real-time alert stream", async () => {
    const dash = await getExecutiveDashboardData(sampleOrgId);
    expect(dash).toBeDefined();
    expect(dash.innovationVelocityIndex).toBeGreaterThan(0);
    expect(dash.programMaturityScore).toBeGreaterThan(0);
    expect(Array.isArray(dash.realtimeAlerts)).toBe(true);
    expect(dash.realtimeAlerts.length).toBeGreaterThan(0);
  });
});
