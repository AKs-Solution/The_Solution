import { NextResponse } from "next/server";
import { z } from "zod";
import { validateSession } from "@/server/auth/session-service";
import { getActiveOrganizationId } from "@/server/organizations/organization-context";
import { invalidateAssumption } from "@/server/memory/memory-engine";

const invalidateSchema = z.object({
  assumptionId: z.string().min(1),
  reasonForInvalidation: z.string().min(3),
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
    const parsed = invalidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const report = await invalidateAssumption({
      organizationId: orgId,
      assumptionId: parsed.data.assumptionId,
      invalidatedById: session.userId,
      reasonForInvalidation: parsed.data.reasonForInvalidation,
    });

    return NextResponse.json({ data: report });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
