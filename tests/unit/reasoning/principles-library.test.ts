import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/server/db";
import {
  createCustomPrinciple,
  ensurePrinciplesSeeded,
  getEngineeringPrinciples,
} from "@/server/reasoning/principles-library";
import { DEFAULT_ENGINEERING_PRINCIPLES } from "@/server/reasoning/constants";

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

describe("Engineering Principle Library (Comprehensive)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("contains principles across all 13 required engineering domains", () => {
    const categories = new Set(DEFAULT_ENGINEERING_PRINCIPLES.map((p) => p.category));
    expect(categories.has("Structural")).toBe(true);
    expect(categories.has("Mechanical")).toBe(true);
    expect(categories.has("Thermal")).toBe(true);
    expect(categories.has("Materials")).toBe(true);
    expect(categories.has("Manufacturing")).toBe(true);
    expect(categories.has("Electrical")).toBe(true);
    expect(categories.has("Systems")).toBe(true);
    expect(categories.has("Reliability")).toBe(true);
    expect(categories.has("Safety")).toBe(true);
    expect(categories.has("Certification")).toBe(true);
    expect(categories.has("Quality")).toBe(true);
    expect(categories.has("Maintainability")).toBe(true);
    expect(categories.has("Lifecycle")).toBe(true);
    expect(DEFAULT_ENGINEERING_PRINCIPLES.length).toBeGreaterThanOrEqual(20);
  });

  it("seeds standard engineering principles if count is zero", async () => {
    vi.mocked(prisma.engineeringPrinciple.count).mockResolvedValue(0);
    vi.mocked(prisma.engineeringPrinciple.upsert).mockResolvedValue({} as never);

    await ensurePrinciplesSeeded();

    expect(prisma.engineeringPrinciple.count).toHaveBeenCalled();
    expect(prisma.engineeringPrinciple.upsert).toHaveBeenCalledTimes(DEFAULT_ENGINEERING_PRINCIPLES.length);
  });

  it("fetches principles for a specific organization including global standard ones", async () => {
    vi.mocked(prisma.engineeringPrinciple.findMany).mockResolvedValue([
      {
        id: "p-1",
        code: "PRIN-ENERGY-CONS",
        name: "Conservation of Energy",
        category: "Thermal",
        description: "Energy conservation",
        governingEquations: ["E = mc^2"],
        domain: "Mechanical",
        version: 1,
        status: "ACTIVE",
        organizationId: null,
        supportingEvidenceRefs: [],
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const res = await getEngineeringPrinciples("org-123");

    expect(res).toHaveLength(1);
    expect(res[0].code).toBe("PRIN-ENERGY-CONS");
  });

  it("creates a custom engineering principle with tenant scoping", async () => {
    vi.mocked(prisma.engineeringPrinciple.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.engineeringPrinciple.create).mockResolvedValue({
      id: "p-custom",
      code: "PRIN-CUSTOM-HYDRAULIC",
      name: "Hydraulic Cavitation Threshold",
      category: "Mechanical",
      description: "NPSH margin must prevent vapor bubble collapse.",
      governingEquations: ["NPSHa > NPSHr + 0.5m"],
      domain: "Hydraulics",
      version: 1,
      status: "ACTIVE",
      organizationId: "org-123",
      supportingEvidenceRefs: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await createCustomPrinciple("org-123", {
      code: "PRIN-CUSTOM-HYDRAULIC",
      name: "Hydraulic Cavitation Threshold",
      category: "Mechanical",
      description: "NPSH margin must prevent vapor bubble collapse.",
      governingEquations: ["NPSHa > NPSHr + 0.5m"],
      domain: "Hydraulics",
      version: 1,
      status: "ACTIVE",
    });

    expect(res.code).toBe("PRIN-CUSTOM-HYDRAULIC");
    expect(prisma.engineeringPrinciple.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org-123",
        code: "PRIN-CUSTOM-HYDRAULIC",
      }),
    });
  });
});
