import { NextResponse } from "next/server";
import { monitorActiveDecisions } from "@/server/sentinel/decision-sentinel";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { getCurrentUser } from "@/server/auth";
import { AppError } from "@/shared/errors";

export async function GET() {
  try {
    const orgId = await requireActiveOrganization();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const result = await monitorActiveDecisions(orgId);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to monitor decisions.",
      },
      { status: statusCode },
    );
  }
}
