"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  FileText,
  Tags,
  GitBranch,
  AlertTriangle,
  Clock,
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { PageContainer, Section, Panel, Stack } from "@/components/layout";
import { Input, Button } from "@/components/ui";
import { cn } from "@/shared/utils";

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

interface EntityOption {
  id: string;
  name: string;
  identifier: string;
  entityType: string;
}

const STATUS_CONFIG: Record<string, { icon: typeof ShieldCheck; color: string; bg: string }> = {
  VERIFIED: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  SUFFICIENT: { icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
  INSUFFICIENT: { icon: ShieldX, color: "text-destructive", bg: "bg-destructive/10" },
  CONFLICTING: { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10" },
  INCOMPLETE: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
  NEEDS_REVIEW: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
};

const SEVERITY_COLORS: Record<string, string> = {
  HIGH: "border-destructive/50 bg-destructive/5 text-destructive",
  MEDIUM: "border-warning/50 bg-warning/5 text-warning",
  LOW: "border-muted-foreground/50 bg-muted text-muted-foreground",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function EvidencePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entityResults, setEntityResults] = useState<EntityOption[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityOption | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [resolution, setResolution] = useState<ResolutionResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "supporting" | "conflicting" | "missing" | "chains" | "traceability"
  >("supporting");

  const searchEntities = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/engineering/entities?search=${encodeURIComponent(searchQuery)}&pageSize=10`,
      );
      if (res.ok) {
        const json = await res.json();
        setEntityResults(json.data ?? []);
      }
    } catch {
      setEntityResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const evaluateEntity = useCallback(async (entity: EntityOption) => {
    setSelectedEntity(entity);
    setIsEvaluating(true);
    setError("");
    setResolution(null);
    try {
      const res = await fetch("/api/evidence/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityId: entity.id, maxDepth: 5 }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Evaluation failed");
        return;
      }
      const json = await res.json();
      setResolution(json.data);
    } catch {
      setError("Failed to evaluate evidence");
    } finally {
      setIsEvaluating(false);
    }
  }, []);

  const statusConfig = resolution
    ? (STATUS_CONFIG[resolution.status] ?? STATUS_CONFIG.INSUFFICIENT)
    : null;

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Evidence Resolution</h1>
          <p className="text-muted-foreground text-sm">
            Deterministic, evidence-based evaluation of engineering truth.
          </p>
        </div>

        <Panel padding="md">
          <Stack gap={3}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[240px] flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search entities to evaluate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchEntities()}
                  className="pl-9"
                />
              </div>
              <Button variant="secondary" onClick={searchEntities} disabled={isSearching}>
                {isSearching ? (
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                ) : (
                  <Search className="mr-1.5 size-4" />
                )}
                Search
              </Button>
            </div>

            {entityResults.length > 0 && !selectedEntity && (
              <div className="border-border divide-border overflow-hidden rounded-lg border">
                {entityResults.map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => evaluateEntity(entity)}
                    className="hover:bg-surface-hover flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0"
                  >
                    <Tags className="text-muted-foreground size-4" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-foreground text-sm font-medium">{entity.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {entity.identifier} · {entity.entityType}
                      </span>
                    </div>
                    <ChevronRight className="text-muted-foreground size-4" />
                  </button>
                ))}
              </div>
            )}

            {selectedEntity && (
              <div className="border-border bg-muted/30 flex items-center gap-2 rounded-lg border px-4 py-2">
                <Tags className="text-muted-foreground size-4" />
                <span className="text-foreground text-sm font-medium">{selectedEntity.name}</span>
                <span className="text-muted-foreground text-xs">{selectedEntity.identifier}</span>
                <button
                  onClick={() => {
                    setSelectedEntity(null);
                    setResolution(null);
                    setEntityResults([]);
                  }}
                  className="text-muted-foreground hover:text-foreground ml-auto text-xs underline"
                >
                  Clear
                </button>
              </div>
            )}
          </Stack>
        </Panel>

        {error && (
          <Panel padding="md" className="border-destructive/50">
            <div className="text-destructive flex items-center gap-2 text-sm">
              <AlertCircle className="size-4" />
              {error}
            </div>
          </Panel>
        )}

        {isEvaluating && (
          <div className="flex items-center justify-center py-16">
            <Stack align="center" gap={3}>
              <Loader2 className="text-muted-foreground size-8 animate-spin" />
              <p className="text-muted-foreground text-sm">Evaluating evidence...</p>
            </Stack>
          </div>
        )}

        {resolution && statusConfig && (
          <Stack gap={6}>
            <Panel padding="lg" className={cn("border", statusConfig.bg)}>
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full",
                    statusConfig.bg,
                  )}
                >
                  <statusConfig.icon className={cn("size-6", statusConfig.color)} />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-foreground text-lg font-semibold">
                    {resolution.status === "INSUFFICIENT"
                      ? "Insufficient Evidence"
                      : resolution.status
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Resolution for &ldquo;{resolution.subjectLabel}&rdquo; ·{" "}
                    {timeAgo(resolution.resolvedAt)}
                  </p>
                </div>
              </div>
            </Panel>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="border-border bg-background rounded-lg border p-4">
                <span className="text-muted-foreground text-xs font-medium">Total Evidence</span>
                <p className="text-foreground text-2xl font-bold">
                  {resolution.summary.totalEvidence}
                </p>
              </div>
              <div className="border-border bg-background rounded-lg border p-4">
                <span className="text-muted-foreground text-xs font-medium">Supporting</span>
                <p className="text-success text-2xl font-bold">
                  {resolution.summary.supportingEvidence}
                </p>
              </div>
              <div className="border-border bg-background rounded-lg border p-4">
                <span className="text-muted-foreground text-xs font-medium">Conflicting</span>
                <p className="text-destructive text-2xl font-bold">
                  {resolution.summary.conflictingEvidence}
                </p>
              </div>
              <div className="border-border bg-background rounded-lg border p-4">
                <span className="text-muted-foreground text-xs font-medium">Missing</span>
                <p className="text-warning text-2xl font-bold">
                  {resolution.summary.missingEvidence}
                </p>
              </div>
            </div>

            <div className="border-border flex gap-1 border-b">
              {(
                [
                  {
                    key: "supporting",
                    label: "Supporting",
                    count: resolution.supportingEvidence.length,
                  },
                  { key: "conflicting", label: "Conflicts", count: resolution.conflicts.length },
                  { key: "missing", label: "Missing", count: resolution.missingEvidence.length },
                  { key: "chains", label: "Chains", count: resolution.evidenceChains.length },
                  {
                    key: "traceability",
                    label: "Traceability",
                    count: resolution.traceabilityGraph.totalRecords,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                    activeTab === tab.key
                      ? "border-foreground text-foreground border-b-2"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {activeTab === "supporting" && (
              <Section title="Supporting Evidence">
                {resolution.supportingEvidence.length === 0 ? (
                  <Panel padding="md" className="text-muted-foreground text-center text-sm">
                    No supporting evidence found.
                  </Panel>
                ) : (
                  <Panel padding="none">
                    <Stack gap={0}>
                      {resolution.supportingEvidence.map((node) => (
                        <EvidenceNodeRow key={node.id} node={node} />
                      ))}
                    </Stack>
                  </Panel>
                )}
              </Section>
            )}

            {activeTab === "conflicting" && (
              <Section title="Conflicts Detected">
                {resolution.conflicts.length === 0 ? (
                  <Panel padding="md" className="text-muted-foreground text-center text-sm">
                    No conflicts detected.
                  </Panel>
                ) : (
                  <Stack gap={3}>
                    {resolution.conflicts.map((conflict) => (
                      <Panel
                        key={conflict.id}
                        padding="md"
                        className={cn("border-l-4", SEVERITY_COLORS[conflict.severity])}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle
                            className={cn("size-5 shrink-0", SEVERITY_COLORS[conflict.severity])}
                          />
                          <div className="flex flex-col gap-1">
                            <span className="text-foreground text-sm font-medium">
                              {conflict.label}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {conflict.description}
                            </span>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={cn(
                                  "rounded px-2 py-0.5 text-xs font-medium",
                                  SEVERITY_COLORS[conflict.severity],
                                )}
                              >
                                {conflict.severity}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {conflict.type.replace(/_/g, " ").toLowerCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Panel>
                    ))}
                  </Stack>
                )}
              </Section>
            )}

            {activeTab === "missing" && (
              <Section title="Missing Evidence">
                {resolution.missingEvidence.length === 0 ? (
                  <Panel padding="md" className="text-muted-foreground text-center text-sm">
                    No missing evidence detected.
                  </Panel>
                ) : (
                  <Stack gap={3}>
                    {resolution.missingEvidence.map((item) => (
                      <Panel
                        key={item.id}
                        padding="md"
                        className={cn("border-l-4", SEVERITY_COLORS[item.severity])}
                      >
                        <div className="flex items-start gap-3">
                          <XCircle
                            className={cn("size-5 shrink-0", SEVERITY_COLORS[item.severity])}
                          />
                          <div className="flex flex-col gap-1">
                            <span className="text-foreground text-sm font-medium">
                              {item.label}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {item.description}
                            </span>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={cn(
                                  "rounded px-2 py-0.5 text-xs font-medium",
                                  SEVERITY_COLORS[item.severity],
                                )}
                              >
                                {item.severity}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {item.type.replace(/_/g, " ").toLowerCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Panel>
                    ))}
                  </Stack>
                )}
              </Section>
            )}

            {activeTab === "chains" && (
              <Section title="Evidence Chains">
                {resolution.evidenceChains.length === 0 ? (
                  <Panel padding="md" className="text-muted-foreground text-center text-sm">
                    No evidence chains found.
                  </Panel>
                ) : (
                  <Stack gap={4}>
                    {resolution.evidenceChains.slice(0, 20).map((chain, idx) => (
                      <Panel key={idx} padding="md">
                        <div className="mb-3 flex items-center gap-2">
                          <GitBranch className="text-muted-foreground size-4" />
                          <span className="text-foreground text-sm font-medium">
                            Chain {idx + 1} · Depth {chain.totalDepth}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
                              {resolution.subjectLabel}
                            </span>
                          </div>
                          {chain.links.map((link, linkIdx) => (
                            <div key={linkIdx} className="flex flex-col gap-1 pl-4">
                              <span className="text-muted-foreground text-xs">
                                ↑ {link.relationType.replace(/_/g, " ").toLowerCase()}
                              </span>
                              <div className="flex items-center gap-2">
                                {link.node.entityId ? (
                                  <Link
                                    href={`/entities/${link.node.entityId}`}
                                    className="bg-muted text-muted-foreground hover:text-foreground rounded px-2 py-1 text-xs transition-colors"
                                  >
                                    {link.node.label}
                                  </Link>
                                ) : (
                                  <span className="bg-muted text-muted-foreground rounded px-2 py-1 text-xs">
                                    {link.node.label}
                                  </span>
                                )}
                                {link.node.documentName && (
                                  <span className="text-muted-foreground text-xs">
                                    · {link.node.documentName}
                                    {link.node.page ? ` p.${link.node.page}` : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Panel>
                    ))}
                  </Stack>
                )}
              </Section>
            )}

            {activeTab === "traceability" && (
              <Section title="Traceability Records">
                {resolution.traceabilityGraph.records.length === 0 ? (
                  <Panel padding="md" className="text-muted-foreground text-center text-sm">
                    No traceability records found.
                  </Panel>
                ) : (
                  <Panel padding="none">
                    <div className="border-border bg-muted/30 text-muted-foreground flex items-center gap-3 border-b px-4 py-2.5 text-xs font-medium tracking-wide uppercase">
                      <span className="flex-1">Entity</span>
                      <span className="flex-1">Document</span>
                      <span className="flex-1">Path</span>
                      <span className="min-w-[80px] text-right">Timestamp</span>
                    </div>
                    {resolution.traceabilityGraph.records.map((rec, idx) => (
                      <div
                        key={idx}
                        className="border-border hover:bg-surface-hover flex items-start gap-3 border-b px-4 py-3 transition-colors last:border-b-0"
                      >
                        <div className="flex flex-1 flex-col gap-0.5">
                          <span className="text-foreground text-sm font-medium">
                            {rec.entityName}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {rec.entityIdentifier} · v{rec.entityVersion} · {rec.entityStatus}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col gap-0.5">
                          {rec.documentName ? (
                            <>
                              <span className="text-foreground text-sm">{rec.documentName}</span>
                              <span className="text-muted-foreground text-xs">
                                v{rec.documentVersion}
                                {rec.page ? ` · p.${rec.page}` : ""}
                                {rec.section ? ` · ${rec.section}` : ""}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground text-xs">No document</span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-0.5">
                          {rec.relationshipPath.length > 0 ? (
                            <span className="text-muted-foreground text-xs">
                              {rec.relationshipPath.join(" → ")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Direct</span>
                          )}
                        </div>
                        <span className="text-muted-foreground min-w-[80px] text-right text-xs">
                          {timeAgo(rec.timestamp)}
                        </span>
                      </div>
                    ))}
                  </Panel>
                )}
              </Section>
            )}

            <Section title="Evidence Quality Indicators">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <QualityIndicator
                  label="Document Provenance"
                  present={resolution.qualityIndicators.hasDocumentProvenance}
                />
                <QualityIndicator
                  label="Version Info"
                  present={resolution.qualityIndicators.hasVersionInfo}
                />
                <QualityIndicator
                  label="Page References"
                  present={resolution.qualityIndicators.hasPageReferences}
                />
                <QualityIndicator
                  label="Extraction Source"
                  present={resolution.qualityIndicators.hasExtractionSource}
                />
              </div>
            </Section>
          </Stack>
        )}

        {!selectedEntity && !isEvaluating && entityResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted text-muted-foreground mb-4 flex size-16 items-center justify-center rounded-full">
              <ShieldCheck className="size-8" />
            </div>
            <p className="text-foreground text-lg font-medium">Evidence Resolution Engine</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Search for an engineering entity to evaluate its evidence.
            </p>
          </div>
        )}
      </Stack>
    </PageContainer>
  );
}

function EvidenceNodeRow({ node }: { node: EvidenceNode }) {
  return (
    <div className="hover:bg-surface-hover border-border flex items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0">
      <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
        {node.type === "DOCUMENT" || node.type === "EXTRACTED_FACT" ? (
          <FileText className="size-4" />
        ) : (
          <Tags className="size-4" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-foreground truncate text-sm font-medium">{node.label}</span>
        <span className="text-muted-foreground text-xs">
          {node.entityType ?? node.type}
          {node.version ? ` · v${node.version}` : ""}
          {node.status ? ` · ${node.status}` : ""}
        </span>
      </div>
      {node.documentName && (
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-muted-foreground text-xs">{node.documentName}</span>
          {node.page && <span className="text-muted-foreground text-xs">Page {node.page}</span>}
        </div>
      )}
    </div>
  );
}

function QualityIndicator({ label, present }: { label: string; present: boolean }) {
  return (
    <div className="border-border bg-background flex items-center gap-2 rounded-lg border p-3">
      {present ? (
        <CheckCircle2 className="text-success size-4" />
      ) : (
        <XCircle className="text-destructive size-4" />
      )}
      <span className="text-foreground text-sm">{label}</span>
    </div>
  );
}
