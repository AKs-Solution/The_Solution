import { NextResponse } from "next/server";
import { calculateComplianceHealth } from "@/server/compliance/compliance-health-calculator";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";

    const health = await calculateComplianceHealth(orgId);

    return NextResponse.json({
      success: true,
      health,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to calculate compliance health.",
      },
      { status: 500 },
    );
  }
}
