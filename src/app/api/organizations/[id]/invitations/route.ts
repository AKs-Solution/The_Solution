import { NextResponse } from "next/server";
import { listOrganizationInvitations } from "@/server/organizations";
import { AppError } from "@/shared/errors";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const invitations = await listOrganizationInvitations(id);
    return NextResponse.json({ data: invitations });
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
