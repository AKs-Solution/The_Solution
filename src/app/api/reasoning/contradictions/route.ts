import { NextResponse } from "next/server";
import { detectContradictionsAndGaps } from "@/server/reasoning/contradiction-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";

    const result = await detectContradictionsAndGaps(orgId);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to detect contradictions and gaps.",
      },
      { status: 500 },
    );
  }
}
