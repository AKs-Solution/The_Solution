import { Precedent, PrecedentMatchContext, MatchedPrecedent } from "@/features/precedents/types";
import { INDUSTRY_FAILURE_SEEDS, queryModelMany } from "@/server/precedents/seed-industry-graph";

interface MatchResult {
  score: number;
  reasons: string[];
}

export function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a.map((s) => s.toLowerCase().trim()));
  const setB = new Set(b.map((s) => s.toLowerCase().trim()));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

function overlapScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b.map((s) => s.toLowerCase().trim()));
  let matches = 0;
  for (const item of a) {
    if (setB.has(item.toLowerCase().trim())) matches++;
  }
  return matches / Math.max(a.length, b.length);
}

function tokenMatch(text: string, tokens: string[]): { score: number; matched: string[] } {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const token of tokens) {
    if (lower.includes(token.toLowerCase())) {
      matched.push(token);
    }
  }
  return { score: matched.length > 0 ? matched.length / tokens.length : 0, matched };
}

export function computeSimilarity(
  precedent: Precedent,
  context: PrecedentMatchContext,
): MatchResult {
  const reasons: string[] = [];
  let totalScore = 0;
  const weights = {
    supplier: 20,
    component: 18,
    requirement: 16,
    standard: 14,
    certification: 12,
    document: 10,
    contradiction: 8,
    evidence: 8,
    tags: 6,
    project: 4,
    question: 4,
  };

  // Supplier match
  if (context.suppliers && context.suppliers.length > 0) {
    const score = overlapScore(context.suppliers, precedent.relatedSuppliers);
    if (score > 0) {
      const matched = context.suppliers.filter((s) =>
        precedent.relatedSuppliers.some((ps) => ps.toLowerCase() === s.toLowerCase()),
      );
      totalScore += score * weights.supplier;
      reasons.push(`Same supplier: ${matched.join(", ")}`);
    }
  }

  // Component match
  if (context.components && context.components.length > 0) {
    const score = overlapScore(context.components, precedent.relatedComponents);
    if (score > 0) {
      const matched = context.components.filter((c) =>
        precedent.relatedComponents.some((pc) => pc.toLowerCase() === c.toLowerCase()),
      );
      totalScore += score * weights.component;
      reasons.push(`Same component: ${matched.join(", ")}`);
    }
  }

  // Requirement match
  if (context.requirements && context.requirements.length > 0) {
    const score = overlapScore(context.requirements, precedent.relatedRequirements);
    if (score > 0) {
      totalScore += score * weights.requirement;
      reasons.push(`Same requirement(s) referenced`);
    }
  }

  // Standard match
  if (context.standards && context.standards.length > 0) {
    const score = overlapScore(context.standards, precedent.relatedStandards);
    if (score > 0) {
      const matched = context.standards.filter((s) =>
        precedent.relatedStandards.some((ps) => ps.toLowerCase() === s.toLowerCase()),
      );
      totalScore += score * weights.standard;
      reasons.push(`Same standard: ${matched.join(", ")}`);
    }
  }

  // Certification match
  if (context.certifications && context.certifications.length > 0) {
    const score = overlapScore(context.certifications, precedent.relatedCertifications);
    if (score > 0) {
      totalScore += score * weights.certification;
      reasons.push(`Same certification referenced`);
    }
  }

  // Document match
  if (context.documents && context.documents.length > 0) {
    const score = overlapScore(context.documents, precedent.relatedDocuments);
    if (score > 0) {
      totalScore += score * weights.document;
      reasons.push(`Same document reference`);
    }
  }

  // Contradiction match
  if (context.contradictions && context.contradictions.length > 0) {
    const score = overlapScore(context.contradictions, precedent.contradictions);
    if (score > 0) {
      totalScore += score * weights.contradiction;
      reasons.push(`Similar contradiction pattern`);
    }
  }

  // Evidence match
  if (context.evidence && context.evidence.length > 0) {
    const score = overlapScore(context.evidence, precedent.supportingEvidence);
    if (score > 0) {
      totalScore += score * weights.evidence;
      reasons.push(`Shared supporting evidence`);
    }
  }

  // Tags match
  if (context.tags && context.tags.length > 0) {
    const score = overlapScore(context.tags, precedent.tags);
    if (score > 0) {
      totalScore += score * weights.tags;
      reasons.push(`Matching tags`);
    }
  }

  // Project match
  if (context.project && precedent.relatedProjects.length > 0) {
    const match = precedent.relatedProjects.some((p) =>
      p.toLowerCase().includes(context.project!.toLowerCase()),
    );
    if (match) {
      totalScore += weights.project;
      reasons.push(`Related to project: ${context.project}`);
    }
  }

  // Question match (token overlap with title/summary/question)
  if (context.question) {
    const tokens = context.question.split(/\s+/).filter((t) => t.length > 2);
    if (tokens.length > 0) {
      const titleMatch = tokenMatch(precedent.title, tokens);
      const summaryMatch = precedent.summary
        ? tokenMatch(precedent.summary, tokens)
        : { score: 0, matched: [] };
      const questionMatch = precedent.engineeringQuestion
        ? tokenMatch(precedent.engineeringQuestion, tokens)
        : { score: 0, matched: [] };
      const bestToken = Math.max(titleMatch.score, summaryMatch.score, questionMatch.score);
      if (bestToken > 0) {
        totalScore += bestToken * weights.question;
        const allMatched = [
          ...new Set([...titleMatch.matched, ...summaryMatch.matched, ...questionMatch.matched]),
        ];
        reasons.push(`Matches question terms: "${allMatched.join(", ")}"`);
      }
    }
  }

  const maxPossibleScore = Object.values(weights).reduce((a, b) => a + b, 0);
  const normalizedScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;

  return {
    score: Math.round(normalizedScore * 100) / 100,
    reasons,
  };
}

