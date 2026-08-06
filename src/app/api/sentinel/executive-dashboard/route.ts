import { NextResponse } from "next/server";
import { getExecutiveDashboardData } from "@/server/sentinel/executive-dashboard-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";

    const dashboard = await getExecutiveDashboardData(orgId);

    return NextResponse.json({
      success: true,
      dashboard,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch executive dashboard.",
      },
      { status: 500 },
    );
  }
}
