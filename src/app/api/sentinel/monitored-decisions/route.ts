import { NextResponse } from "next/server";
import { monitorActiveDecisions } from "@/server/sentinel/decision-sentinel";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";

    const result = await monitorActiveDecisions(orgId);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to monitor decisions.",
      },
      { status: 500 },
    );
  }
}
