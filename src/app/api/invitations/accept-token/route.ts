import { NextResponse } from "next/server";
import { acceptInvitationByToken } from "@/server/organizations";
import { AppError, ValidationError } from "@/shared/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token : "";
    if (!token) {
      return NextResponse.json({ error: "Invitation token is required" }, { status: 400 });
    }
    const result = await acceptInvitationByToken(token);
    return NextResponse.json({ data: result });
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
