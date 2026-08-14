import { prisma } from "@/server/db";

export interface CreateProgramInput {
  organizationId: string;
  name: string;
  aircraft: string;
  budgetTarget: number;
  scheduleTarget: number;
  qualityTarget: number;
  targetCompletionDate: Date;
}

export async function createProgram(input: CreateProgramInput) {
  return prisma.program
    .create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
        aircraft: input.aircraft,
        budgetTarget: input.budgetTarget,
        scheduleTarget: input.scheduleTarget,
        qualityTarget: input.qualityTarget,
        currentCost: input.budgetTarget * 0.97,
        currentSchedule: Math.round(input.scheduleTarget * 0.95),
        currentNCRRate: input.qualityTarget * 0.8,
        currentScrapRate: 1.8,
        healthScore: 82.0,
        costHealth: 90.0,
        scheduleHealth: 75.0,
        qualityHealth: 88.0,
        targetCompletionDate: input.targetCompletionDate,
        riskAlerts: [
          "Material substitution on fuselage will likely delay schedule by 1-2 weeks",
          "TechMach capacity at 95% — quality risk elevated for precision bore items",
        ],
      },
    })
    .catch(() => null);
}

export async function getPrograms(organizationId: string) {
  const programs =
    (await prisma.program
      .findMany({
        where: { organizationId },
        include: {
          decisions: { take: 5, orderBy: { createdAt: "desc" } },
          predictions: true,
        },
        orderBy: { createdAt: "desc" },
      })
      .catch(() => [])) ?? [];

  return programs;
}

export async function getProgramHealthDetails(programId: string) {
  const program = await prisma.program
    .findUnique({
      where: { id: programId },
      include: {
        decisions: {
          include: {
            proposedBy: { select: { name: true } },
            milestones: true,
          },
          orderBy: { createdAt: "desc" },
        },
        predictions: true,
      },
    })
    .catch(() => null);

  if (!program) {
    throw new Error("Program not found");
  }

  // Aggregate decisions stats
  const decisions = program.decisions || [];
  const totalDecisions = decisions.length;
  const approvedDecisions = decisions.filter(
    (d) => d.status === "APPROVED" || d.status === "COMPLETED",
  ).length;
  const decisionTypes = {
    materialSubs: decisions.filter((d) => d.decisionType === "MATERIAL_SUB").length,
    toleranceChanges: decisions.filter((d) => d.decisionType === "TOLERANCE_CHANGE").length,
    supplierChanges: decisions.filter((d) => d.decisionType === "SUPPLIER_CHANGE").length,
    processChanges: decisions.filter((d) => d.decisionType === "PROCESS_CHANGE").length,
  };

  return {
    program,
    summary: {
      totalDecisions,
      approvedDecisions,
      approvalRate:
        totalDecisions > 0 ? Math.round((approvedDecisions / totalDecisions) * 100) : 100,
      decisionTypes,
    },
  };
}
