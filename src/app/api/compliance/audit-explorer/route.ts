import { NextResponse } from "next/server";
import { getAuditExplorerView } from "@/server/compliance/audit-explorer-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";
    const entityId = searchParams.get("entityId") || "comp-840";

    const auditView = await getAuditExplorerView(orgId, entityId);

    return NextResponse.json({
      success: true,
      auditView,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch audit explorer view.",
      },
      { status: 500 },
    );
  }
}
