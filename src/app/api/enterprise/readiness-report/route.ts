import { NextResponse } from "next/server";
import { generateEnterpriseReadinessReport } from "@/server/enterprise/observability-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";

    const report = await generateEnterpriseReadinessReport(orgId);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to generate report." },
      { status: 500 },
    );
  }
}
