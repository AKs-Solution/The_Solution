/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
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
  _callouts: ExtractedCallout[],
): Promise<HistoricalEvidenceResult> {
  try {
    const precedents = organizationId
      ? ((await (prisma as any).historicalPrecedent
          ?.findMany({
            where: { organizationId },
            take: 20,
          })
          .catch(() => [])) ?? [])
      : [];

    if (precedents.length > 0) {
      const matched = precedents.filter((p: any) => {
        const lowerTitle = (p.title || "").toLowerCase();
        const lowerSummary = (p.summary || "").toLowerCase();
        const matMatch =
          lowerTitle.includes((metadata.materialFamily || "").toLowerCase()) ||
          lowerSummary.includes((metadata.material || "").toLowerCase());
        const partMatch = lowerTitle.includes((metadata.partNumber || "").toLowerCase());
        return matMatch || partMatch;
      });

      if (matched.length > 0) {
        const totalNCRs = matched.reduce((acc: number, p: any) => {
          const metrics = (p as any).qualityMetrics as { totalNCRs?: number } | null;
          return acc + (typeof metrics?.totalNCRs === "number" ? metrics.totalNCRs : 0);
        }, 0);
        const scrapValues = matched
          .map((p: any) => {
            const metrics = (p as any).qualityMetrics as { averageScrapRate?: number } | null;
            return typeof metrics?.averageScrapRate === "number" ? metrics.averageScrapRate : null;
          })
          .filter((v: number | null): v is number => v !== null);
        const avgScrap =
          scrapValues.length > 0
            ? scrapValues.reduce((acc: number, v: number) => acc + v, 0) / scrapValues.length
            : 0;

        const histRisk = Math.min(100, Math.round(avgScrap * 8 + totalNCRs * 5));
        const histConf = Math.min(0.95, 0.4 + matched.length * 0.15);

        return {
          historicalRiskScore: histRisk,
          historicalConfidence: histConf,
          matchedPrecedentsCount: matched.length,
          averageScrapRatePct: parseFloat(avgScrap.toFixed(2)),
          totalHistoricalNCRs: totalNCRs,
          summary: `Matched ${matched.length} historical engineering precedents for ${metadata.materialFamily || metadata.material || "this drawing"}.`,
          precedentMatches: matched.map((m: any) => ({
            title: m.title || "Untitled precedent",
            decisionMade: m.decisionMade || "",
            outcome: m.outcome || "",
            confidence: typeof m.confidence === "number" ? m.confidence : 0,
            similarityScore: typeof m.similarityScore === "number" ? m.similarityScore : 0,
          })),
        };
      }
    }

    return {
      historicalRiskScore: 0,
      historicalConfidence: 0,
      matchedPrecedentsCount: 0,
      averageScrapRatePct: 0,
      totalHistoricalNCRs: 0,
      summary: "No historical precedents in this workspace yet.",
      precedentMatches: [],
    };
  } catch (err) {
    console.warn("Error querying historical evidence:", err);
    return {
      historicalRiskScore: 0,
      historicalConfidence: 0,
      matchedPrecedentsCount: 0,
      averageScrapRatePct: 0,
      totalHistoricalNCRs: 0,
      summary: "Historical evidence is unavailable.",
      precedentMatches: [],
    };
  }
}
