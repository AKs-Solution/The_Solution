import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/admin-auth";
import { replyToInboxSubmission } from "@/server/admin/admin-service";
import { adminErrorResponse } from "@/server/admin/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body: unknown = await request.json();
    const replyBody =
      typeof body === "object" && body !== null && "body" in body
        ? String((body as { body: unknown }).body)
        : "";
    const result = await replyToInboxSubmission(id, replyBody);
    return NextResponse.json({ data: result });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
