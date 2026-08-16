import { NextResponse } from "next/server";
import { sendDemoInquiryEmail } from "@/server/mail";
import { contactInquirySchema, isConsumerEmailDomain } from "@/server/marketing/contact-inquiry";
import { contactInquiryRateLimiter } from "@/server/security/rate-limiter";
import { rateLimitedResponse } from "@/server/security/response-helpers";
import { RateLimitedError } from "@/shared/errors";
import { logger } from "@/shared/logging";

export async function POST(request: Request) {
  try {
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const retryAfter = contactInquiryRateLimiter.check(ipAddress);
    if (retryAfter !== null) {
      return rateLimitedResponse(
        new RateLimitedError("Too many evaluation requests. Try again later.", retryAfter),
      );
    }
    contactInquiryRateLimiter.record(ipAddress);

    const body: unknown = await request.json();
    const parsed = contactInquirySchema.safeParse(body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        details[key] = [...(details[key] ?? []), issue.message];
      }
      return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
    }

    if (isConsumerEmailDomain(parsed.data.workEmail)) {
      return NextResponse.json(
        {
          error: "Use a work or agency email address.",
          details: { workEmail: ["Use a work or agency email address."] },
        },
        { status: 400 },
      );
    }

    logger.info("Technical evaluation inquiry received", {
      organization: parsed.data.organization,
      role: parsed.data.role,
    });

    await sendDemoInquiryEmail(parsed.data);

    return NextResponse.json({
      data: { message: "Evaluation request received" },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
