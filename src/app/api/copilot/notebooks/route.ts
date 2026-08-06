import { NextResponse } from "next/server";
import { getLiveEngineeringNotebooks } from "@/server/copilot/notebook-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";

    const notebooks = await getLiveEngineeringNotebooks(orgId);

    return NextResponse.json({
      success: true,
      notebooks,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch notebooks." },
      { status: 500 },
    );
  }
}
