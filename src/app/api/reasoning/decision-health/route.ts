import { NextResponse } from "next/server";
import { calculateDecisionHealth } from "@/server/reasoning/decision-health-calculator";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";
    const decisionId = searchParams.get("decisionId") || "sample-decision-1";

    const health = await calculateDecisionHealth(orgId, decisionId);

    return NextResponse.json({
      success: true,
      health,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to calculate decision health.",
      },
      { status: 500 },
    );
  }
}
