import { NextResponse } from "next/server";
import { getEnterpriseHealthMetrics } from "@/server/enterprise/observability-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";

    const metrics = await getEnterpriseHealthMetrics(orgId);

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch metrics." },
      { status: 500 },
    );
  }
}
