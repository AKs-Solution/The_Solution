import { NextResponse } from "next/server";
import { detectTechnicalDebt } from "@/server/reasoning/technical-debt-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId") || "default-org";

    const items = await detectTechnicalDebt(orgId);

    const metrics = {
      totalDebtItems: items.length,
      criticalItems: items.filter((i) => i.severity === "CRITICAL").length,
      highItems: items.filter((i) => i.severity === "HIGH").length,
      mediumItems: items.filter((i) => i.severity === "MEDIUM").length,
      lowItems: items.filter((i) => i.severity === "LOW").length,
      overallDebtScore: Math.max(10, 100 - items.length * 8),
    };

    return NextResponse.json({
      success: true,
      metrics,
      items,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch technical debt.",
      },
      { status: 500 },
    );
  }
}