export function matchPrecedents(
  precedents: Precedent[],
  context: PrecedentMatchContext,
  minScore: number = 0.01,
  limit: number = 20,
): MatchedPrecedent[] {
  const results: MatchedPrecedent[] = precedents
    .map((p) => {
      const { score, reasons } = computeSimilarity(p, context);
      return {
        precedent: p,
        similarityScore: score,
        whyRelevant: reasons.join("; ") || "General precedent match.",
        matchingFactors: reasons,
        matchReasons: reasons,
        id: p.id,
        title: p.title,
        summary: p.summary,
      };
    })
    .filter((p) => p.similarityScore >= minScore)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);

  return results;
}

export interface IndustryFailureMatch {
  id: string;
  componentType: string;
  material: string;
  failureMode: string;
  rootCause: string;
  invalidatedAssumption: string;
  provenCorrectiveAction: string;
  evidenceHashes: string[];
  programContext: string;
  occurredAt: string;
  score: number;
  reasons: string[];
}

export interface IndustryFailureQuery {
  componentType?: string;
  material?: string;
  failureMode?: string;
}

type RawIndustryFailureMatch = Omit<IndustryFailureMatch, "score" | "reasons">;

function categoryTokens(text?: string | null): string[] {
  return (text ?? "")
    .toLowerCase()
    .split(/[\s,&/()-]+/)
    .filter((t) => t.length > 2);
}

function categorySimilarity(a: string, b: string): number {
  const tokensA = categoryTokens(a);
  const tokensB = categoryTokens(b);
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const shared = tokensA.filter((t) => tokensB.includes(t));
  const jaccard = shared.length / Math.max(tokensA.length, tokensB.length);
  const containment =
    a.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(a.toLowerCase()) ? 0.6 : 0;
  return Math.max(jaccard, containment);
}

function seedIndustryMatches(
  context: IndustryFailureQuery,
  limit: number,
): IndustryFailureMatch[] {
  const records: RawIndustryFailureMatch[] = INDUSTRY_FAILURE_SEEDS.map((seed) => ({
    id: seed.id,
    componentType: seed.componentType,
    material: seed.material,
    failureMode: seed.failureMode,
    rootCause: seed.rootCause,
    invalidatedAssumption: seed.invalidatedAssumption,
    provenCorrectiveAction: seed.provenCorrectiveAction,
    evidenceHashes: seed.evidenceHashes,
    programContext: seed.programContext,
    occurredAt: seed.occurredAt,
  }));
  return scoreIndustryMatches(records, context, limit);
}

