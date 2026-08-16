import { NextResponse } from "next/server";
import { removeMember } from "@/server/organizations";
import { changeMemberRole } from "@/server/rbac";
import { requireOrganizationMembership } from "@/server/organizations/organization-context";
import { AppError, ForbiddenError } from "@/shared/errors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  try {
    const { id, userId } = await params;
    await requireOrganizationMembership(id);
    const body = await request.json();
    const { role } = body;

    if (!role || typeof role !== "string") {
      return NextResponse.json(
        { error: "Validation failed", details: { role: ["Role is required"] } },
        { status: 400 },
      );
    }

    await changeMemberRole(id, userId, role);
    return NextResponse.json({ data: { message: "Role updated" } });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode },
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  try {
    const { id, userId } = await params;
    await requireOrganizationMembership(id);
    await removeMember(id, userId);
    return NextResponse.json({ data: { message: "Member removed" } });
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
