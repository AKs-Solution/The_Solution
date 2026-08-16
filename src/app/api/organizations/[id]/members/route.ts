import { NextResponse } from "next/server";
import { listMembers, inviteMember } from "@/server/organizations";
import { requireOrganizationMembership } from "@/server/organizations/organization-context";
import { AppError, ValidationError } from "@/shared/errors";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireOrganizationMembership(id);
    const members = await listMembers(id);
    return NextResponse.json({ data: members });
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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireOrganizationMembership(id);
    const body = await request.json();
    const { name, email, role } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Validation failed", details: { email: ["Valid email is required"] } },
        { status: 400 },
      );
    }

    const result = await inviteMember(id, email, role, name);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
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
