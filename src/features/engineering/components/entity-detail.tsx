"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  History,
  Share2,
  Bookmark,
  Network,
  FileText,
  GitBranch,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypeBadge } from "./type-badge";
import { StatusBadge } from "./status-badge";
import { EntityDetailSkeleton } from "./loading-state";
import { ErrorState } from "./error-state";
import { EngineeringPrecedent } from "@/features/precedents/types";

export interface Entity {
  id: string;
  identifier: string;
  name: string;
  description: string | null;
  entityType: string;
  status: string;
  version: string;
  tags: string[] | null;
  labels: Record<string, string> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string | null; email: string } | null;
  updatedBy: { id: string; name: string | null; email: string } | null;
}

interface EntityDetailProps {
  entityId: string;
  onEdit?: (entity: Entity) => void;
  onDelete?: () => void;
}

export function EntityDetail({ entityId, onEdit, onDelete }: EntityDetailProps) {
  const router = useRouter();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Historical Organizational Memory State
  const [relatedPrecedents, setRelatedPrecedents] = useState<EngineeringPrecedent[]>([]);
  const [isPrecedentsLoading, setIsPrecedentsLoading] = useState(false);
  const [selectedPrecId, setSelectedPrecId] = useState<string | null>(null);
  const [hasKeywordMatch, setHasKeywordMatch] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setError("");
      try {
        const res = await fetch(`/api/engineering/entities/${entityId}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push("/entities");
            return;
          }
          const err = await res.json();
          if (!cancelled) setError(err.error ?? "Failed to load");
          return;
        }
        const json = await res.json();
        if (!cancelled) setEntity(json.data);
      } catch {
        if (!cancelled) setError("Failed to load entity");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadData();
    return () => {
      cancelled = true;
    };
  }, [entityId, router, reloadKey]);

  useEffect(() => {
    if (!entity) return;
    let cancelled = false;
    const fetchPrecedents = async () => {
      setIsPrecedentsLoading(true);
      try {
        // Construct search query from entity details
        const searchTerms = [
          entity.name,
          ...(entity.tags || []),
          ...Object.values(entity.labels || {}),
        ]
          .filter(Boolean)
          .join(" ");

        const res = await fetch(`/api/precedents?search=${encodeURIComponent(searchTerms)}`);
        if (res.ok) {
          const json = await res.json();
          let matched = json.data || [];
          const directMatch = matched.length > 0;

          // Fallback to general/all precedents if no direct match was detected
          if (matched.length === 0) {
            const fallbackRes = await fetch("/api/precedents");
            if (fallbackRes.ok) {
              const fallbackJson = await fallbackRes.json();
              matched = fallbackJson.data || [];
            }
          }

          if (!cancelled) {
            setRelatedPrecedents(matched);
            setHasKeywordMatch(directMatch);
            if (matched.length > 0) {
              setSelectedPrecId(matched[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch matching precedents", err);
      } finally {
        if (!cancelled) setIsPrecedentsLoading(false);
      }
    };
    fetchPrecedents();
    return () => {
      cancelled = true;
    };
  }, [entity]);

  if (isLoading) return <EntityDetailSkeleton />;
  if (error) return <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />;
  if (!entity) {
    return (
      <ErrorState
        message="This entity could not be found or is no longer available."
        onRetry={() => setReloadKey((k) => k + 1)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/entities")}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-foreground text-2xl font-bold tracking-tight">{entity.name}</h1>
              <TypeBadge type={entity.entityType} size="md" />
              <StatusBadge status={entity.status} size="md" />
            </div>
            <p className="text-muted-foreground text-sm">
              {entity.identifier} &middot; v{entity.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="secondary" size="sm" onClick={() => onEdit(entity)}>
              <Edit3 className="mr-1.5 size-4" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="secondary"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="mr-1.5 size-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {entity.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm leading-relaxed">{entity.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <History className="size-4" />
              Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Created</span>
                <span>{new Date(entity.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Updated</span>
                <span>{new Date(entity.updatedAt).toLocaleDateString()}</span>
              </div>
              {entity.createdBy && (
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-xs">Created by</span>
                  <span>{entity.createdBy.name ?? entity.createdBy.email}</span>
                </div>
              )}
              {entity.updatedBy && (
                <div className="col-span-2">
                  <span className="text-muted-foreground block text-xs">Updated by</span>
                  <span>{entity.updatedBy.name ?? entity.updatedBy.email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Share2 className="size-4" />
              Relationships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={`/entities/${entity.id}?tab=relationships`}
              className="text-primary text-sm hover:underline"
            >
              View relationships
            </a>
          </CardContent>
        </Card>
      </div>

      {entity.tags && entity.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {entity.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-muted text-muted-foreground inline-flex rounded px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {entity.labels && Object.keys(entity.labels).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Labels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(entity.labels).map(([key, value]) => (
                <div key={key}>
                  <span className="text-muted-foreground block text-xs">{key}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Historical Context Section */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="text-foreground flex items-center gap-2 text-base font-bold">
              <History className="size-4 text-amber-500" />
              Related Historical Context & Lessons Learned
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              Institutional engineering memory matching this entity&apos;s design space and system
              profile.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-500">
              Deterministic Memory
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isPrecedentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500"></div>
            </div>
          ) : relatedPrecedents.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <HelpCircle className="text-muted-foreground mx-auto mb-2 size-8 opacity-50" />
              <p className="text-foreground text-sm font-semibold">
                No historical precedents found
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                There are no records in the organizational database for this design signature.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
              {/* Left Column: List of Matched Precedents */}
              <div className="space-y-3 lg:col-span-5">
                <div className="text-muted-foreground mb-2 font-mono text-[10px] font-bold tracking-widest uppercase">
                  {hasKeywordMatch
                    ? "HIGHLY RELEVANT PRECEDENTS"
                    : "GENERAL SYSTEM PRECEDENTS (FALLBACK)"}
                </div>
                <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
                  {relatedPrecedents.map((prec) => {
                    const isSelected = selectedPrecId === prec.id;
                    return (
                      <button
                        key={prec.id}
                        type="button"
                        onClick={() => setSelectedPrecId(prec.id)}
                        className={`group flex w-full flex-col gap-2 rounded-lg border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-amber-500/30 bg-amber-500/5 ring-1 ring-amber-500/20"
                            : "bg-background border-border hover:bg-zinc-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`line-clamp-1 text-xs font-bold transition-colors ${
                              isSelected
                                ? "text-amber-600"
                                : "text-foreground group-hover:text-amber-500"
                            }`}
                          >
                            {prec.title}
                          </span>
                          <ChevronRight
                            className={`size-3 shrink-0 transition-transform ${
                              isSelected
                                ? "translate-x-0.5 text-amber-500"
                                : "text-muted-foreground opacity-0 group-hover:opacity-100"
                            }`}
                          />
                        </div>

                        <p className="text-muted-foreground line-clamp-2 text-[11px]">
                          {prec.description}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider uppercase ${
                              prec.type === "FAILURE"
                                ? "bg-red-500/10 text-red-600"
                                : prec.type === "SUCCESSFUL_DESIGN"
                                  ? "bg-green-500/10 text-green-600"
                                  : prec.type === "REGULATORY_PRECEDENT"
                                    ? "bg-blue-500/10 text-blue-600"
                                    : "bg-purple-500/10 text-purple-600"
                            }`}
                          >
                            {prec.type.replace("_", " ")}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                              prec.resolutionStatus === "RESOLVED"
                                ? "text-green-600"
                                : prec.resolutionStatus === "MITIGATED"
                                  ? "text-amber-600"
                                  : "text-zinc-500"
                            }`}
                          >
                            <span
                              className={`size-1 rounded-full ${
                                prec.resolutionStatus === "RESOLVED"
                                  ? "bg-green-500"
                                  : prec.resolutionStatus === "MITIGATED"
                                    ? "bg-amber-500"
                                    : "bg-zinc-500"
                              }`}
                            />
                            {prec.resolutionStatus}
                          </span>

                          <span className="text-muted-foreground ml-auto font-mono text-[10px]">
                            Confidence: {Math.round(prec.confidenceScore * 100)}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Precedent Details & Rich Explainability */}
              <div className="rounded-xl border bg-zinc-50/20 p-5 lg:col-span-7">
                {(() => {
                  const prec = relatedPrecedents.find((p) => p.id === selectedPrecId);
                  if (!prec) return null;
                  return (
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between border-b pb-3.5">
                        <div className="flex flex-col gap-1 pr-6">
                          <span className="text-muted-foreground flex items-center gap-1 font-mono text-[9px] font-bold tracking-widest uppercase">
                            <Bookmark className="size-3 text-amber-500" />
                            Precedent Rationale
                          </span>
                          <h4 className="text-foreground text-sm font-bold">{prec.title}</h4>
                        </div>
                        <span
                          className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold ${
                            prec.type === "FAILURE"
                              ? "border-red-500/20 bg-red-500/5 text-red-600"
                              : prec.type === "SUCCESSFUL_DESIGN"
                                ? "border-green-500/20 bg-green-500/5 text-green-600"
                                : prec.type === "REGULATORY_PRECEDENT"
                                  ? "border-blue-500/20 bg-blue-500/5 text-blue-600"
                                  : "border-purple-500/20 bg-purple-500/5 text-purple-600"
                          }`}
                        >
                          {prec.type.replace("_", " ")}
                        </span>
                      </div>

                      {/* Relevance description */}
                      <div>
                        <span className="text-muted-foreground mb-1 block font-mono text-[10px] font-semibold">
                          RELEVANCE ANALYSIS
                        </span>
                        <div className="text-foreground rounded-lg border border-amber-500/10 bg-amber-500/5 p-3 text-xs leading-relaxed">
                          {prec.whyRelevant ||
                            "Direct match discovered based on system context overlap."}
                        </div>
                      </div>

                      {/* Abstract / Problem description */}
                      <div>
                        <span className="text-muted-foreground mb-1 block font-mono text-[10px] font-semibold">
                          ABSTRACT
                        </span>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {prec.description}
                        </p>
                      </div>

                      {/* Root cause and corrective action */}
                      {prec.rootCause && (
                        <div className="grid grid-cols-1 gap-4 border-t pt-3.5 md:grid-cols-2">
                          <div className="rounded-lg border border-red-500/10 bg-red-500/5 p-3">
                            <span className="mb-1 block font-mono text-[10px] font-bold tracking-wider text-red-600 uppercase">
                              Root Cause
                            </span>
                            <p className="text-foreground text-xs leading-relaxed">
                              {prec.rootCause}
                            </p>
                          </div>
                          {prec.correctiveAction && (
                            <div className="rounded-lg border border-green-500/10 bg-green-500/5 p-3">
                              <span className="mb-1 block font-mono text-[10px] font-bold tracking-wider text-green-600 uppercase">
                                Corrective Action
                              </span>
                              <p className="text-foreground text-xs leading-relaxed">
                                {prec.correctiveAction}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Strength Ratings */}
                      <div className="border-t pt-3.5">
                        <span className="text-muted-foreground mb-2 block font-mono text-[10px] font-semibold">
                          STRENGTH RATINGS
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="border-border bg-background rounded-lg border p-2.5">
                            <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[10px] font-medium">
                              <ShieldCheck className="size-3.5 text-amber-500" />
                              <span>CONFIDENCE SCORE</span>
                            </div>
                            <span className="text-foreground font-mono text-base font-extrabold">
                              {Math.round(prec.confidenceScore * 100)}%
                            </span>
                          </div>
                          <div className="border-border bg-background rounded-lg border p-2.5">
                            <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[10px] font-medium">
                              <ShieldAlert className="size-3.5 text-blue-500" />
                              <span>EVIDENCE STRENGTH</span>
                            </div>
                            <span className="text-foreground font-mono text-base font-extrabold">
                              {Math.round((prec.evidenceStrength ?? prec.confidenceScore) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Assumptions Rejected */}
                      {prec.assumptionsRejected && prec.assumptionsRejected.length > 0 && (
                        <div className="border-t pt-3.5">
                          <span className="text-muted-foreground mb-2 block font-mono text-[10px] font-semibold">
                            ASSUMPTIONS REJECTED / DEBUNKED
                          </span>
                          <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-3">
                            <ul className="space-y-1.5">
                              {prec.assumptionsRejected.map((as, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-xs text-red-700"
                                >
                                  <span className="shrink-0 font-bold text-red-500">✕</span>
                                  <span>{as}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Knowledge Graph Traversed Paths */}
                      {prec.graphRelationshipsTraversed &&
                        prec.graphRelationshipsTraversed.length > 0 && (
                          <div className="border-t pt-3.5">
                            <span className="text-muted-foreground mb-2 block font-mono text-[10px] font-semibold">
                              KNOWLEDGE GRAPH PATHS TRAVERSED
                            </span>
                            <div className="space-y-1">
                              {prec.graphRelationshipsTraversed.map((path, idx) => (
                                <div
                                  key={idx}
                                  className="bg-muted/40 text-foreground flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[10px] leading-tight"
                                >
                                  <Network className="text-muted-foreground size-3.5 shrink-0" />
                                  <span>{path}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Verifiable Evidence Chains */}
                      {prec.evidenceMetadata && (
                        <div className="border-t pt-3.5">
                          <span className="text-muted-foreground mb-2 block font-mono text-[10px] font-semibold">
                            VERIFIABLE EVIDENCE CHAINS
                          </span>
                          <div className="space-y-1.5">
                            {prec.evidenceMetadata.documents?.map((doc) => (
                              <div
                                key={doc}
                                className="text-foreground bg-background flex items-center gap-2 rounded border px-2.5 py-1.5 text-xs"
                              >
                                <FileText className="size-3.5 shrink-0 text-blue-500" />
                                <span className="truncate font-medium">{doc}</span>
                                <span className="ml-auto rounded bg-green-500/10 px-1 py-0.5 font-mono text-[9px] text-green-600">
                                  VERIFIED
                                </span>
                              </div>
                            ))}
                            {prec.evidenceMetadata.standards?.map((std) => (
                              <div
                                key={std}
                                className="text-foreground bg-background flex items-center gap-2 rounded border px-2.5 py-1.5 text-xs"
                              >
                                <GitBranch className="size-3.5 shrink-0 text-purple-500" />
                                <span className="truncate font-medium">{std}</span>
                                <span className="ml-auto rounded bg-purple-500/10 px-1 py-0.5 font-mono text-[9px] font-semibold text-purple-600">
                                  STANDARD
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Audit Trail */}
                      {prec.auditTrail && prec.auditTrail.length > 0 && (
                        <div className="border-t pt-3.5">
                          <span className="text-muted-foreground mb-2 block font-mono text-[10px] font-semibold">
                            AUDIT TRAIL & HISTORY
                          </span>
                          <div className="relative space-y-3.5 border-l pl-3">
                            {prec.auditTrail.map((log) => (
                              <div key={log.id} className="relative text-[11px]">
                                <div className="border-background absolute top-1 -left-[16.5px] size-2 rounded-full border bg-amber-500 shadow-sm" />
                                <div className="flex flex-col">
                                  <span className="text-foreground font-bold">
                                    {log.action.replace("_", " ")}
                                  </span>
                                  <span className="text-muted-foreground mt-0.5 flex items-center gap-1 font-mono text-[9px]">
                                    <Clock className="size-3" />
                                    {new Date(log.createdAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
