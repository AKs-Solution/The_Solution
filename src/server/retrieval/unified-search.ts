import { prisma } from "@/server/db";

export interface UnifiedSearchOptions {
  organizationId: string;
  query: string;
  entityTypes?: string[];
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface UnifiedSearchResultItem {
  id: string;
  type: string; // "ENTITY" | "DECISION" | "DOCUMENT" | "PRECEDENT" | "RULE" | "SUPPLIER" | "PROGRAM" | "CONTRADICTION" | "ASSUMPTION" | "REJECTED_ALTERNATIVE" | "LESSON_LEARNED"
  title: string;
  subtitle: string;
  description?: string;
  href: string;
  score: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface UnifiedSearchResponse {
  query: string;
  totalResults: number;
  data: UnifiedSearchResultItem[];
}

/**
 * High-Performance Unified Search Engine
 * Searches across canonical Entities, Decisions, Ingestion Documents, Historical Precedents,
 * Rules, Suppliers, Programs, Contradictions, Assumptions, Rejected Alternatives, and Lessons Learned.
 */
export async function executeUnifiedSearch(
  options: UnifiedSearchOptions,
): Promise<UnifiedSearchResponse> {
  const { organizationId, query, entityTypes, limit = 20, offset = 0 } = options;
  const q = query.trim();

  if (!q) {
    return { query: q, totalResults: 0, data: [] };
  }

  const perCategoryLimit = Math.max(5, Math.ceil(limit / 4));
  const results: UnifiedSearchResultItem[] = [];

  const filterType = (typeKey: string) =>
    !entityTypes || entityTypes.length === 0 || entityTypes.includes(typeKey);

  try {
    const [
      entities,
      decisions,
      documents,
      precedents,
      rules,
      suppliers,
      programs,
      contradictions,
      assumptions,
      rejectedAlternatives,
      designPatterns,
    ] = await Promise.all([
      filterType("ENTITY")
        ? prisma.engineeringEntity
            .findMany({
              where: {
                organizationId,
                deletedAt: null,
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { identifier: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              },
              take: perCategoryLimit,
              orderBy: { updatedAt: "desc" },
            })
            .catch(() => [])
        : Promise.resolve([]),

      filterType("DECISION")
        ? prisma.engineeringDecision
            .findMany({
              where: {
                organizationId,
                OR: [
                  { description: { contains: q, mode: "insensitive" } },
                  { rationale: { contains: q, mode: "insensitive" } },
                  { decisionType: { contains: q, mode: "insensitive" } },
                ],
              },
              take: perCategoryLimit,
              orderBy: { createdAt: "desc" },
            })
            .catch(() => [])
        : Promise.resolve([]),

      filterType("DOCUMENT")
        ? prisma.ingestionDocument
            .findMany({
              where: {
                organizationId,
                deletedAt: null,
                fileName: { contains: q, mode: "insensitive" },
              },
              take: perCategoryLimit,
              orderBy: { createdAt: "desc" },
            })
            .catch(() => [])
        : Promise.resolve([]),

      filterType("PRECEDENT")
        ? prisma.historicalPrecedent
            .findMany({
              where: {
                organizationId,
                deletedAt: null,
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { summary: { contains: q, mode: "insensitive" } },
                  { decisionMade: { contains: q, mode: "insensitive" } },
                ],
              },
              take: perCategoryLimit,
              orderBy: { createdAt: "desc" },
            })
            .catch(() => [])
        : Promise.resolve([]),

      filterType("RULE")
        ? prisma.rule
            .findMany({
              where: {
                organizationId,
                deletedAt: null,
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                  { category: { contains: q, mode: "insensitive" } },
                ],
              },
              take: perCategoryLimit,
              orderBy: { updatedAt: "desc" },
            })
            .catch(() => [])
        : Promise.resolve([]),

      filterType("SUPPLIER")
        ? prisma.supplier
            .findMany({
              where: {
                organizationId,
                deletedAt: null,
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { identifier: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              },
              take: perCategoryLimit,
              orderBy: { updatedAt: "desc" },
            })
            .catch(() => [])
        : Promise.resolve([]),

      filterType("PROGRAM")
        ? prisma.program
            .findMany({
              where: {
                organizationId,
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { aircraft: { contains: q, mode: "insensitive" } },
                ],
              },
              take: perCategoryLimit,
              orderBy: { createdAt: "desc" },
            })
            .catch(() => [])
        : Promise.resolve([]),

      filterType("CONTRADICTION")
        ? prisma.contradiction
            .findMany({
              where: {
                organizationId,
                OR: [
                  { label: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                  { type: { contains: q, mode: "insensitive" } },
                ],
              },
              take: perCategoryLimit,
              orderBy: { createdAt: "desc" },
            })
            .catch(() => [])
        : Promise.resolve([]),

      filterType("ASSUMPTION")
        ? prisma.assumptionRecord
            .findMany({
              where: {
                OR: [
                  { statement: { contains: q, mode: "insensitive" } },
                  { justification: { contains: q, mode: "insensitive" } },
                ],
              },
              take: perCategoryLimit,
              orderBy: { createdAt: "desc" },
            })
            .catch(() => [])
        : Promise.resolve([]),

      filterType("REJECTED_ALTERNATIVE")
        ? prisma.alternativeRecord
            .findMany({
              where: {
                status: "REJECTED",
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                  { rejectionReason: { contains: q, mode: "insensitive" } },
                ],
              },
              take: perCategoryLimit,
              orderBy: { createdAt: "desc" },
            })
            .catch(() => [])
        : Promise.resolve([]),

      filterType("LESSON_LEARNED")
        ? prisma.drawingDesignPattern
            .findMany({
              where: {
                organizationId,
                OR: [
                  { lessonsLearned: { contains: q, mode: "insensitive" } },
                  { partType: { contains: q, mode: "insensitive" } },
                  { material: { contains: q, mode: "insensitive" } },
                ],
              },
              take: perCategoryLimit,
              orderBy: { createdAt: "desc" },
            })
            .catch(() => [])
        : Promise.resolve([]),
    ]);

    for (const e of entities) {
      results.push({
        id: e.id,
        type: "ENTITY",
        title: e.name,
        subtitle: `${e.entityType} • ${e.identifier}`,
        description: e.description || undefined,
        href: `/entities/${e.id}`,
        score: 1.0,
        createdAt: e.createdAt.toISOString(),
      });
    }

    for (const d of decisions) {
      results.push({
        id: d.id,
        type: "DECISION",
        title: d.description,
        subtitle: `Decision • ${d.decisionType} (${d.status})`,
        description: d.rationale,
        href: `/decisions`,
        score: 0.95,
        createdAt: d.createdAt.toISOString(),
      });
    }

    for (const doc of documents) {
      results.push({
        id: doc.id,
        type: "DOCUMENT",
        title: doc.fileName,
        subtitle: `Document • ${doc.fileExtension.toUpperCase()} (${(doc.sizeBytes / 1024).toFixed(1)} KB)`,
        href: `/ingestion/documents/${doc.id}`,
        score: 0.9,
        createdAt: doc.createdAt.toISOString(),
      });
    }

    for (const p of precedents) {
      results.push({
        id: p.id,
        type: "PRECEDENT",
        title: p.title,
        subtitle: `Precedent • Decision: ${p.decisionMade.slice(0, 50)}...`,
        description: p.summary,
        href: `/precedents`,
        score: 0.88,
        createdAt: p.createdAt.toISOString(),
      });
    }

    for (const r of rules) {
      results.push({
        id: r.id,
        type: "RULE",
        title: r.name,
        subtitle: `Rule • ${r.category} (${r.severity})`,
        description: r.description || undefined,
        href: `/rules`,
        score: 0.85,
        createdAt: r.createdAt.toISOString(),
      });
    }

    for (const s of suppliers) {
      results.push({
        id: s.id,
        type: "SUPPLIER",
        title: s.name,
        subtitle: `Supplier • ${s.supplierType} (${s.status})`,
        description: s.description || undefined,
        href: `/suppliers`,
        score: 0.85,
        createdAt: s.createdAt.toISOString(),
      });
    }

    for (const prog of programs) {
      results.push({
        id: prog.id,
        type: "PROGRAM",
        title: prog.name,
        subtitle: `Program • Aircraft: ${prog.aircraft}`,
        href: `/programs`,
        score: 0.8,
        createdAt: prog.createdAt.toISOString(),
      });
    }

    for (const c of contradictions) {
      results.push({
        id: c.id,
        type: "CONTRADICTION",
        title: c.label,
        subtitle: `Contradiction • ${c.severity} (${c.status})`,
        description: c.description,
        href: `/contradictions`,
        score: 0.8,
        createdAt: c.createdAt.toISOString(),
      });
    }

    for (const asm of assumptions) {
      results.push({
        id: asm.id,
        type: "ASSUMPTION",
        title: `Assumption: ${asm.statement.slice(0, 60)}`,
        subtitle: `Risk Level: ${asm.riskLevel} • ${asm.isVerified ? "Verified" : "Unverified"}`,
        description: asm.justification,
        href: `/reasoning`,
        score: 0.92,
        createdAt: asm.createdAt.toISOString(),
      });
    }

    for (const rej of rejectedAlternatives) {
      results.push({
        id: rej.id,
        type: "REJECTED_ALTERNATIVE",
        title: `Rejected Option: ${rej.name}`,
        subtitle: `Reason: ${rej.rejectionReason || "Deselected"}`,
        description: rej.description,
        href: `/decisions`,
        score: 0.91,
        createdAt: rej.createdAt.toISOString(),
      });
    }

    for (const dp of designPatterns) {
      results.push({
        id: dp.id,
        type: "LESSON_LEARNED",
        title: `Lesson: ${dp.partType} ${dp.material}`,
        subtitle: `Geometry: ${dp.geometryClass} • Yield: ${dp.yieldRate}%`,
        description: dp.lessonsLearned,
        href: `/precedents`,
        score: 0.89,
        createdAt: dp.createdAt.toISOString(),
      });
    }
  } catch (err) {
    console.warn("Unified search fallback on DB disconnect:", err);
  }

  results.sort((a, b) => b.score - a.score);
  const paginatedData = results.slice(offset, offset + limit);

  return {
    query: q,
    totalResults: results.length,
    data: paginatedData,
  };
}
