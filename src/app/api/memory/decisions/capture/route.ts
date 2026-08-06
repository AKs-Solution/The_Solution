import { NextResponse } from "next/server";
import { z } from "zod";
import { validateSession } from "@/server/auth/session-service";
import { getActiveOrganizationId } from "@/server/organizations/organization-context";
import { captureComprehensiveDecision } from "@/server/memory/memory-engine";
import { AppError } from "@/shared/errors";

const captureSchema = z.object({
  decisionType: z.string().min(1),
  problemStatement: z.string().min(3),
  rationale: z.string().min(3),
  partId: z.string().optional(),
  supplierId: z.string().optional(),
  programId: z.string().optional(),
  options: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string(),
        pros: z.array(z.string()).optional(),
        cons: z.array(z.string()).optional(),
        score: z.number().optional(),
        isSelected: z.boolean(),
        rejectionReason: z.string().optional(),
      }),
    )
    .min(1),
  assumptions: z
    .array(
      z.object({
        statement: z.string().min(1),
        justification: z.string(),
        riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
        impactIfInvalid: z.string(),
        isVerified: z.boolean().optional(),
      }),
    )
    .default([]),
  tradeoffs: z
    .array(
      z.object({
        criterion: z.string(),
        optionA: z.string(),
        optionB: z.string(),
        comparisonDetails: z.string(),
        selectedOption: z.string().optional(),
      }),
    )
    .optional(),
  evidenceHashes: z.array(z.string()).optional(),
  costImpact: z.number().optional(),
  scheduleImpactDays: z.number().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await validateSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = await getActiveOrganizationId();
    if (!orgId) {
      return NextResponse.json({ error: "No active organization" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = captureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await captureComprehensiveDecision({
      organizationId: orgId,
      proposedById: session.userId,
      ...parsed.data,
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
