import { describe, it, expect } from "vitest";
import { queryEngineeringCopilot } from "../../../src/server/copilot/copilot-engine";
import { runAutomatedInvestigation } from "../../../src/server/copilot/investigation-engine";
import { getLiveEngineeringNotebooks } from "../../../src/server/copilot/notebook-engine";
import { generateEngineeringBriefing } from "../../../src/server/copilot/briefings-engine";

describe("Phase 7: Engineering Copilot & Autonomous Workspace Test Suite", () => {
  const sampleOrgId = "org-copilot-test-101";

  it("answers complex engineering queries with evidence provenance and reasoning chain", async () => {
    const resp = await queryEngineeringCopilot(sampleOrgId, "Why was Titanium 6Al-4V selected?");
    expect(resp).toBeDefined();
    expect(resp.answer).toContain("Titanium 6Al-4V");
    expect(resp.confidenceScore).toBeGreaterThan(0);
    expect(resp.evidenceHashes.length).toBeGreaterThan(0);
    expect(resp.reasoningChain.length).toBeGreaterThan(0);
  });

  it("executes automated engineering investigation building timeline and corrective actions", async () => {
    const report = await runAutomatedInvestigation(
      sampleOrgId,
      "Titanium fastener vibration fatigue failures",
    );
    expect(report).toBeDefined();
    expect(report.executiveSummary).toBeDefined();
    expect(report.timeline.length).toBeGreaterThan(0);
    expect(report.rootCauses.length).toBeGreaterThan(0);
    expect(report.provenCorrectiveActions.length).toBeGreaterThan(0);
  });

  it("retrieves live connected Engineering Notebooks", async () => {
    const notebooks = await getLiveEngineeringNotebooks(sampleOrgId);
    expect(notebooks).toBeDefined();
    expect(Array.isArray(notebooks)).toBe(true);
    expect(notebooks.length).toBeGreaterThan(0);

    const first = notebooks[0];
    expect(first).toHaveProperty("title");
    expect(first).toHaveProperty("notesMarkdown");
  });

  it("generates automated weekly engineering briefing", async () => {
    const briefing = await generateEngineeringBriefing(sampleOrgId);
    expect(briefing).toBeDefined();
    expect(briefing.headline).toBeDefined();
    expect(briefing.keyMilestonesAchieved.length).toBeGreaterThan(0);
    expect(briefing.activeRisksSurfaced.length).toBeGreaterThan(0);
  });
});
