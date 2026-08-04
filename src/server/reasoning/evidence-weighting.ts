import { EvidenceInput, EvidenceWeightResult } from "./types";

export interface WeightingConfig {
  verificationWeight: number;
  qualityWeight: number;
  recencyWeight: number;
  relevanceWeight: number;
  repeatabilityWeight: number;
  historicalAccuracyWeight: number;
  confirmationMultiplier: number;
  conflictPenalty: number;
}

export const DEFAULT_WEIGHTING_CONFIG: WeightingConfig = {
  verificationWeight: 0.2,
  qualityWeight: 0.2,
  recencyWeight: 0.1,
  relevanceWeight: 0.2,
  repeatabilityWeight: 0.1,
  historicalAccuracyWeight: 0.2,
  confirmationMultiplier: 1.15,
  conflictPenalty: 0.3,
};

/**
 * Calculates transparent, multi-factor weight for a single piece of evidence.
 */
export function calculateEvidenceWeight(
  evidence: EvidenceInput,
  config: WeightingConfig = DEFAULT_WEIGHTING_CONFIG,
): EvidenceWeightResult {
  const verificationLevel = evidence.verificationLevel ?? 0.7;
  const sourceQuality = evidence.sourceQuality ?? 0.75;
  const relevanceScore = evidence.relevanceScore ?? 0.8;
  const repeatabilityScore = evidence.repeatabilityScore ?? 0.7;
  const historicalAccuracy = evidence.historicalAccuracy ?? 0.8;
  const independentConfirmation = evidence.independentConfirmation ? 1.0 : 0.0;

  // Recency score calculation (if recencyDate provided, calculate decay; default 0.85)
  let recencyScore = 0.85;
  if (evidence.recencyDate) {
    const ageYears =
      (Date.now() - new Date(evidence.recencyDate).getTime()) / (365.25 * 24 * 3600 * 1000);
    recencyScore = Math.max(0.2, Math.min(1.0, 1.0 - 0.05 * Math.max(0, ageYears)));
  }

  const conflictingScore = evidence.hasConflict ? config.conflictPenalty : 0.0;

  // Base weighted linear combination
  const baseWeight =
    verificationLevel * config.verificationWeight +
    sourceQuality * config.qualityWeight +
    recencyScore * config.recencyWeight +
    relevanceScore * config.relevanceWeight +
    repeatabilityScore * config.repeatabilityWeight +
    historicalAccuracy * config.historicalAccuracyWeight;

  // Apply independent confirmation bonus
  let adjustedWeight = evidence.independentConfirmation
    ? baseWeight * config.confirmationMultiplier
    : baseWeight;

  // Apply conflict penalty
  if (evidence.hasConflict) {
    adjustedWeight = adjustedWeight * (1.0 - config.conflictPenalty);
  }

  const finalWeight = Number(Math.max(0.0, Math.min(1.0, adjustedWeight)).toFixed(4));
  const engineeringConfidence = Number((baseWeight * relevanceScore).toFixed(4));

  // Construct transparent explanation
  const explanationParts: string[] = [];
  explanationParts.push(`Verification level: ${Math.round(verificationLevel * 100)}%`);
  explanationParts.push(`Source quality rating: ${Math.round(sourceQuality * 100)}%`);
  explanationParts.push(`Recency score: ${Math.round(recencyScore * 100)}%`);
  explanationParts.push(`Relevance score: ${Math.round(relevanceScore * 100)}%`);
  explanationParts.push(`Repeatability: ${Math.round(repeatabilityScore * 100)}%`);
  explanationParts.push(`Historical accuracy: ${Math.round(historicalAccuracy * 100)}%`);

  if (evidence.independentConfirmation) {
    explanationParts.push(
      `Applied +${Math.round((config.confirmationMultiplier - 1) * 100)}% independent confirmation boost`,
    );
  }
  if (evidence.hasConflict) {
    explanationParts.push(
      `Applied -${Math.round(config.conflictPenalty * 100)}% penalty due to detected conflicting evidence`,
    );
  }

  const weightExplanation = `Evidence '${evidence.title}' assigned weight ${finalWeight} (${explanationParts.join(", ")}).`;

  return {
    evidenceId: evidence.id,
    evidenceType: evidence.type,
    title: evidence.title,
    verificationLevel,
    sourceQuality,
    recencyScore,
    relevanceScore,
    repeatabilityScore,
    independentConfirmation,
    engineeringConfidence,
    historicalAccuracy,
    conflictingScore,
    finalWeight,
    weightExplanation,
  };
}

/**
 * Weights an array of evidence items and returns total engineering support metrics.
 */
export function weightEvidenceCollection(
  evidenceList: EvidenceInput[],
  config: WeightingConfig = DEFAULT_WEIGHTING_CONFIG,
): {
  weights: EvidenceWeightResult[];
  aggregateWeight: number;
  averageConfidence: number;
  conflictCount: number;
  highQualityEvidenceCount: number;
} {
  if (!evidenceList || evidenceList.length === 0) {
    return {
      weights: [],
      aggregateWeight: 0,
      averageConfidence: 0,
      conflictCount: 0,
      highQualityEvidenceCount: 0,
    };
  }

  const weights = evidenceList.map((e) => calculateEvidenceWeight(e, config));
  const sumWeight = weights.reduce((acc, w) => acc + w.finalWeight, 0);
  const aggregateWeight = Number((sumWeight / weights.length).toFixed(4));
  const averageConfidence = Number(
    (weights.reduce((acc, w) => acc + w.engineeringConfidence, 0) / weights.length).toFixed(4),
  );
  const conflictCount = weights.filter((w) => w.conflictingScore > 0).length;
  const highQualityEvidenceCount = weights.filter((w) => w.finalWeight >= 0.7).length;

  return {
    weights,
    aggregateWeight,
    averageConfidence,
    conflictCount,
    highQualityEvidenceCount,
  };
}
