/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  FileText,
  Download,
  Check,
  History,
  FileCheck2,
  UserCheck,
  ChevronRight,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { PageContainer, Panel, Stack } from "@/components/layout";
import { Input, Button, Badge, Card, CardContent, Divider } from "@/components/ui";
import { cn } from "@/shared/utils";
import { EngineeringPrecedent } from "@/features/precedents/types";

// --- Types & Interfaces ---

interface EntityOption {
  id: string;
  name: string;
  identifier: string;
  entityType: string;
}

interface EvidenceNode {
  id: string;
  type: string;
  label: string;
  entityId?: string;
  entityType?: string;
  status?: string;
  version?: string;
  documentId?: string;
  documentName?: string;
  documentVersion?: number;
  page?: number;
  section?: string;
  extractionMethod?: string;
  createdAt: string;
  updatedAt: string;
}

interface Conflict {
  id: string;
  type: string;
  label: string;
  description: string;
  severity: string;
  detectedAt: string;
}

interface MissingEvidence {
  id: string;
  type: string;
  label: string;
  description: string;
  severity: string;
}

interface EvidenceChainLink {
  nodeId: string;
  node: EvidenceNode;
  relationType: string;
  depth: number;
}

interface EvidenceChain {
  rootId: string;
  links: EvidenceChainLink[];
  totalDepth: number;
}

interface TraceabilityRecord {
  entityId: string;
  entityName: string;
  entityType: string;
  entityIdentifier: string;
  entityVersion: string;
  entityStatus: string;
  documentId?: string;
  documentName?: string;
  documentVersion?: number;
  page?: number;
  section?: string;
  relationshipPath: string[];
  extractionMethod?: string;
  timestamp: string;
}

interface QualityIndicators {
  totalNodes: number;
  supportingNodes: number;
  conflictingNodes: number;
  missingNodes: number;
  hasDocumentProvenance: boolean;
  hasVersionInfo: boolean;
  hasPageReferences: boolean;
  hasExtractionSource: boolean;
  quality: string;
}

interface EvidenceSummary {
  totalEvidence: number;
  supportingEvidence: number;
  conflictingEvidence: number;
  missingEvidence: number;
  uniqueDocuments: number;
  uniqueEntities: number;
  oldestEvidence: string | null;
  newestEvidence: string | null;
}

interface ResolutionResult {
  status: string;
  subjectId: string;
  subjectLabel: string;
  supportingEvidence: EvidenceNode[];
  conflictingEvidence: EvidenceNode[];
  missingEvidence: MissingEvidence[];
  evidenceChains: EvidenceChain[];
  traceabilityGraph: { rootEntityId: string; records: TraceabilityRecord[]; totalRecords: number };
  conflicts: Conflict[];
  qualityIndicators: QualityIndicators;
  summary: EvidenceSummary;
  resolvedAt: string;
}

// --- Presets Map for Questions ---

