import { NextResponse } from "next/server";
import { previewInvitationByToken } from "@/server/organizations";
import { invitationPreviewRateLimiter } from "@/server/security/rate-limiter";
import { rateLimitedResponse } from "@/server/security/response-helpers";
import { AppError, RateLimitedError, ValidationError } from "@/shared/errors";

export async function GET(request: Request) {
  try {
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const retryAfter = invitationPreviewRateLimiter.check(ipAddress);
    if (retryAfter !== null) {
      return rateLimitedResponse(
        new RateLimitedError("Too many invitation lookups. Try again later.", retryAfter),
      );
    }
    invitationPreviewRateLimiter.record(ipAddress);

    const token = new URL(request.url).searchParams.get("token") ?? "";
    const preview = await previewInvitationByToken(token);
    return NextResponse.json({ data: preview });
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
