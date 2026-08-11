import { NextResponse } from "next/server";
import { validateSession } from "@/server/auth/session-service";
import { getActiveOrganizationId } from "@/server/organizations/organization-context";
import { createAssessment, getAssessments } from "@/server/assessments/assessment-service";

export async function GET() {
  const session = await validateSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const assessments = await getAssessments(orgId);
  return NextResponse.json({ data: assessments });
}

export async function POST(request: Request) {
  const session = await validateSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const body = await request.json();
  const assessment = await createAssessment({
    organizationId: orgId,
    projectId: body.projectId,
    title: body.title,
    description: body.description,
    severity: body.severity,
    evidenceSummary: body.evidenceSummary,
    consequencesJson: body.consequencesJson,
    createdById: session.userId,
  });

  return NextResponse.json({ data: assessment }, { status: 201 });
}
