import { NextResponse } from "next/server";
import { getEndToEndTraceability } from "@/server/compliance/compliance-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";
    const reqId = searchParams.get("reqId") || "req-therm-402";

    const path = await getEndToEndTraceability(orgId, reqId);

    return NextResponse.json({
      success: true,
      traceability: path,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch compliance traceability.",
      },
      { status: 500 },
    );
  }
}
