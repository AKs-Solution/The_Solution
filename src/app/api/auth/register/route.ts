import { NextResponse } from "next/server";
import { registerUser } from "@/server/auth";
import { rateLimitedResponse } from "@/server/security";
import { ValidationError, AppError, RateLimitedError } from "@/shared/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, inviteToken } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Validation failed", details: { email: ["Email is required"] } },
        { status: 400 },
      );
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: { password: ["Password must be at least 8 characters"] },
        },
        { status: 400 },
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined;

    const result = await registerUser({
      email: email.toLowerCase().trim(),
      password,
      name,
      ipAddress,
      inviteToken: typeof inviteToken === "string" ? inviteToken : undefined,
    });

    return NextResponse.json({ data: result.user }, { status: 201 });
  } catch (error) {
    if (error instanceof RateLimitedError) {
      return rateLimitedResponse(error);
    }
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
