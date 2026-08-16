import { NextResponse } from "next/server";
import { isMailConfigured, sendCustomerCareEmail } from "@/server/mail";
import { persistInboxSubmission } from "@/server/marketing/inbox-submission";
import { isHoneypotTriggered, supportInquirySchema } from "@/server/marketing/support-inquiry";
import { supportInquiryRateLimiter } from "@/server/security/rate-limiter";
import { rateLimitedResponse } from "@/server/security/response-helpers";
import { RateLimitedError } from "@/shared/errors";
import { logger } from "@/shared/logging";

export async function POST(request: Request) {
  try {
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const retryAfter = supportInquiryRateLimiter.check(ipAddress);
    if (retryAfter !== null) {
      return rateLimitedResponse(
        new RateLimitedError("Too many support requests. Try again later.", retryAfter),
      );
    }
    supportInquiryRateLimiter.record(ipAddress);

    const body: unknown = await request.json();
    const parsed = supportInquirySchema.safeParse(body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "general");
        details[key] = [...(details[key] ?? []), issue.message];
      }
      return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
    }

    if (isHoneypotTriggered(parsed.data.companyUrl)) {
      return NextResponse.json({ data: { message: "Support request received" } });
    }

    logger.info("Customer-care submission received", { category: parsed.data.category });

    const delivered = await sendCustomerCareEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      category: parsed.data.category,
      subject: parsed.data.subject,
      message: parsed.data.message,
      diagnostics: parsed.data.diagnostics,
    });

    const persisted = await persistInboxSubmission({
      kind: "customer_care",
      email: parsed.data.email,
      name: parsed.data.name,
      subject: parsed.data.subject,
      message: parsed.data.message,
      metadata: { category: parsed.data.category },
      delivered,
    });

    if (delivered) {
      return NextResponse.json({ data: { message: "Support request received" } });
    }

    if (persisted) {
      return NextResponse.json(
        {
          error:
            "Your request was saved, but email delivery is unavailable right now. We will process it from the queue.",
        },
        { status: 503 },
      );
    }

    logger.warn("Customer-care inquiry dropped: mail not configured and persist failed", {
      mailConfigured: isMailConfigured(),
    });
    return NextResponse.json(
      {
        error:
          "Unable to deliver this request. Email delivery is not configured and the submission could not be saved. Try again later.",
      },
      { status: 503 },
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
