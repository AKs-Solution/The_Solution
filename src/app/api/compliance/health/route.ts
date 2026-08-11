import { NextResponse } from "next/server";
import { calculateComplianceHealth } from "@/server/compliance/compliance-health-calculator";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { getCurrentUser } from "@/server/auth";
import { AppError } from "@/shared/errors";

export async function GET() {
  try {
    const orgId = await requireActiveOrganization();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const health = await calculateComplianceHealth(orgId);

    return NextResponse.json({
      success: true,
      health,
    });
  } catch (err) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to calculate compliance health.",
      },
      { status: statusCode },
    );
  }
}
