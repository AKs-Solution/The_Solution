import { NextResponse } from "next/server";
import { AppError } from "@/shared/errors";
import { AdminAccessError } from "./admin-auth";

export function adminErrorResponse(error: unknown): NextResponse {
  if (error instanceof AdminAccessError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode },
    );
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
