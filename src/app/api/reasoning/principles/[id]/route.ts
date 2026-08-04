import { NextRequest, NextResponse } from "next/server";
import { requireActiveOrganization } from "@/server/organizations/organization-context";
import { getPrincipleByCode, updatePrincipleVersion } from "@/server/reasoning";
import { AppError } from "@/shared/errors";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let organizationId: string | undefined;
    try {
      organizationId = await requireActiveOrganization();
    } catch {
      // Fallback
    }

    const principle = await getPrincipleByCode(id, organizationId);
    return NextResponse.json({ data: principle });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to fetch engineering principle";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const organizationId = await requireActiveOrganization();
    const body = await req.json();

    const updated = await updatePrincipleVersion(id, organizationId, {
      description: body.description,
      governingEquations: body.governingEquations,
      supportingEvidenceRefs: body.supportingEvidenceRefs,
    });

    return NextResponse.json({ data: updated });
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    const message = err instanceof Error ? err.message : "Failed to update principle version";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
