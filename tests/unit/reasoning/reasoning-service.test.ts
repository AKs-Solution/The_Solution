import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/server/db";
import {
  getDecisionTree,
  getMissingEvidence,
  searchReasoning,
  submitReasoningSignoff,
} from "@/server/reasoning/reasoning-service";

vi.mock("@/server/db", () => ({
  prisma: {
    reasoningSession: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    reasoningSignoff: {
      create: vi.fn(),
    },
    missingEvidenceRecord: {
      findMany: vi.fn(),
    },
    engineeringPrinciple: {
      count: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("Reasoning Service Workflows & Q&A Search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.engineeringPrinciple.count).mockResolvedValue(1);
  });

  it("submits engineering review sign-off with user and status", async () => {
    vi.mocked(prisma.reasoningSession.findFirst).mockResolvedValue({
      id: "sess-123",
      organizationId: "org-123",
      title: "Pressure Hull Design",
      problemStatement: "Material allowable evaluation under deep sea hydro-pressure",
      status: "COMPLETED",
      confidenceScore: 0.9,
      steps: [],
      graphNodes: [],
      graphEdges: [],
      evidenceWeights: [],
      constraints: [],
      assumptions: [],
      tradeoffs: [],
      alternatives: [],
      conflicts: [],
      conclusions: [],
    } as never);

    vi.mocked(prisma.reasoningSignoff.create).mockResolvedValue({
      id: "signoff-1",
      sessionId: "sess-123",
      userId: "user-456",
      status: "APPROVED",
      comments: "Approved based on high evidence weight and FEA validation.",
      createdAt: new Date("2026-08-04T12:00:00Z"),
      user: { name: "Lead Engineer", email: "lead@ktn.com" },
    } as never);

    const result = await submitReasoningSignoff("sess-123", "org-123", "user-456", {
      status: "APPROVED",
      comments: "Approved based on high evidence weight and FEA validation.",
    });

    expect(result.status).toBe("APPROVED");
    expect(result.userName).toBe("Lead Engineer");
    expect(prisma.reasoningSignoff.create).toHaveBeenCalledWith({
      data: {
        sessionId: "sess-123",
        userId: "user-456",
        status: "APPROVED",
        comments: "Approved based on high evidence weight and FEA validation.",
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  });

  it("builds a hierarchical decision tree for a session", async () => {
    vi.mocked(prisma.reasoningSession.findFirst).mockResolvedValue({
      id: "sess-123",
      organizationId: "org-123",
      title: "Pressure Hull Design",
      problemStatement: "Material allowable evaluation under deep sea hydro-pressure",
      status: "COMPLETED",
      confidenceScore: 0.9,
      constraints: [{ isViolated: false, isHardConstraint: true }],
      alternatives: [{ name: "Super Duplex Monocoque", status: "SELECTED" }],
      conclusions: [{ statement: "Approved design candidate" }],
      steps: [],
      graphNodes: [],
      graphEdges: [],
      evidenceWeights: [],
      assumptions: [],
      tradeoffs: [],
      conflicts: [],
    } as never);

    vi.mocked(prisma.engineeringPrinciple.findMany).mockResolvedValue([
      { code: "PRIN-ENERGY-CONS", name: "Conservation of Energy" } as never,
    ]);

    const tree = await getDecisionTree("sess-123", "org-123");

    expect(tree.id).toBe("sess-123");
    expect(tree.nodeType).toBe("PROBLEM");
    expect(tree.children?.length).toBe(4);
  });

  it("retrieves missing evidence records for a session", async () => {
    vi.mocked(prisma.reasoningSession.findFirst).mockResolvedValue({
      id: "sess-123",
      organizationId: "org-123",
      steps: [],
      graphNodes: [],
      graphEdges: [],
      evidenceWeights: [],
      constraints: [],
      assumptions: [],
      tradeoffs: [],
      alternatives: [],
      conflicts: [],
      conclusions: [],
    } as never);

    vi.mocked(prisma.missingEvidenceRecord.findMany).mockResolvedValue([
      {
        id: "me-1",
        sessionId: "sess-123",
        missingItem: "Physical Destructive Tensile Test Certificate",
        category: "TEST_REPORT",
        impact: "High risk",
        requiredSource: "ISO 17025 Lab",
      } as never,
    ]);

    const res = await getMissingEvidence("sess-123", "org-123");

    expect(res).toHaveLength(1);
    expect(res[0].missingItem).toContain("Tensile Test");
  });

  it("executes reasoning-powered Q&A search query returning cited evidence and confidence", async () => {
    vi.mocked(prisma.engineeringPrinciple.findMany).mockResolvedValue([
      {
        code: "PRIN-FATIGUE",
        name: "Fatigue",
        category: "Structural",
        description: "Cyclic loading failure",
      } as never,
    ]);

    const searchRes = await searchReasoning("org-123", {
      query: "Can we substitute Grade 5 Titanium under cyclic fatigue?",
    });

    expect(searchRes.confidenceScore).toBeGreaterThan(0.5);
    expect(searchRes.isSupportedByEvidence).toBe(true);
    expect(searchRes.answer).toContain("Fatigue");
    expect(searchRes.citedEvidence.length).toBeGreaterThan(0);
  });
});