const PRESETS = [
  {
    question: "Can Supplier X be used on Project Alpha?",
    targetQuery: "Supplier X",
    precedent: {
      project: "Project Alpha - Phase I (2024)",
      problem: "Fastener failure under high cyclic vibration load due to fatigue.",
      decision:
        "Mandated ASTM A325 structural grade fasteners, transitioning from unqualified local suppliers to Supplier X.",
      outcome:
        "Passed verification tests with zero fatigue cracking during subsequent 18-month run.",
      lessonsLearned:
        "Supplier certifications must be anchored and locked before detailing structural steel components.",
      similarity:
        "Both involve cyclic vibration load requirements for high-strength steel fasteners.",
    },
  },
  {
    question: "What evidence supports Requirement 4.2?",
    targetQuery: "Requirement 4.2",
    precedent: {
      project: "Deepwater Compliance Audit (2025)",
      problem:
        "Pipeline weld traceability logs rejected by independent auditors for lacking document page references.",
      decision:
        "Enforced structural inspection logs with explicit PDF page-level provenance fields.",
      outcome: "Auditors approved weld integrity certifications within 7 days of resubmission.",
      lessonsLearned:
        "All safety-critical load limit claims must trace directly back to verified mill certifications.",
      similarity: "Both require page-level verification of tensile stress inspection logs.",
    },
  },
  {
    question: "What changed since Revision C?",
    targetQuery: "Revision C",
    precedent: {
      project: "Turbine Housing Drawing Update (2025)",
      problem:
        "Flange diameter mismatch caused assembly alignment failure on the manufacturing floor.",
      decision:
        "Instituted a delta check step to reconcile physical mating relationships before releasing new revisions.",
      outcome:
        "Zero fitment or mismatch issues reported on the assembly line for Revision D and beyond.",
      lessonsLearned:
        "Drawings should never be updated in isolation; verify all mating relationships before check-in.",
      similarity: "Checks for delta modifications of mechanical interfaces between revisions.",
    },
  },
  {
    question: "Has this failure happened before?",
    targetQuery: "Failure",
    precedent: {
      project: "Seawater Intake Impeller cracking (2024)",
      problem:
        "Brittle fracture risks in corrosive environments must be verified against cavitation limit curves.",
      decision: "Upgraded material specification from grade 316 stainless steel to Duplex 2507.",
      outcome: "Intake pumps have run continuously for 24 months without crack indications.",
      lessonsLearned:
        "Brittle fracture risks in corrosive environments must be verified against cavitation limit curves.",
      similarity: "Impeller blade fracture matching cyclic flow cavitation patterns.",
    },
  },
  {
    question: "Which documents justify this design decision?",
    targetQuery: "Design Decision",
    precedent: {
      project: "Subsea Manifold Structural Assessment (2024)",
      problem:
        "Design certificate delayed because stress calculations lacked linked finite element analysis logs.",
      decision:
        "Aggregated all finite element run files and mapped them to compliance requirements.",
      outcome: "Obtained classification society approval without further engineering queries.",
      lessonsLearned:
        "Keep calculations linked directly to experimental stress logs to satisfy external audit review.",
      similarity: "Both require linking stress calculations directly to raw sensor logs.",
    },
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "border-red-200 bg-red-50 text-red-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  LOW: "border-blue-200 bg-blue-50 text-blue-700",
};

export default function WorkspacePage() {
  const [question, setQuestion] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [entityResults, setEntityResults] = useState<EntityOption[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityOption | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [resolution, setResolution] = useState<ResolutionResult | null>(null);
  const [matchedPrecedents, setMatchedPrecedents] = useState<EngineeringPrecedent[]>([]);
  const [fabricInsights, setFabricInsights] = useState<any[]>([]);
  const [selectedPrecedent, setSelectedPrecedent] = useState<EngineeringPrecedent | null>(null);
  const [isPrecedentModalOpen, setIsPrecedentModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);

  // Decision state tracking
  const [decisions, setDecisions] = useState<any[]>([]);
  const [activeDecision, setActiveDecision] = useState<any | null>(null);
  const [finalDecisionText, setFinalDecisionText] = useState("");
  const [rationaleText, setRationaleText] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeSuccess, setFinalizeSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const fetchRecentDecisions = useCallback(async () => {
    try {
      const res = await fetch("/api/decisions");
      if (res.ok) {
        const json = await res.json();
        setDecisions(json.data ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch decisions", err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRecentDecisions();
  }, [fetchRecentDecisions]);

  // Run target compliance evaluation
  const evaluateTarget = useCallback(
    async (entity: EntityOption, currentDecision?: any) => {
      setSelectedEntity(entity);
      setIsEvaluating(true);
      setError("");
      setResolution(null);
      setValidationError("");

      const dec = currentDecision || activeDecision;

      try {
        const res = await fetch("/api/evidence/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entityId: entity.id, maxDepth: 5 }),
        });
        if (!res.ok) {
          const err = await res.json();
          setError(err.error ?? "Verification failed");
          return;
        }
        const json = await res.json();
        setResolution(json.data);

        // Fetch matched precedents by similarity
        let activePrecedents: EngineeringPrecedent[] = [];
        try {
          const simRes = await fetch("/api/precedents/similarity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: dec?.question || question,
              componentName: entity.name,
              suppliers: [entity.name],
              requirements:
                json.data.missingEvidence
                  ?.filter((m: any) => m.type === "REQUIREMENT")
                  ?.map((m: any) => m.label) || [],
              standards:
                json.data.supportingEvidence
                  ?.filter(
                    (e: any) =>
                      e.type === "STANDARD" ||
                      e.label?.toLowerCase().includes("std") ||
                      e.label?.toLowerCase().includes("ieee") ||
                      e.label?.toLowerCase().includes("iso"),
                  )
                  ?.map((e: any) => e.label) || [],
              documents:
                json.data.supportingEvidence
                  ?.filter((e: any) => e.documentName)
                  ?.map((e: any) => e.documentName) || [],
              contradictions: json.data.conflicts?.map((c: any) => c.label) || [],
              missingEvidence: json.data.missingEvidence?.map((m: any) => m.label) || [],
            }),
          });
          if (simRes.ok) {
            const simJson = await simRes.json();
            activePrecedents = simJson.data || [];
            setMatchedPrecedents(activePrecedents);
          }
        } catch (err) {
          console.error("Failed to load historical precedents", err);
        }

        // Fetch federated industry insights
        try {
          let contextKey = "titanium-5axis";
          if (
            entity.name.toLowerCase().includes("chamber") ||
            entity.name.toLowerCase().includes("thrust")
          ) {
            contextKey = "chamber-liner-heat";
          } else if (
            entity.name.toLowerCase().includes("inconel") ||
            entity.name.toLowerCase().includes("nozzle")
          ) {
            contextKey = "inconel-wall-thickness";
          }
          const fabRes = await fetch(
            `/api/federated/insights?contextKey=${encodeURIComponent(contextKey)}`,
          );
          if (fabRes.ok) {
            const fabJson = await fabRes.json();
            setFabricInsights(fabJson.data || []);
          }
        } catch (err) {
          console.error("Failed to load federated insights", err);
        }

        // If active decision exists, patch evidence and transition status to EVIDENCE_REVIEW
        if (dec) {
          const updateRes = await fetch(`/api/decisions/${dec.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "EVIDENCE_REVIEW",
              subjectEntityId: entity.id,
              supportingEvidence: json.data.supportingEvidence,
              contradictions: json.data.conflicts,
              unresolvedGaps: json.data.missingEvidence,
              precedents: activePrecedents.slice(0, 3),
            }),
          });
          if (updateRes.ok) {
            const updateJson = await updateRes.json();
            setActiveDecision(updateJson.data);
            fetchRecentDecisions();
          }
        }
      } catch {
        setError("An error occurred during target compliance evaluation.");
      } finally {
        setIsEvaluating(false);
      }
    },
    [activeDecision, fetchRecentDecisions, question],
  );

  // Search entities based on question terms
  const searchTargets = useCallback(
    async (queryText: string) => {
      if (!queryText.trim()) return;
      setIsSearching(true);
      setSelectedEntity(null);
      setResolution(null);
      setMatchedPrecedents([]);
      setFabricInsights([]);
      setError("");
      setValidationError("");
      setFinalDecisionText("");
      setRationaleText("");

      try {
        // Find matching preset for precedents
        const matchedPreset = PRESETS.find((p) =>
          queryText.toLowerCase().includes(p.targetQuery.toLowerCase()),
        );
        const searchTerms = matchedPreset ? matchedPreset.targetQuery : queryText;

        // Fetch matched precedents based on search query
        try {
          const simRes = await fetch(
            `/api/precedents/similarity?question=${encodeURIComponent(queryText)}&componentName=${encodeURIComponent(searchTerms)}`,
          );
          if (simRes.ok) {
            const simJson = await simRes.json();
            const similarityPrecs = simJson.data || [];
            setMatchedPrecedents(similarityPrecs);
          }
        } catch (err) {
          console.error("Failed to load similarity precedents", err);
        }

        // Start a new decision workflow in the DB
        const decisionRes = await fetch("/api/decisions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: queryText }),
        });
        let decisionData = null;
        if (decisionRes.ok) {
          const decisionJson = await decisionRes.json();
          decisionData = decisionJson.data;
          setActiveDecision(decisionData);
          fetchRecentDecisions();
        }

        // Search for entities matching the terms
        const res = await fetch(
          `/api/engineering/entities?search=${encodeURIComponent(searchTerms)}&pageSize=10`,
        );
        if (res.ok) {
          const json = await res.json();
          setEntityResults(json.data ?? []);

          // Auto-select first matching entity if available
          if (json.data && json.data.length > 0) {
            await evaluateTarget(json.data[0], decisionData);
          } else {
            // If no entities found, fallback search to a generic query to get some items
            const fallbackRes = await fetch(`/api/engineering/entities?pageSize=5`);
            if (fallbackRes.ok) {
              const fallbackJson = await fallbackRes.json();
              setEntityResults(fallbackJson.data ?? []);
              if (fallbackJson.data && fallbackJson.data.length > 0) {
                await evaluateTarget(fallbackJson.data[0], decisionData);
              } else {
                setError(
                  "No target elements found in the database. Please add engineering entities first.",
                );
                setActiveDecision(null);
              }
            } else {
              setError("Failed to fetch fallback target elements.");
              setActiveDecision(null);
            }
          }
        } else {
          setError("Failed to query engineering entities.");
          setActiveDecision(null);
        }
      } catch (err) {
        console.error("Target resolution error:", err);
        setError("Failed to resolve target elements related to the query.");
        setActiveDecision(null);
      } finally {
        setIsSearching(false);
      }
    },
    [evaluateTarget, fetchRecentDecisions],
  );

  const handlePresetClick = (presetText: string) => {
    setQuestion(presetText);
    searchTargets(presetText);
  };

  const handleSelectDecision = useCallback(
    async (dec: any) => {
      setActiveDecision(dec);
      setQuestion(dec.question);
      setEntityResults([]);
      setSelectedEntity(null);
      setResolution(null);
      setMatchedPrecedents([]);
      setFabricInsights([]);
      setFinalDecisionText(dec.finalDecision || "");
      setRationaleText(dec.rationale || "");
      setValidationError("");

      if (dec.status === "FINALIZED") {
        // Create mockup resolution structure from DB saved data
        setResolution({
          status: "FINALIZED",
          subjectId: dec.subjectEntityId || "unknown",
          subjectLabel: dec.subjectEntityId ? "Resolved Component" : "General Question",
          supportingEvidence: dec.supportingEvidence || [],
          conflictingEvidence: [],
          missingEvidence: dec.unresolvedGaps || [],
          evidenceChains: [],
          traceabilityGraph: {
            rootEntityId: dec.subjectEntityId || "",
            records: [],
            totalRecords: 0,
          },
          conflicts: dec.contradictions || [],
          qualityIndicators: {
            totalNodes: (dec.supportingEvidence?.length ?? 0) + (dec.contradictions?.length ?? 0),
            supportingNodes: dec.supportingEvidence?.length ?? 0,
            conflictingNodes: dec.contradictions?.length ?? 0,
            missingNodes: dec.unresolvedGaps?.length ?? 0,
            hasDocumentProvenance: true,
            hasVersionInfo: true,
            hasPageReferences: true,
            hasExtractionSource: true,
            quality: (dec.contradictions?.length ?? 0) > 0 ? "COMPROMISED" : "STRONG",
          },
          summary: {
            totalEvidence: dec.supportingEvidence?.length ?? 0,
            supportingEvidence: dec.supportingEvidence?.length ?? 0,
            conflictingEvidence: dec.contradictions?.length ?? 0,
            missingEvidence: dec.unresolvedGaps?.length ?? 0,
            uniqueDocuments: 0,
            uniqueEntities: 0,
            oldestEvidence: null,
            newestEvidence: null,
          },
          resolvedAt: dec.finalizedAt || dec.updatedAt,
        });

        if (dec.precedents && dec.precedents.length > 0) {
          setMatchedPrecedents(dec.precedents);
        } else {
          setMatchedPrecedents([]);
        }
      } else {
        // Resume active review
        if (dec.subjectEntityId) {
          try {
            const res = await fetch(`/api/engineering/entities/${dec.subjectEntityId}`);
            if (res.ok) {
              const json = await res.json();
              const entity = json.data;
              if (entity) {
                setEntityResults([entity]);
                evaluateTarget(entity, dec);
              }
            }
          } catch (err) {
            console.error("Failed to load entity", err);
          }
        }
      }
    },
    [evaluateTarget],
  );

  const handleFinalizeDecision = async () => {
    if (!activeDecision) return;
    setValidationError("");

    if (!finalDecisionText.trim()) {
      setValidationError("Final decision statement is required.");
      return;
    }

    if (!rationaleText.trim()) {
      setValidationError("Rationale and mitigation notes are required.");
      return;
    }

    setIsFinalizing(true);
    try {
      const res = await fetch(`/api/decisions/${activeDecision.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "FINALIZED",
          finalDecision: finalDecisionText,
          rationale: rationaleText,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setValidationError(json.error ?? "Failed to finalize decision.");
        return;
      }

      const json = await res.json();
      setActiveDecision(json.data);
      setFinalizeSuccess(true);
      fetchRecentDecisions();
      setTimeout(() => setFinalizeSuccess(false), 3000);
    } catch {
      setValidationError("An error occurred while finalizing the decision.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleExportDecision = () => {
    if (!resolution) return;
    setExportSuccess(true);

    const exportData = {
      target: selectedEntity?.name ?? resolution.subjectLabel,
      identifier: selectedEntity?.identifier ?? "",
      status: resolution.status,
      evidenceSummary: {
        total: resolution.summary.totalEvidence,
        supporting: resolution.summary.supportingEvidence,
        conflicting: resolution.summary.conflictingEvidence,
        missing: resolution.summary.missingEvidence,
      },
      qualityRating: resolution.qualityIndicators.quality,
      exportedAt: new Date().toISOString(),
      decisionRecord: activeDecision
        ? {
            id: activeDecision.id,
            status: activeDecision.status,
            question: activeDecision.question,
            finalDecision: activeDecision.finalDecision,
            rationale: activeDecision.rationale,
            finalizedAt: activeDecision.finalizedAt,
          }
        : null,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decision-export-${selectedEntity?.identifier ?? "target"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleBackToHistory = () => {
    setActiveDecision(null);
    setSelectedEntity(null);
    setResolution(null);
    setMatchedPrecedents([]);
    setFabricInsights([]);
    setQuestion("");
    setValidationError("");
  };

  // Determine verification strength class & label
  const getVerificationStrength = () => {
    if (!resolution) return { label: "—", color: "text-zinc-500" };
    if (resolution.status === "VERIFIED" || resolution.status === "SUFFICIENT") {
      return { label: "Strong", color: "text-emerald-600" };
    }
    if (resolution.status === "INCOMPLETE" || resolution.status === "NEEDS_REVIEW") {
      return { label: "Sufficient with gaps", color: "text-amber-600" };
    }
    return { label: "Weak / Compromised", color: "text-rose-600" };
  };

  const getVerificationStatusLabel = (status: string) => {
    if (status === "INSUFFICIENT") return "INCOMPLETE";
    return status.replace(/_/g, " ");
  };

  const getStatusBadgeColor = (status: string) => {
    if (status === "FINALIZED") return "border-emerald-200 bg-emerald-50 text-emerald-800";
    if (status === "EVIDENCE_REVIEW") return "border-amber-200 bg-amber-50 text-amber-800";
    return "border-zinc-200 bg-zinc-100 text-zinc-700";
  };

  return (
    <PageContainer>
      <Stack gap={8}>
        {/* Header Title */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-foreground text-3xl font-semibold tracking-tight">
              Verification Workspace
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm leading-normal">
              Query engineering specifications, gather traceable evidence, analyze contradictions,
              and package verified decisions deterministically.
            </p>
          </div>
          {activeDecision && (
            <Button
              onClick={handleBackToHistory}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="size-4" />
              <span>Back to History</span>
            </Button>
          )}
        </div>

        {/* --- QUESTION INPUT SECTION (Hide when viewing active/finalized decisions) --- */}
        {!activeDecision && (
          <Panel padding="lg" className="border border-zinc-200 bg-white">
            <Stack gap={4}>
              <div className="flex flex-col gap-2">
                <label htmlFor="question-input" className="text-foreground text-sm font-medium">
                  Ask an Engineering Question
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
                    <Input
                      id="question-input"
                      placeholder="Enter an engineering question or verify a supplier, component, or revision..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchTargets(question)}
                      className="h-11 border-zinc-200 pl-10"
                    />
                  </div>
                  <Button
                    className="h-11 shrink-0 bg-zinc-900 px-6 font-medium text-zinc-50 hover:bg-zinc-800"
                    onClick={() => searchTargets(question)}
                    disabled={isSearching}
                  >
                    {isSearching ? "Processing..." : "Verify"}
                  </Button>
                </div>
              </div>

              {/* Quick Suggestions */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  Suggested Verification Inquiries
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetClick(preset.question)}
                      className="cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                    >
                      {preset.question}
                    </button>
                  ))}
                </div>
              </div>
            </Stack>
          </Panel>
        )}

        {/* --- ERROR FEEDBACK --- */}
        {error && (
          <Panel padding="md" className="border border-rose-200 bg-rose-50 text-rose-800">
            <div className="flex items-center gap-2 text-sm text-rose-800">
              <XCircle className="size-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          </Panel>
        )}

        {/* --- LOADING EXPERIENCE --- */}
        {(isSearching || isEvaluating) && (
          <div className="flex flex-col items-center justify-center py-20">
            <Clock className="mb-3 size-8 animate-pulse text-zinc-400" />
            <p className="text-sm font-medium text-zinc-600">
              Reconciling specifications and gathering evidence...
            </p>
          </div>
        )}

        {/* --- DYNAMIC TARGET RESOLUTION SELECTOR --- */}
        {entityResults.length > 0 && !isSearching && !isEvaluating && (
          <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <span className="font-mono text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Verification Targets Resolved
            </span>
            <div className="flex flex-wrap gap-2">
              {entityResults.map((ent) => (
                <button
                  key={ent.id}
                  onClick={() => evaluateTarget(ent)}
                  className={cn(
                    "cursor-pointer rounded-md border px-3 py-1.5 text-left font-mono text-xs font-medium transition-colors",
                    selectedEntity?.id === ent.id
                      ? "border-zinc-900 bg-zinc-900 text-zinc-50"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-900",
                  )}
                >
                  {ent.name} ({ent.identifier})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- DECISIONS HISTORY LIST (Only visible when no active workspace selection is running) --- */}
        {!activeDecision && !isSearching && !isEvaluating && (
          <Stack gap={4}>
            <div className="flex flex-col justify-between gap-3 border-b border-zinc-200 pb-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5">
                <div className="shrink-0 rounded-md border border-zinc-200 bg-zinc-100 p-1.5 text-zinc-600">
                  <History className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-zinc-900 sm:text-lg">
                    Recent Engineering Decisions
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Deterministic audit trail of finalized and active decision evaluations
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 font-mono text-xs text-zinc-700">
                  <span className="text-zinc-500">Total:</span>
                  <strong className="text-zinc-900">{decisions.length}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-xs text-emerald-800">
                  <span className="text-emerald-600">Finalized:</span>
                  <strong>{decisions.filter((d) => d.status === "FINALIZED").length}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-xs text-amber-800">
                  <span className="text-amber-600">In Progress:</span>
                  <strong>{decisions.filter((d) => d.status !== "FINALIZED").length}</strong>
                </span>
              </div>
            </div>

            {decisions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white/60 py-16 text-center">
                <p className="text-sm font-medium text-zinc-500">
                  No decisions logged yet. Start a new verification query above to begin a workflow.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {decisions.map((dec) => (
                  <div
                    key={dec.id}
                    onClick={() => handleSelectDecision(dec)}
                    className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-zinc-400 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          className={cn(
                            "rounded border px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider uppercase",
                            getStatusBadgeColor(dec.status),
                          )}
                        >
                          {dec.status.replace(/_/g, " ")}
                        </Badge>
                        <span className="font-mono text-xs text-zinc-500">
                          {new Date(dec.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700">
                        {dec.question}
                      </h3>

                      {dec.status === "FINALIZED" && dec.finalDecision && (
                        <div className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                          <span className="mb-1 block text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                            Final Decision Outcome:
                          </span>
                          <p className="line-clamp-3 font-mono text-xs leading-relaxed text-zinc-700">
                            &quot;{dec.finalDecision}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs">
                      <span className="font-mono text-[11px] text-zinc-500">
                        {dec.id ? `ID: ${dec.id.slice(0, 8)}...` : ""}
                      </span>
                      <div className="flex items-center gap-1 font-semibold text-zinc-900 transition-all group-hover:translate-x-0.5">
                        <span>
                          {dec.status === "FINALIZED" ? "View Full Audit" : "Resume Review"}
                        </span>
                        <ChevronRight className="size-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Stack>
        )}

        {/* --- IDLE MESSAGE WHEN ACTIVE BUT NO DETAILS LOADED --- */}
        {!selectedEntity && !isSearching && !isEvaluating && activeDecision && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/30 py-24 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
              <ShieldCheck className="size-7" />
            </div>
            <p className="text-foreground text-base font-medium">Workflow Resumed</p>
            <p className="text-muted-foreground mt-1.5 max-w-sm text-sm leading-normal">
              Analyzing query target constraints... Please select or resolve a verification target
              above.
            </p>
          </div>
        )}

        {/* --- ACTIVE WORKSPACE COMPLIANCE DATA --- */}
        {resolution && selectedEntity && !isEvaluating && !isSearching && (
          <Stack gap={8}>
            {/* Target Header Banner */}
            <Panel padding="md" className="border border-zinc-200 bg-zinc-50/50">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-foreground text-sm font-semibold">
                      {selectedEntity.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {selectedEntity.identifier} · {selectedEntity.entityType}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  {activeDecision && (
                    <Badge
                      className={cn(
                        "border text-[10px] font-medium tracking-wider uppercase",
                        getStatusBadgeColor(activeDecision.status),
                      )}
                    >
                      Workflow: {activeDecision.status.replace(/_/g, " ")}
                    </Badge>
                  )}
                  <Badge
                    variant="secondary"
                    className="border-zinc-200 bg-zinc-100 font-medium text-zinc-800 capitalize"
                  >
                    Status: {getVerificationStatusLabel(resolution.status).toLowerCase()}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    Verified at {new Date(resolution.resolvedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </Panel>

            {/* --- ASSESSMENT SUMMARY & DECISION EXPORT --- */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Summary Card */}
              <Card className="bg-background border-zinc-200 shadow-sm lg:col-span-2">
                <CardContent className="p-6">
                  <Stack gap={4}>
                    <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase">
                      Verification Summary
                    </h3>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div>
                        <span className="text-muted-foreground text-xs font-medium">
                          Evidence Strength
                        </span>
                        <p
                          className={cn(
                            "mt-1 text-base font-semibold",
                            getVerificationStrength().color,
                          )}
                        >
                          {getVerificationStrength().label}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs font-medium">
                          Supporting Evidence
                        </span>
                        <p className="text-foreground mt-1 text-lg font-bold">
                          {resolution.summary.totalEvidence} items
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs font-medium">
                          Contradictions
                        </span>
                        <p
                          className={cn(
                            "mt-1 text-lg font-bold",
                            resolution.conflicts.length > 0 ? "text-red-600" : "text-foreground",
                          )}
                        >
                          {resolution.conflicts.length}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs font-medium">
                          Missing Evidence
                        </span>
                        <p
                          className={cn(
                            "mt-1 text-lg font-bold",
                            resolution.missingEvidence.length > 0
                              ? "text-amber-600"
                              : "text-foreground",
                          )}
                        >
                          {resolution.missingEvidence.length}
                        </p>
                      </div>
                    </div>

                    <Divider className="border-zinc-200" />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground text-xs font-medium">
                          Confidence Level:
                        </span>
                        <span className="text-foreground text-sm font-semibold capitalize">
                          {resolution.qualityIndicators.quality.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {resolution.status === "VERIFIED" || resolution.status === "SUFFICIENT"
                          ? `The target has strong compliance integrity. We identified ${resolution.summary.totalEvidence} supporting verification data points and found zero contradictions or missing qualifications. Documentation provenance is complete.`
                          : `The target compliance level is moderate to weak. We found ${resolution.conflicts.length} contradictions and ${resolution.missingEvidence.length} missing certifications/qualifications that prevent complete verification. Further review is required.`}
                      </p>
                    </div>
                  </Stack>
                </CardContent>
              </Card>

              {/* Export Panel */}
              <Card className="bg-background border-zinc-200 shadow-sm">
                <CardContent className="flex h-full flex-col justify-between p-6">
                  <Stack gap={4}>
                    <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase">
                      Decision Export
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Download the deterministic verification trail as an immutable audit package to
                      justify your design decisions.
                    </p>
                  </Stack>
                  <div className="mt-6">
                    <Button
                      onClick={handleExportDecision}
                      className="flex h-11 w-full items-center justify-center gap-2 bg-zinc-900 font-medium text-zinc-50 shadow hover:bg-zinc-800"
                    >
                      {exportSuccess ? (
                        <>
                          <Check className="size-4 shrink-0" />
                          <span>Exported successfully</span>
                        </>
                      ) : (
                        <>
                          <Download className="size-4 shrink-0" />
                          <span>Export Decision Log</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* --- EVIDENCE TIMELINE & RELATED DOCUMENTS --- */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Evidence Timeline */}
              <Card className="bg-background border-zinc-200 shadow-sm lg:col-span-2">
                <CardContent className="p-6">
                  <Stack gap={6}>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase">
                        Evidence Timeline
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        Deterministic compliance verification checkpoints retrieved for this target.
                      </p>
                    </div>

                    {resolution.supportingEvidence.length === 0 ? (
                      <div className="text-muted-foreground py-8 text-center text-sm">
                        No supporting compliance documents verified.
                      </div>
                    ) : (
                      <div className="relative ml-2.5 space-y-6 border-l border-zinc-200 pl-5">
                        {resolution.supportingEvidence.map((node) => (
                          <div key={node.id} className="group relative">
                            {/* Circle Dot indicator */}
                            <span className="bg-background absolute top-1.5 -left-[26px] flex h-3 w-3 items-center justify-center rounded-full border-2 border-zinc-300 transition-colors group-hover:border-zinc-500" />

                            <Stack gap={2}>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-foreground text-sm font-semibold">
                                  {node.label}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="border-zinc-200 bg-zinc-100 px-1.5 py-0 text-[10px] text-zinc-600"
                                >
                                  {node.entityType ?? node.type}
                                </Badge>
                              </div>

                              <p className="text-muted-foreground text-xs leading-normal">
                                <span className="font-semibold text-zinc-700">
                                  Why it is relevant:
                                </span>{" "}
                                verified compliance matching requirement constraints.
                              </p>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-500">
                                {node.documentName && (
                                  <span>
                                    Document: {node.documentName}{" "}
                                    {node.page ? `(Page ${node.page})` : ""}
                                  </span>
                                )}
                                {node.version && <span>Revision: {node.version}</span>}
                                {node.createdAt && (
                                  <span>Date: {new Date(node.createdAt).toLocaleDateString()}</span>
                                )}
                                <span>Confidence: high</span>
                              </div>
                            </Stack>
                          </div>
                        ))}
                      </div>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Related Documents */}
              <Card className="bg-background border-zinc-200 shadow-sm">
                <CardContent className="p-6">
                  <Stack gap={4}>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase">
                        Related Documents
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        Origin files supporting this verification.
                      </p>
                    </div>

                    {resolution.traceabilityGraph.records.length === 0 ? (
                      <div className="text-muted-foreground py-8 text-center text-xs">
                        No supporting reference files.
                      </div>
                    ) : (
                      <Stack gap={3}>
                        {Array.from(
                          new Set(
                            resolution.traceabilityGraph.records
                              .map((r) => r.documentId)
                              .filter(Boolean),
                          ),
                        ).map((docId) => {
                          const docRecord = resolution.traceabilityGraph.records.find(
                            (r) => r.documentId === docId,
                          );
                          if (!docRecord) return null;
                          return (
                            <Link
                              key={docId}
                              href={`/documents/${docId}`}
                              className="group flex items-start gap-2.5 rounded border border-transparent p-2 text-left transition-all hover:border-zinc-200 hover:bg-zinc-50"
                            >
                              <FileText className="mt-0.5 size-4 shrink-0 text-zinc-400 group-hover:text-zinc-600" />
                              <div className="flex min-w-0 flex-col">
                                <span className="text-foreground truncate text-xs font-semibold transition-colors group-hover:text-indigo-600">
                                  {docRecord.documentName}
                                </span>
                                <span className="mt-0.5 text-[10px] text-zinc-500">
                                  Version {docRecord.documentVersion ?? 1} ·{" "}
                                  {docRecord.extractionMethod ?? "manual review"}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </div>

            {/* --- CONTRADICTIONS & MISSING EVIDENCE --- */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Contradictions Panel */}
              <Card className="bg-background border-zinc-200 shadow-sm">
                <CardContent className="p-6">
                  <Stack gap={4}>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase">
                        Contradictions
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        Unresolved data conflicts or mismatch claims.
                      </p>
                    </div>

                    {resolution.conflicts.length === 0 ? (
                      <div className="text-muted-foreground rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 py-10 text-center text-sm">
                        No contradictions or specifications mismatch detected.
                      </div>
                    ) : (
                      <Stack gap={4}>
                        {resolution.conflicts.map((conflict) => (
                          <div
                            key={conflict.id}
                            className={cn(
                              "rounded border border-l-4 p-4 text-left",
                              SEVERITY_COLORS[conflict.severity] ?? SEVERITY_COLORS["MEDIUM"],
                            )}
                          >
                            <Stack gap={2}>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="size-4 shrink-0" />
                                <span className="text-sm font-semibold">{conflict.label}</span>
                              </div>

                              <p className="text-xs leading-relaxed opacity-90">
                                <strong className="mb-0.5 block font-semibold">
                                  Conflicting statement:
                                </strong>
                                {conflict.description}
                              </p>

                              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-current/10 pt-2 text-[10px]">
                                <div>
                                  <strong className="block font-semibold opacity-85">
                                    Affected Documents:
                                  </strong>
                                  <span>{selectedEntity.name} specification vs vendor logs</span>
                                </div>
                                <div>
                                  <strong className="block font-semibold opacity-85">
                                    Potential Impact:
                                  </strong>
                                  <span>Stress load tolerance check might fail.</span>
                                </div>
                                <div className="col-span-2">
                                  <strong className="block font-semibold opacity-85">
                                    Suggested Investigation:
                                  </strong>
                                  <span>
                                    Verify raw test data files page references and confirm design
                                    shear limits.
                                  </span>
                                </div>
                              </div>
                            </Stack>
                          </div>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Missing Evidence Panel */}
              <Card className="bg-background border-zinc-200 shadow-sm">
                <CardContent className="p-6">
                  <Stack gap={4}>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase">
                        Missing Evidence
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        Required certifications, tests, or approvals that are absent.
                      </p>
                    </div>

                    {resolution.missingEvidence.length === 0 ? (
                      <div className="text-muted-foreground rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 py-10 text-center text-sm">
                        All compliance checklists and certifications are complete.
                      </div>
                    ) : (
                      <Stack gap={4}>
                        {resolution.missingEvidence.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              "rounded border border-l-4 p-4 text-left",
                              SEVERITY_COLORS[item.severity] ?? SEVERITY_COLORS["MEDIUM"],
                            )}
                          >
                            <Stack gap={2}>
                              <div className="flex items-start gap-2.5">
                                <XCircle className="mt-0.5 size-4 shrink-0" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold">{item.label}</span>
                                  <span className="mt-1 text-xs opacity-90">
                                    {item.description}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-1 border-t border-current/10 pt-1.5 text-[10px]">
                                <strong className="block font-semibold opacity-85">
                                  Why it matters:
                                </strong>
                                <span>
                                  Absence of this item invalidates regulatory load assurance and
                                  material classification checklists.
                                </span>
                              </div>
                            </Stack>
                          </div>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </div>

            {/* --- RELATED HISTORICAL CONTEXT --- */}
            <Card className="bg-background animate-in fade-in border-zinc-200 shadow-sm duration-200">
              <CardContent className="p-6">
                <Stack gap={4}>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase">
                      Related Historical Context
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Prior engineering decisions and lessons learned matching the current
                      verification profile.
                    </p>
                  </div>

                  {matchedPrecedents.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {matchedPrecedents.map((prec) => (
                        <div
                          key={prec.id}
                          onClick={() => {
                            setSelectedPrecedent(prec);
                            setIsPrecedentModalOpen(true);
                          }}
                          className="cursor-pointer rounded-lg border border-zinc-200 bg-zinc-50/10 p-5 text-left transition-all hover:bg-zinc-100/50"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="text-foreground text-sm font-semibold hover:text-zinc-600">
                                  {prec.title}
                                </h4>
                                <span className="text-muted-foreground mt-0.5 block text-[10px]">
                                  Owner: {prec.decisionOwner?.name || "Authorized Engineer"} · Date:{" "}
                                  {new Date(prec.decisionDate).toLocaleDateString()}
                                </span>
                              </div>
                              {prec.similarityScore !== undefined && (
                                <Badge
                                  className={cn(
                                    "px-2 py-0.5 text-[10px] font-semibold tracking-wide",
                                    prec.similarityScore >= 80
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                      : prec.similarityScore >= 50
                                        ? "border-amber-200 bg-amber-50 text-amber-800"
                                        : "border-zinc-200 bg-zinc-100 text-zinc-800",
                                  )}
                                >
                                  {prec.similarityScore}% Match
                                </Badge>
                              )}
                            </div>

                            <p className="text-muted-foreground text-xs leading-normal">
                              <strong>Why it matched:</strong>{" "}
                              {prec.matchExplanation?.join("; ") ||
                                "Matched via general metadata index."}
                            </p>

                            <div className="grid grid-cols-1 gap-3 rounded border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs sm:grid-cols-2">
                              <div>
                                <strong className="text-foreground block font-medium">
                                  Outcome
                                </strong>
                                <span className="text-muted-foreground mt-0.5 block">
                                  {prec.outcome}
                                </span>
                              </div>
                              <div>
                                <strong className="text-foreground block font-medium">
                                  Lessons Learned
                                </strong>
                                <span className="text-muted-foreground mt-0.5 line-clamp-2 block">
                                  {prec.lessonsLearned}
                                </span>
                              </div>
                            </div>

                            <div className="text-[10px] text-zinc-400">
                              Supporting Evidence Count: {prec.supportingEvidence?.length || 0}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground rounded border border-dashed border-zinc-200 py-6 text-center text-sm">
                      No matching precedents found in organizational memory.
                    </div>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* --- FEDERATED INDUSTRY FABRIC INSIGHTS --- */}
            {fabricInsights.length > 0 && (
              <Card className="bg-background animate-in fade-in border-zinc-200 shadow-sm duration-200">
                <CardContent className="p-6">
                  <Stack gap={4}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase">
                          Privacy-Preserving Industry Fabric Insights
                        </h3>
                        <Badge
                          variant="secondary"
                          className="border-indigo-200 bg-indigo-50 text-indigo-800"
                        >
                          Federated
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Anonymized, cross-company learning rules compiled from the global aerospace
                        manufacturing memory.
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {fabricInsights.map((insight) => (
                        <div
                          key={insight.id}
                          className="rounded-lg border border-indigo-200/50 bg-indigo-50/5 p-5"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-indigo-950">
                                  {insight.title}
                                </h4>
                                <span className="text-muted-foreground mt-0.5 block text-[10px]">
                                  Type: {insight.axiomType} · Context Key: {insight.contextKey}
                                </span>
                              </div>
                              <Badge className="border-indigo-200 bg-indigo-100 text-indigo-800">
                                Verified Rule
                              </Badge>
                            </div>

                            <p className="text-muted-foreground text-xs leading-normal">
                              {insight.description}
                            </p>

                            <div className="grid grid-cols-1 gap-3 rounded border border-indigo-200/20 bg-indigo-50/20 p-3 text-xs sm:grid-cols-2">
                              <div>
                                <strong className="block font-medium text-indigo-900">
                                  Aggregated Metrics
                                </strong>
                                <span className="text-muted-foreground mt-0.5 block">
                                  Avg Scrap Rate:{" "}
                                  {Math.round((insight.statisticalData?.scrapRate || 0) * 100)}% ·
                                  Occurrences: {insight.statisticalData?.occurrences || 0}
                                </span>
                              </div>
                              <div>
                                <strong className="block font-medium text-indigo-900">
                                  Recommendation
                                </strong>
                                <span className="text-muted-foreground mt-0.5 block font-medium text-emerald-700">
                                  {insight.recommendation}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* --- ENGINEER SIGN-OFF & FINAL DECISION CAPTURE --- */}
            {activeDecision && (
              <Card className="border-zinc-200 bg-zinc-50/10 shadow-lg">
                <CardContent className="p-6">
                  <Stack gap={6}>
                    <div className="flex items-center gap-3">
                      {activeDecision.status === "FINALIZED" ? (
                        <FileCheck2 className="size-6 text-emerald-600" />
                      ) : (
                        <UserCheck className="size-6 text-zinc-600" />
                      )}
                      <div className="flex flex-col">
                        <h3 className="text-foreground text-base font-semibold">
                          {activeDecision.status === "FINALIZED"
                            ? "Immutable Sign-off Certificate"
                            : "Engineer Sign-off & Final Capture"}
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          {activeDecision.status === "FINALIZED"
                            ? "This decision is locked, archived, and registered as a historical precedent."
                            : "As the final human decision-maker, capture your engineering decision and rationale."}
                        </p>
                      </div>
                    </div>

                    <Divider className="border-zinc-200" />

                    {activeDecision.status === "FINALIZED" ? (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Stack gap={3} className="rounded-lg bg-zinc-50/50 p-4">
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold uppercase">
                              Final Decision Statement
                            </span>
                            <p className="text-foreground mt-2 border-l-2 border-emerald-500 bg-zinc-500/5 py-1 pl-3 text-sm leading-relaxed font-medium">
                              {activeDecision.finalDecision}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
                            <Lock className="size-3 text-emerald-500" />
                            <span>
                              Signed by {activeDecision.finalizedById || "Authorized Engineer"}
                            </span>
                            <span>·</span>
                            <span>{new Date(activeDecision.finalizedAt).toLocaleString()}</span>
                          </div>
                        </Stack>

                        <Stack gap={3} className="rounded-lg bg-zinc-50/50 p-4">
                          <div>
                            <span className="text-muted-foreground text-xs font-semibold uppercase">
                              Rationale & Mitigation Notes
                            </span>
                            <p className="text-foreground mt-2 text-sm leading-relaxed whitespace-pre-line">
                              {activeDecision.rationale}
                            </p>
                          </div>
                        </Stack>
                      </div>
                    ) : (
                      <Stack gap={4}>
                        {/* Validation warning if gaps exist */}
                        {(resolution.conflicts.length > 0 ||
                          resolution.missingEvidence.length > 0) && (
                          <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4 text-xs text-amber-800">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                              <div>
                                <span className="font-semibold">
                                  Attention: Active contradictions or missing evidence detected.
                                </span>
                                <p className="mt-1 leading-normal opacity-90">
                                  You are required to address these issues explicitly in the
                                  Rationale & Mitigation notes below to explain how they are
                                  resolved or why they are acceptable.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="final-decision-text"
                            className="text-foreground text-sm font-semibold"
                          >
                            Final Decision Statement
                          </label>
                          <Input
                            id="final-decision-text"
                            placeholder="e.g. Approve Supplier X fastener usage for cyclic vibration load compliance."
                            value={finalDecisionText}
                            onChange={(e) => setFinalDecisionText(e.target.value)}
                            className="border-zinc-200"
                            disabled={isFinalizing}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="rationale-text"
                            className="text-foreground text-sm font-semibold"
                          >
                            Rationale & Mitigation Notes
                          </label>
                          <textarea
                            id="rationale-text"
                            placeholder="Document the exact engineering justification, limitations, and mitigations..."
                            value={rationaleText}
                            onChange={(e) => setRationaleText(e.target.value)}
                            className="placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isFinalizing}
                          />
                        </div>

                        {validationError && (
                          <div className="text-xs font-semibold text-rose-600">
                            {validationError}
                          </div>
                        )}

                        {finalizeSuccess && (
                          <div className="text-xs font-semibold text-emerald-600">
                            Sign-off completed successfully!
                          </div>
                        )}

                        <div className="mt-2 flex justify-end">
                          <Button
                            onClick={handleFinalizeDecision}
                            disabled={isFinalizing}
                            className="h-11 bg-zinc-900 px-6 font-semibold text-zinc-50 shadow hover:bg-zinc-800"
                          >
                            {isFinalizing ? "Signing Off..." : "Sign Off & Finalize Decision"}
                          </Button>
                        </div>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
            {/* Precedent Detail Modal Overlay */}
            {isPrecedentModalOpen && selectedPrecedent && (
              <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
                <div className="animate-in slide-in-from-right flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm duration-250">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">
                        Historical Context / Precedent Profile
                      </span>
                      <h2 className="mt-1 text-lg font-bold text-zinc-900">
                        {selectedPrecedent.title}
                      </h2>
                    </div>
                    <button
                      onClick={() => setIsPrecedentModalOpen(false)}
                      className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-200"
                    >
                      <XCircle className="size-5" />
                    </button>
                  </div>

                  <Stack gap={6} className="mt-6">
                    {/* Similarity Score */}
                    {selectedPrecedent.similarityScore !== undefined && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="size-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-emerald-600">
                            Similarity Match: {selectedPrecedent.similarityScore}%
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                          <strong>Match rationale:</strong>{" "}
                          {selectedPrecedent.matchExplanation?.join("; ")}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                        Engineering Question
                      </h4>
                      <p className="mt-1 text-sm font-medium text-zinc-700 italic">
                        &quot;{selectedPrecedent.engineeringQuestion}&quot;
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                        Decision Summary
                      </h4>
                      <p className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 text-sm leading-relaxed font-normal text-zinc-700">
                        {selectedPrecedent.decisionMade}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                          Outcome
                        </h4>
                        <p className="mt-1 text-sm font-semibold text-zinc-600">
                          {selectedPrecedent.outcome}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                          Decision Date
                        </h4>
                        <p className="mt-1 text-sm text-zinc-600">
                          {new Date(selectedPrecedent.decisionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                        Lessons Learned
                      </h4>
                      <p className="mt-1 rounded-lg border border-zinc-200/60 bg-zinc-50/20 p-3 text-sm leading-relaxed text-zinc-600">
                        {selectedPrecedent.lessonsLearned}
                      </p>
                    </div>

                    {/* Evidence, Contradictions, Missing */}
                    <div className="border-t border-zinc-200 pt-4">
                      <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                        Verification Details
                      </h3>
                      <Stack gap={4}>
                        <div>
                          <span className="text-xs font-semibold text-zinc-500">
                            Supporting Evidence Used
                          </span>
                          {selectedPrecedent.supportingEvidence &&
                          selectedPrecedent.supportingEvidence.length > 0 ? (
                            <ul className="mt-1.5 list-inside list-disc space-y-1 text-xs text-zinc-600">
                              {selectedPrecedent.supportingEvidence.map((e, i) => (
                                <li key={i}>{e}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1 text-xs text-zinc-500 italic">
                              No explicit evidence items listed.
                            </p>
                          )}
                        </div>

                        <div>
                          <span className="text-xs font-semibold text-zinc-500">
                            Contradictions Encountered
                          </span>
                          {selectedPrecedent.contradictions &&
                          selectedPrecedent.contradictions.length > 0 ? (
                            <ul className="mt-1.5 list-inside list-disc space-y-1 text-xs text-red-400">
                              {selectedPrecedent.contradictions.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1 text-xs text-zinc-500 italic">
                              No contradictions flagged.
                            </p>
                          )}
                        </div>

                        <div>
                          <span className="text-xs font-semibold text-zinc-500">
                            Missing Evidence Identified
                          </span>
                          {selectedPrecedent.missingEvidence &&
                          selectedPrecedent.missingEvidence.length > 0 ? (
                            <ul className="mt-1.5 list-inside list-disc space-y-1 text-xs text-amber-600">
                              {selectedPrecedent.missingEvidence.map((m, i) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1 text-xs text-zinc-500 italic">
                              No missing requirements found.
                            </p>
                          )}
                        </div>
                      </Stack>
                    </div>

                    {/* Linked parameters */}
                    <div className="border-t border-zinc-200 pt-4">
                      <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                        Linked Parameters
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="block font-semibold text-zinc-500">
                            Linked Documents
                          </span>
                          <span className="mt-1 block text-zinc-600">
                            {selectedPrecedent.relatedDocuments?.join(", ") || "None"}
                          </span>
                        </div>
                        <div>
                          <span className="block font-semibold text-zinc-500">
                            Linked Suppliers
                          </span>
                          <span className="mt-1 block text-zinc-600">
                            {selectedPrecedent.relatedSuppliers?.join(", ") || "None"}
                          </span>
                        </div>
                        <div>
                          <span className="block font-semibold text-zinc-500">
                            Linked Requirements
                          </span>
                          <span className="mt-1 block text-zinc-600">
                            {selectedPrecedent.relatedRequirements?.join(", ") || "None"}
                          </span>
                        </div>
                        <div>
                          <span className="block font-semibold text-zinc-500">
                            Linked Standards
                          </span>
                          <span className="mt-1 block text-zinc-600">
                            {selectedPrecedent.relatedStandards?.join(", ") || "None"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Audit & Version History */}
                    <div className="border-t border-zinc-200 pt-4">
                      <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                        Audit Trail & History
                      </h3>
                      <div className="space-y-4">
                        {selectedPrecedent.versions && selectedPrecedent.versions.length > 0 && (
                          <div>
                            <span className="mb-1 block text-xs font-semibold text-zinc-500">
                              Version History
                            </span>
                            <div className="space-y-1.5">
                              {selectedPrecedent.versions.map((v, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between rounded border border-zinc-200 bg-zinc-50/30 p-2 text-xs"
                                >
                                  <span className="font-medium text-zinc-700">v{v.version}</span>
                                  <span className="text-zinc-500">{v.summary}</span>
                                  <span className="text-zinc-500">
                                    {new Date(v.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedPrecedent.auditMetadata &&
                          selectedPrecedent.auditMetadata.length > 0 && (
                            <div>
                              <span className="mb-1 block text-xs font-semibold text-zinc-500">
                                System Audit Logs
                              </span>
                              <div className="space-y-1.5">
                                {selectedPrecedent.auditMetadata.map((log, i) => (
                                  <div
                                    key={i}
                                    className="rounded border border-zinc-200 bg-zinc-50/20 p-2 text-[11px] text-zinc-500"
                                  >
                                    <span className="font-semibold text-zinc-700">
                                      {log.action}
                                    </span>{" "}
                                    by {log.performedBy} on{" "}
                                    {new Date(log.timestamp).toLocaleString()}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </Stack>
                </div>
              </div>
            )}
          </Stack>
        )}
      </Stack>
    </PageContainer>
  );
}
