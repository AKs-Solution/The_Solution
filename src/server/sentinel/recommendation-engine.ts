import { prisma } from "@/server/db";

export interface EngineeringRecommendation {
  id: string;
  category:
    "REUSABLE_PRECEDENT" | "RECOMMENDED_SUPPLIER" | "MANUFACTURING_FIT" | "SIMULATION_BENCHMARK";
  title: string;
  recommendationText: string;
  evidenceHashes: string[];
  confidenceScore: number;
  expectedBenefit: string;
}

/**
 * Deterministic Engineering Recommendation Engine
 */
export async function getEngineeringRecommendations(
  organizationId: string,
): Promise<EngineeringRecommendation[]> {
  try {
    const designPatterns = await prisma.drawingDesignPattern
      .findMany({
        where: { organizationId },
        take: 10,
      })
      .catch(() => []);

    return designPatterns.map((dp) => ({
      id: dp.id,
      category: "REUSABLE_PRECEDENT",
      title: `${dp.partType} Reusable Geometry Pattern`,
      recommendationText: dp.lessonsLearned,
      evidenceHashes: [],
      confidenceScore: dp.rating / 5.0,
      expectedBenefit: "Reduces CAD drafting effort and eliminates known failure-mode risk.",
    }));
  } catch (err) {
    console.warn("[RecommendationEngine] DB query error:", err);
    return [];
  }
}
