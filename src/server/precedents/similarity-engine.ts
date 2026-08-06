import { Precedent, PrecedentMatchContext, MatchedPrecedent } from "@/features/precedents/types";

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
