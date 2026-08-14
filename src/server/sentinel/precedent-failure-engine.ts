import { createHash } from "crypto";
import { prisma } from "@/server/db";
import {
  INDUSTRY_FAILURE_SEEDS,
  IndustryFailureSeed,
} from "@/server/precedents/seed-industry-graph";

export interface HistoricalFailurePrecedent {
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
}

function sha256(...parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

function seedToPrecedent(seed: IndustryFailureSeed): HistoricalFailurePrecedent {
  return {
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
  };
}

function filterPrecedents(
  precedents: HistoricalFailurePrecedent[],
  searchQuery?: string,
): HistoricalFailurePrecedent[] {
  if (!searchQuery) return precedents;
  const q = searchQuery.toLowerCase();
  return precedents.filter(
    (p) =>
      p.componentType.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.failureMode.toLowerCase().includes(q) ||
      p.rootCause.toLowerCase().includes(q),
  );
}

function fallbackPrecedents(searchQuery?: string) {
  const precedents = INDUSTRY_FAILURE_SEEDS.map(seedToPrecedent);
  return filterPrecedents(precedents, searchQuery);
}

/**
 * Deterministic Precedent Failure Prediction Engine
 *
 * Queries the Industry Failure Graph (PublicFailureRecord, AirworthinessDirective,
 * ServiceDifficultyReport, NTSBAccident) categorized by componentType, material,
 * and failureMode, merged with organization-scoped quality events. Falls back to
 * the curated seed dataset when the database is unavailable.
 */
export async function queryFailurePrecedents(
  organizationId: string,
  searchQuery?: string,
): Promise<{
  precedents: HistoricalFailurePrecedent[];
  totalMatches: number;
}> {
  try {
    const [
      publicRecords,
      airworthinessDirectives,
      serviceDifficultyReports,
      ntsbAccidents,
      qualityEvents,
    ] = await Promise.all([
      prisma.publicFailureRecord.findMany({ take: 50 }).catch(() => []),
      prisma.airworthinessDirective.findMany({ take: 50 }).catch(() => []),
      prisma.serviceDifficultyReport.findMany({ take: 50 }).catch(() => []),
      prisma.nTSBAccident.findMany({ take: 50 }).catch(() => []),
      prisma.qualityEvent.findMany({ where: { organizationId }, take: 20 }).catch(() => []),
    ]);

    const precedents: HistoricalFailurePrecedent[] = [];

    for (const r of publicRecords) {
      const hashes: string[] = Array.isArray(r.evidenceHashes)
        ? r.evidenceHashes.map((h: unknown) => String(h))
        : [sha256(r.recordNumber || r.id)];
      precedents.push({
        id: r.id,
        componentType: r.componentType,
        material: r.material,
        failureMode: r.failureMode,
        rootCause: r.rootCause,
        invalidatedAssumption:
          r.invalidatedAssumption || "Design envelope assumption invalidated by field evidence.",
        provenCorrectiveAction:
          r.provenCorrectiveAction || "Apply root-cause corrective action and verify by test.",
        evidenceHashes: hashes,
        programContext: r.programContext || "Industry Failure Graph",
        occurredAt: new Date(r.occurredAt || r.createdAt || Date.now()).toISOString(),
      });
    }

    for (const a of airworthinessDirectives) {
      const hashes = [sha256(a.adNumber)];
      precedents.push({
        id: a.id,
        componentType: a.componentType,
        material: a.material || "Unspecified",
        failureMode: a.failureMode || "Airworthiness Compliance Finding",
        rootCause: a.summary,
        invalidatedAssumption:
          "Assumed design envelope invalidated by mandatory airworthiness finding.",
        provenCorrectiveAction: a.correctiveAction || "Comply with airworthiness directive.",
        evidenceHashes: hashes,
        programContext: `FAA Airworthiness Directive ${a.adNumber}`,
        occurredAt: new Date(a.issuedAt || Date.now()).toISOString(),
      });
    }

    for (const s of serviceDifficultyReports) {
      const hashes = [sha256(s.sdrNumber)];
      precedents.push({
        id: s.id,
        componentType: s.componentType,
        material: s.material || "Unspecified",
        failureMode: s.failureMode,
        rootCause: s.rootCause || s.summary,
        invalidatedAssumption: "Service difficulty invalidates assumed operational robustness.",
        provenCorrectiveAction:
          s.correctiveAction || "Implement service bulletin corrective action.",
        evidenceHashes: hashes,
        programContext: `FAA Service Difficulty Report ${s.sdrNumber}`,
        occurredAt: new Date(s.reportedAt || Date.now()).toISOString(),
      });
    }

    for (const n of ntsbAccidents) {
      const hashes = [sha256(n.accidentNumber)];
      precedents.push({
        id: n.id,
        componentType: n.componentType,
        material: n.material || "Unspecified",
        failureMode: n.failureMode,
        rootCause: n.probableCause || n.summary,
        invalidatedAssumption: "Probable-cause analysis invalidates prior design assumption.",
        provenCorrectiveAction: n.correctiveAction || "Adopt NTSB safety recommendation.",
        evidenceHashes: hashes,
        programContext: `NTSB Accident ${n.accidentNumber}`,
        occurredAt: new Date(n.accidentDate || Date.now()).toISOString(),
      });
    }

    const entityIds = [...new Set(qualityEvents.map((qe) => qe.entityId).filter(Boolean))];
    const entities = entityIds.length
      ? await prisma.engineeringEntity
          .findMany({ where: { id: { in: entityIds } } })
          .catch(() => [])
      : [];
    const entityById = new Map(entities.map((e) => [e.id, e]));

    for (const qe of qualityEvents) {
      const entity = entityById.get(qe.entityId);
      const metadata = (entity?.metadata ?? {}) as Record<string, unknown>;
      precedents.push({
        id: qe.id,
        componentType: entity?.name || "Field Component",
        material: typeof metadata.material === "string" ? metadata.material : "Unspecified",
        failureMode: qe.eventType || "Quality Anomaly",
        rootCause: qe.rootCause || qe.description,
        invalidatedAssumption:
          "Operational envelope assumption invalidated by field quality event.",
        provenCorrectiveAction:
          qe.correctiveAction || "Root-cause corrective action implemented and verified.",
        evidenceHashes: [sha256(qe.id)],
        programContext: "Organization Field Quality Event",
        occurredAt: new Date(qe.recordedAt || qe.createdAt || Date.now()).toISOString(),
      });
    }

    if (precedents.length === 0) {
      precedents.push(...INDUSTRY_FAILURE_SEEDS.map(seedToPrecedent));
    }

    const filtered = filterPrecedents(precedents, searchQuery);
    return { precedents: filtered, totalMatches: filtered.length };
  } catch (err) {
    console.warn("[PrecedentFailureEngine] DB offline fallback execution:", err);
    const precedents = fallbackPrecedents(searchQuery);
    return { precedents, totalMatches: precedents.length };
  }
}
