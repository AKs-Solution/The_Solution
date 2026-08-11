import { NextResponse } from "next/server";
import { getAuditExplorerView } from "@/server/compliance/audit-explorer-engine";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { getCurrentUser } from "@/server/auth";
import { AppError } from "@/shared/errors";

export async function GET(request: Request) {
  try {
    const orgId = await requireActiveOrganization();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId") || "comp-840";

    const auditView = await getAuditExplorerView(orgId, entityId);

    return NextResponse.json({
      success: true,
      auditView,
    });
  } catch (err) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch audit explorer view.",
      },
      { status: statusCode },
    );
  }
}
