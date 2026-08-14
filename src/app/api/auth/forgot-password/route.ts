import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/server/auth";
import { passwordResetRateLimiter } from "@/server/security/rate-limiter";
import { rateLimitedResponse } from "@/server/security/response-helpers";
import { RateLimitedError } from "@/shared/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Validation failed", details: { email: ["Email is required"] } },
        { status: 400 },
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined;

    if (ipAddress) {
      const retryAfter = passwordResetRateLimiter.check(ipAddress);
      if (retryAfter !== null) {
        return rateLimitedResponse(
          new RateLimitedError("Too many password reset attempts. Try again later.", retryAfter),
        );
      }
      passwordResetRateLimiter.record(ipAddress);
    }

    await requestPasswordReset(email.toLowerCase().trim(), ipAddress);

    return NextResponse.json({
      data: { message: "If the email exists, a reset link has been sent" },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
