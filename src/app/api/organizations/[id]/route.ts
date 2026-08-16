import { NextResponse } from "next/server";
import { getOrganization, updateOrganization } from "@/server/organizations";
import { requireOrganizationMembership } from "@/server/organizations/organization-context";
import { AppError } from "@/shared/errors";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireOrganizationMembership(id);
    const org = await getOrganization(id);
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: org });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireOrganizationMembership(id);
    const body = await request.json();
    const { name, description } = body;
    const org = await updateOrganization(id, { name, description });
    return NextResponse.json({ data: org });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