function scoreIndustryMatches(
  records: RawIndustryFailureMatch[],
  context: IndustryFailureQuery,
  limit: number,
): IndustryFailureMatch[] {
  const weights = { component: 0.45, material: 0.35, failureMode: 0.2 };
  return records
    .map((record) => {
      const reasons: string[] = [];
      let totalScore = 0;

      if (context.componentType) {
        const score = categorySimilarity(context.componentType, record.componentType);
        if (score > 0) {
          totalScore += score * weights.component;
          reasons.push(`Component overlap: ${context.componentType}`);
        }
      }
      if (context.material) {
        const score = categorySimilarity(context.material, record.material);
        if (score > 0) {
          totalScore += score * weights.material;
          reasons.push(`Material overlap: ${context.material}`);
        }
      }
      if (context.failureMode) {
        const score = categorySimilarity(context.failureMode, record.failureMode);
        if (score > 0) {
          totalScore += score * weights.failureMode;
          reasons.push(`Failure mode overlap: ${context.failureMode}`);
        }
      }

      return {
        ...record,
        score: Math.round(totalScore * 100) / 100,
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Queries real Industry Failure Graph records (PublicFailureRecord, AD, SDR,
 * NTSB) categorized by componentType, material, and failureMode, then scores
 * them against the provided context using the shared token-overlap matcher.
 * Falls back to the curated seed dataset when the database is unavailable.
 */
export async function queryIndustryFailureRecords(
  _organizationId: string,
  context: IndustryFailureQuery,
  limit: number = 10,
): Promise<IndustryFailureMatch[]> {
  try {
    const [publicRecords, airworthinessDirectives, serviceDifficultyReports, ntsbAccidents] =
      await Promise.all([
        queryModelMany("publicFailureRecord", { take: 100 }),
        queryModelMany("airworthinessDirective", { take: 100 }),
        queryModelMany("serviceDifficultyReport", { take: 100 }),
        queryModelMany("ntsbAccident", { take: 100 }),
      ]);

    const toMatch = (
      record: Record<string, unknown>,
      hashKey: string,
      fallbackMaterial: string,
    ): RawIndustryFailureMatch => ({
      id: String(record.id),
      componentType: String(record.componentType || "Unknown Component"),
      material: String(record.material || fallbackMaterial),
      failureMode: String(record.failureMode || "Unknown Failure Mode"),
      rootCause: String(record.rootCause || record.summary || ""),
      invalidatedAssumption: String(
        record.invalidatedAssumption || "Design envelope assumption invalidated by field evidence.",
      ),
      provenCorrectiveAction: String(
        record.correctiveAction || "Apply root-cause corrective action and verify by test.",
      ),
      evidenceHashes: Array.isArray(record.evidenceHashes)
        ? record.evidenceHashes.map((h) => String(h))
        : [hashKey],
      programContext: String(record.programContext || "Industry Failure Graph"),
      occurredAt: new Date(
        Number(record.occurredAt || record.issuedAt || record.reportedAt || record.accidentDate) || Date.now(),
      ).toISOString(),
    });

    const records: RawIndustryFailureMatch[] = [
      ...publicRecords.map((r) => toMatch(r as any, `pub:${(r as any).id}`, "Unspecified")),
      ...airworthinessDirectives.map((r) => toMatch(r as any, `ad:${(r as any).adNumber}`, "Unspecified")),
      ...serviceDifficultyReports.map((r) => toMatch(r as any, `sdr:${(r as any).sdrNumber}`, "Unspecified")),
      ...ntsbAccidents.map((r) => toMatch(r as any, `ntsb:${(r as any).accidentNumber}`, "Unspecified")),
    ];

    if (records.length === 0) {
      return seedIndustryMatches(context, limit);
    }

    const scored = scoreIndustryMatches(records, context, limit);
    return scored.length > 0 ? scored : seedIndustryMatches(context, limit);
  } catch (err) {
    console.warn("[SimilarityEngine] DB offline fallback execution:", err);
    return seedIndustryMatches(context, limit);
  }
}
