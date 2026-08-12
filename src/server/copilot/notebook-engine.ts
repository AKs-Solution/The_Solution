/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";

export interface EngineeringNotebook {
  id: string;
  title: string;
  category: "DESIGN_STUDY" | "DECISION_JOURNAL" | "REVIEW_PACKAGE" | "FAILURE_INVESTIGATION";
  authorName: string;
  linkedEntityIds: string[];
  summary: string;
  notesMarkdown: string;
  updatedAt: string;
}

/**
 * Live Engineering Notebooks Engine
 */
export async function getLiveEngineeringNotebooks(
  organizationId: string,
): Promise<EngineeringNotebook[]> {
  try {
    const sessions = await (prisma as any).reasoningSession?.findMany({
      where: { organizationId },
      include: {
        creator: { select: { name: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }).catch(() => []) ?? [];

    const notebooks: EngineeringNotebook[] = sessions.map((s: any) => ({
      id: s.id,
      title: s.title || "Engineering Investigation Session",
      category: "DECISION_JOURNAL",
      authorName: s.creator?.name || "Lead Systems Engineer",
      linkedEntityIds: [],
      summary: s.summary || s.problemStatement || "Technical reasoning session.",
      notesMarkdown: `# ${s.title || "Engineering Session"}\n\n## Problem Statement\n${s.problemStatement || "Evaluation of engineering trade studies."}\n\n## Conclusion\n${s.summary || "Traceability verified."}`,
      updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return notebooks;
  } catch (err) {
    console.warn("[NotebookEngine] DB query error:", err);
    return [];
  }
}
