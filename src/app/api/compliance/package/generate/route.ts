import { NextResponse } from "next/server";
import { generateCertificationPackage } from "@/server/compliance/package-generator";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { getCurrentUser } from "@/server/auth";
import { AppError } from "@/shared/errors";

export async function POST(request: Request) {
  try {
    const orgId = await requireActiveOrganization();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const programName = body.programName || "Propulsion Subsystem Flight Certification";

    const certPackage = await generateCertificationPackage(orgId, programName);

    return NextResponse.json({
      success: true,
      certPackage,
    });
  } catch (err) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to generate certification package.",
      },
      { status: statusCode },
    );
  }
}
