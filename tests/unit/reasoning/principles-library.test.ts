import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/server/db";
import {
  createCustomPrinciple,
  ensurePrinciplesSeeded,
  getEngineeringPrinciples,
} from "@/server/reasoning/principles-library";

vi.mock("@/server/db", () => ({
  prisma: {
    engineeringPrinciple: {
      count: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("Engineering Principle Library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("seeds standard engineering principles if count is zero", async () => {
    vi.mocked(prisma.engineeringPrinciple.count).mockResolvedValue(0);
    vi.mocked(prisma.engineeringPrinciple.upsert).mockResolvedValue({} as never);

    await ensurePrinciplesSeeded();

    expect(prisma.engineeringPrinciple.upsert).toHaveBeenCalledTimes(17);
  });

  it("retrieves active principles for an organization", async () => {
    vi.mocked(prisma.engineeringPrinciple.count).mockResolvedValue(17);
    vi.mocked(prisma.engineeringPrinciple.findMany).mockResolvedValue([
      {
        id: "pr-1",
        code: "PRIN-ENERGY-CONS",
        name: "Conservation of Energy",
        category: "Thermal",
        description: "Energy conservation principle",
        governingEquations: ["dE/dt = Q - W"],
        domain: "Mechanical",
        version: 1,
        status: "ACTIVE",
        supportingEvidenceRefs: ["ISO 80000-5"],
        organizationId: null,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const principles = await getEngineeringPrinciples("org-123");

    expect(principles).toHaveLength(1);
    expect(principles[0].code).toBe("PRIN-ENERGY-CONS");
    expect(principles[0].governingEquations).toContain("dE/dt = Q - W");
  });

  it("creates a custom tenant-specific engineering principle", async () => {
    vi.mocked(prisma.engineeringPrinciple.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.engineeringPrinciple.create).mockResolvedValue({
      id: "custom-1",
      organizationId: "org-123",
      code: "PRIN-CUSTOM-FLUID",
      name: "Custom Hydrodynamic Boundary",
      category: "Thermal",
      description: "Custom fluid dynamics rule",
      governingEquations: ["Re = rho * v * L / mu"],
      domain: "Systems",
      version: 1,
      status: "ACTIVE",
      supportingEvidenceRefs: [],
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createCustomPrinciple("org-123", {
      code: "PRIN-CUSTOM-FLUID",
      name: "Custom Hydrodynamic Boundary",
      category: "Thermal",
      description: "Custom fluid dynamics rule",
      governingEquations: ["Re = rho * v * L / mu"],
      domain: "Systems",
    });

    expect(result.code).toBe("PRIN-CUSTOM-FLUID");
    expect(prisma.engineeringPrinciple.create).toHaveBeenCalled();
  });
});
