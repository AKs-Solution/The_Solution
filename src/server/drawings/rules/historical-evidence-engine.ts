/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/server/db";
import { DrawingMetadata, ExtractedCallout } from "./types";

export interface HistoricalEvidenceResult {
  historicalRiskScore: number; // 0 to 100
  historicalConfidence: number; // 0.0 to 1.0
  matchedPrecedentsCount: number;
  averageScrapRatePct: number;
  totalHistoricalNCRs: number;
  summary: string;
  precedentMatches: Array<{
    title: string;
    decisionMade: string;
    outcome: string;
    confidence: number;
    similarityScore: number;
  }>;
}

export async function queryHistoricalEvidence(
  organizationId: string | undefined,
  metadata: DrawingMetadata,
  callouts: ExtractedCallout[],
): Promise<HistoricalEvidenceResult> {
  try {
    const precedents = organizationId
      ? await prisma.historicalPrecedent.findMany({
          where: { organizationId },
          take: 20,
        })
      : [];

    if (precedents.length > 0) {
      const matched = precedents.filter((p) => {
        const lowerTitle = p.title.toLowerCase();
        const lowerSummary = p.summary.toLowerCase();
        const matMatch =
          lowerTitle.includes(metadata.materialFamily.toLowerCase()) ||
          lowerSummary.includes(metadata.material.toLowerCase());
        const partMatch = lowerTitle.includes(metadata.partNumber.toLowerCase());
        return matMatch || partMatch;
      });

      if (matched.length > 0) {
        const totalNCRs = matched.reduce((acc, p) => {
          const metrics = (p as any).qualityMetrics as { totalNCRs?: number } | null;
          return acc + (metrics?.totalNCRs || 1);
        }, 0);
        const avgScrap =
          matched.reduce((acc, p) => {
            const metrics = (p as any).qualityMetrics as { averageScrapRate?: number } | null;
            return acc + (metrics?.averageScrapRate || 4.5);
          }, 0) / matched.length;

        const histRisk = Math.min(100, Math.round(avgScrap * 8 + totalNCRs * 5));
        const histConf = Math.min(0.95, 0.4 + matched.length * 0.15);

        return {
          historicalRiskScore: histRisk,
          historicalConfidence: histConf,
          matchedPrecedentsCount: matched.length,
          averageScrapRatePct: parseFloat(avgScrap.toFixed(1)),
          totalHistoricalNCRs: totalNCRs,
          summary: `Matched ${matched.length} historical production precedent(s) for ${metadata.materialFamily} components. Historical average scrap rate: ${avgScrap.toFixed(1)}%, total NCRs: ${totalNCRs}.`,
          precedentMatches: matched.slice(0, 3).map((m) => ({
            title: m.title,
            decisionMade: m.decisionMade,
            outcome: m.outcome,
            confidence: m.confidence,
            similarityScore: 85,
          })),
        };
      }
    }
  } catch (err) {
    console.warn("Historical DB query fallback:", err);
  }

  const hasTightCallouts = callouts.some(
    (c) =>
      (c.characteristic === "FLATNESS" && c.numericValue <= 0.05) ||
      (c.characteristic === "POSITION" && c.numericValue <= 0.08) ||
      c.characteristic === "HOLE_FIT",
  );

  const baselineRisk = hasTightCallouts ? 35 : 15;
  const baselineConf = 0.35;

  return {
    historicalRiskScore: baselineRisk,
    historicalConfidence: baselineConf,
    matchedPrecedentsCount: 0,
    averageScrapRatePct: hasTightCallouts ? 6.2 : 2.1,
    totalHistoricalNCRs: 0,
    summary:
      "No direct historical manufacturing evidence available for this specific part revision in the registry. Engineering heuristic baselines applied.",
    precedentMatches: [],
  };
}
