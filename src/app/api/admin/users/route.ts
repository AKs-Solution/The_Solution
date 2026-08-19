import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/admin-auth";
import { listAdminUsers } from "@/server/admin/admin-service";
import { adminErrorResponse } from "@/server/admin/errors";

export async function GET() {
  try {
    await requireAdmin();
    const data = await listAdminUsers();
    return NextResponse.json({ data });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
