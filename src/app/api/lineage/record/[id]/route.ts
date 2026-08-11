import { NextResponse } from "next/server";
import { validateSession } from "@/server/auth/session-service";
import { getActiveOrganizationId } from "@/server/organizations/organization-context";
import { getRecordLineage } from "@/server/lineage/lineage-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await validateSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let orgId = await getActiveOrganizationId();
  if (!orgId) {
    const member = await import("@/server/db").then((m) =>
      m.prisma.organizationMember.findFirst({ where: { userId: session.userId } }),
    );
    orgId = member?.organizationId ?? null;
  }

  if (!orgId) {
    return NextResponse.json({ error: "No active organization" }, { status: 403 });
  }

  const lineage = await getRecordLineage(id, orgId);
  return NextResponse.json({ data: lineage });
}
