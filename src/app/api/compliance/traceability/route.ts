import { NextResponse } from "next/server";
import { getEndToEndTraceability } from "@/server/compliance/compliance-engine";
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
    const reqId = searchParams.get("reqId") || "req-therm-402";

    const path = await getEndToEndTraceability(orgId, reqId);

    return NextResponse.json({
      success: true,
      traceability: path,
    });
  } catch (err) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch compliance traceability.",
      },
      { status: statusCode },
    );
  }
}
