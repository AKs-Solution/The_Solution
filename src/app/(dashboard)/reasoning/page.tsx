import { requireActiveOrganization } from "@/server/organizations/organization-context";
import {
  getEngineeringPrinciples,
  getReasoningExplanation,
  getReasoningGraph,
  listReasoningSessions,
} from "@/server/reasoning";
import { ReasoningWorkspace } from "@/features/reasoning/components/ReasoningWorkspace";
export const dynamic = "force-dynamic";

export default async function ReasoningWorkspacePage() {
  let organizationId: string | undefined;
  try {
    organizationId = await requireActiveOrganization();
  } catch {
    // Fallback
  }

  const defaultOrgId = organizationId || "demo-org";

  const [sessionsRes, principles] = await Promise.all([
    listReasoningSessions(defaultOrgId, { page: 1, pageSize: 20 }),
    getEngineeringPrinciples(defaultOrgId),
  ]);

  const activeSessionId = sessionsRes.data[0]?.id;
  let activeExplanation = null;
  let activeGraph = null;

  if (activeSessionId) {
    try {
      [activeExplanation, activeGraph] = await Promise.all([
        getReasoningExplanation(activeSessionId, defaultOrgId),
        getReasoningGraph(activeSessionId, defaultOrgId),
      ]);
    } catch {
      // Fallback
    }
  }

  const sessionsSummary = (sessionsRes.data as Array<{
    id: string;
    title: string;
    problemStatement: string;
    status: string;
    confidenceScore: number;
    createdAt: Date;
  }>).map((s) => ({
    id: s.id,
    title: s.title,
    problemStatement: s.problemStatement,
    status: s.status,
    confidenceScore: s.confidenceScore,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-7xl p-6">
      <ReasoningWorkspace
        initialSessions={sessionsSummary}
        initialActiveSession={activeExplanation}
        initialGraph={activeGraph}
        principles={principles}
      />
    </div>
  );
}
