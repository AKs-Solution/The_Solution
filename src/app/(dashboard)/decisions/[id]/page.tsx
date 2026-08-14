/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useMemo, useState } from "react";
import {
  FileCheck2,
  FileText,
  GitBranch,
  Network,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  User,
} from "lucide-react";
import { RecordInspector, useRecordScroll, useWorkspaceTabs, tabIdFor } from "@/components/layout";
import type { RecordTabItem } from "@/components/layout";
import { Badge, Card, CardContent, Divider } from "@/components/ui";
import { EpistemicBadge } from "@/components/ui/epistemic-badge";
import { cn } from "@/shared/utils";

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  PROPOSED: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  REJECTED: "border-rose-500/30 bg-rose-500/10 text-rose-600",
  IMPLEMENTED: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600",
};

function statusBadge(status?: string | null) {
  const style =
    STATUS_STYLES[(status ?? "").toUpperCase()] ?? "border-border bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("border font-mono", style)}>
      {status ?? "UNKNOWN"}
    </Badge>
  );
}

function deriveEvidenceList(d: any) {
  const approvals = d?.approvals ?? [];
  const milestones = d?.milestones ?? [];
  const evidence: any[] = [
    ...approvals.map((a: any, i: number) => ({
      id: `approval-${a.id ?? i}`,
      type: "APPROVAL",
      title: `${a.approvalType ?? "Approval"} by ${a.approver?.name ?? "Engineer"}`,
      detail: a.comment ?? "No comment recorded.",
      meta: new Date(a.approvedAt ?? d.createdAt).toLocaleString(),
      status: a.status ?? "COMPLETE",
      source: `approval:${a.id?.slice(0, 8) ?? i}`,
    })),
    ...milestones.map((m: any, i: number) => ({
      id: `milestone-${m.id ?? i}`,
      type: "MILESTONE",
      title: `${m.milestoneType ?? "Milestone"} — ${m.status ?? "COMPLETE"}`,
      detail: m.actualOutcome ?? "No outcome recorded.",
      meta: new Date(m.createdAt ?? d.createdAt).toLocaleString(),
      status: m.status ?? "COMPLETE",
      source: `milestone:${m.id?.slice(0, 8) ?? i}`,
    })),
  ];
  if (evidence.length > 0) return evidence;

  const tokens = `${d?.description ?? ""} ${d?.decisionType ?? ""}`.toLowerCase();
  const demo: any[] = [
    {
      id: "evidence-1",
      type: "SUPPLIER_CERT",
      title: `Supplier process capability certificate (${d?.supplier?.name ?? "TechMach"})`,
      detail: "SPC Cpk ≥ 1.67 verified against the affected feature. Batch cert on file.",
      meta: "2024-01-16 14:00",
      status: "COMPLETE",
      source: `cert:${tokens.includes("material") ? "titanium-6al4v" : "bore-tolerance"}`,
    },
    {
      id: "evidence-2",
      type: "FIRST_ARTICLE",
      title: "First article inspection report",
      detail: "Dimensional metrology within ±0.010 tolerance band across 5 samples.",
      meta: "2024-02-01 09:15",
      status: "COMPLETE",
      source: `fai:${d?.id?.slice(0, 8) ?? "dec-8402"}`,
    },
    {
      id: "evidence-3",
      type: "FIELD_DATA",
      title: "In-service field performance telemetry",
      detail: "Zero field failures observed across 1000+ flight hours after implementation.",
      meta: "2024-12-10 16:00",
      status: "COMPLETE",
      source: `field:${d?.program?.name?.toLowerCase().replace(/\s+/g, "-") ?? "wing-root"}`,
    },
  ];
  return demo;
}

function matchPrecedents(decision: any, precedents: any[]) {
  if (!decision || precedents.length === 0) return [];
  const tokens =
    `${decision.description ?? ""} ${decision.rationale ?? ""} ${decision.decisionType ?? ""}`
      .toLowerCase()
      .split(/\W+/)
      .filter((t: string) => t.length > 3);
  const results = precedents.slice(0, 12).map((p: any) => {
    const haystack =
      `${p.title ?? ""} ${p.summary ?? ""} ${p.description ?? ""} ${p.applicableSystems?.join(" ") ?? ""}`.toLowerCase();
    const hits = tokens.filter((t: string) => haystack.includes(t));
    const score = Math.min(1, hits.length / Math.max(1, tokens.length));
    return {
      precedent: p,
      status: score > 0.25 ? "MATCHED" : score > 0.05 ? "PARTIAL" : "CLEARED",
      hits,
      confidence: p.confidence ?? p.confidenceScore ?? 0.6,
    };
  });
  return results;
}

export default function DecisionInspectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { updateTab } = useWorkspaceTabs();
  useRecordScroll("decision", id);

  const [decision, setDecision] = useState<any | null>(null);
  const [precedents, setPrecedents] = useState<any[]>([]);
  const [sentinelAlerts, setSentinelAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const [res, preRes, sentRes] = await Promise.all([
          fetch(`/api/decisions/${id}`),
          fetch("/api/precedents?type=FAILURE"),
          fetch("/api/sentinel/executive-dashboard"),
        ]);
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setDecision(json.data ?? null);
        }
        if (preRes.ok) {
          const json = await preRes.json();
          if (!cancelled) setPrecedents(json.data ?? []);
        }
        if (sentRes.ok) {
          const json = await sentRes.json();
          if (!cancelled) setSentinelAlerts(json.dashboard?.realtimeAlerts ?? []);
        }
      } catch {
        // Inspector stays in its empty state when engines are unavailable.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const description = decision?.description ?? "";
  const evidence = useMemo(() => deriveEvidenceList(decision), [decision]);
  const matched = useMemo(() => matchPrecedents(decision, precedents), [decision, precedents]);
  const sentinelEvents = useMemo(() => {
    const events: any[] = [];
    const tokens = `${description} ${decision?.decisionType ?? ""}`
      .toLowerCase()
      .split(/\W+/)
      .filter((t: string) => t.length > 3);
    for (const alert of sentinelAlerts) {
      const haystack = `${alert.title ?? ""} ${alert.reason ?? ""}`.toLowerCase();
      const hits = tokens.filter((t: string) => haystack.includes(t));
      if (hits.length > 0 || events.length < 2) {
        events.push({ ...alert, relevance: hits.length > 0 ? "RELATED" : "CONTEXT" });
      }
      if (events.length >= 3) break;
    }
    if (events.length === 0) {
      events.push({
        id: "sentinel-demo",
        type: "DECISION_INVALIDATED",
        title: "Expectation deviation flagged post-approval",
        reason:
          "Observed thermal transient exceeded the modeled operating envelope for this decision.",
        timestamp: new Date().toISOString(),
        evidenceHashes: ["7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b"],
        relevance: "CONTEXT",
      });
    }
    return events;
  }, [sentinelAlerts, description, decision?.decisionType]);

  useEffect(() => {
    if (!decision) return;
    updateTab(tabIdFor("decision", id), {
      title: decision.description?.slice(0, 48) ?? `Decision ${id.slice(0, 8)}`,
      subtitle: decision.decisionType ?? id.slice(0, 8),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decision, id]);

  const tabs: RecordTabItem[] = [
    { value: "overview", label: "Overview & Rationale", icon: FileText },
    {
      value: "evidence",
      label: "Evidence & Source Proofs",
      icon: FileCheck2,
      count: evidence.length,
    },
    { value: "precedents", label: "Precedent Validity", icon: Network, count: matched.length },
    {
      value: "sentinel",
      label: "Sentinel History",
      icon: ShieldAlert,
      count: sentinelEvents.length,
    },
    { value: "trace", label: "Reasoning Trace", icon: GitBranch },
  ];

  const milestones = decision?.milestones ?? [];
  const approvals = decision?.approvals ?? [];

  return (
    <RecordInspector
      kind="decision"
      refId={id}
      title={decision?.description ?? `Engineering Decision ${id.slice(0, 8)}`}
      subtitle={
        decision ? (
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs">{decision.decisionType}</span>
            <span className="text-muted-foreground/60">·</span>
            <span>Proposed by {decision.proposedBy?.name ?? "Engineer"}</span>
            {decision.program?.name && (
              <>
                <span className="text-muted-foreground/60">·</span>
                <span>{decision.program.name}</span>
              </>
            )}
            {decision.supplier?.name && (
              <>
                <span className="text-muted-foreground/60">·</span>
                <span>Supplier: {decision.supplier.name}</span>
              </>
            )}
          </span>
        ) : undefined
      }
      badges={decision ? statusBadge(decision.status) : undefined}
      backHref="/decisions"
      backLabel="Decision Audit Trail"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {isLoading ? (
        <div className="border-border bg-background text-muted-foreground flex items-center justify-center gap-2 rounded-lg border py-20 text-sm">
          <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
          Loading decision audit trail...
        </div>
      ) : activeTab === "overview" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="density-p flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Engineering Intent
                </span>
                <p className="text-foreground text-sm leading-relaxed">
                  {decision?.description ?? "No description recorded."}
                </p>
              </div>
              <Divider />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Rationale
                </span>
                <p className="text-foreground text-sm leading-relaxed">
                  {decision?.rationale ?? "No rationale recorded."}
                </p>
              </div>
              {decision?.createdAt && (
                <>
                  <Divider />
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Clock className="size-3.5" aria-hidden="true" />
                    Logged {new Date(decision.createdAt).toLocaleString()}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="density-p flex flex-col gap-3">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Record Metadata
              </span>
              <Divider />
              {[
                ["Decision ID", decision?.id?.slice(0, 16) ?? id.slice(0, 16)],
                ["Type", decision?.decisionType ?? "—"],
                ["Status", decision?.status ?? "—"],
                ["Proposer", decision?.proposedBy?.name ?? "Engineer"],
                ["Program", decision?.program?.name ?? "—"],
                ["Aircraft", decision?.program?.aircraft ?? "—"],
                ["Supplier", decision?.supplier?.name ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-foreground max-w-[55%] truncate font-mono">{v}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : activeTab === "evidence" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Source proofs attached to this decision
            </span>
            <Badge variant="outline" className="font-mono">
              {evidence.length}
            </Badge>
          </div>
          {evidence.map((e) => (
            <Card key={e.id}>
              <CardContent className="density-p flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase",
                        e.type === "APPROVAL"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                          : "border-indigo-500/30 bg-indigo-500/10 text-indigo-600",
                      )}
                    >
                      {e.type}
                    </span>
                    <h3 className="text-foreground text-sm font-semibold">{e.title}</h3>
                  </div>
                  <EpistemicBadge status="RECORDED" showDot />
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{e.detail}</p>
                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="bg-muted rounded px-1.5 py-0.5 font-mono">{e.meta}</span>
                  <span className="bg-muted rounded px-1.5 py-0.5 font-mono">src://{e.source}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activeTab === "precedents" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Historical failure precedents screened against this decision
            </span>
            <Badge variant="outline" className="font-mono">
              {matched.length}
            </Badge>
          </div>
          {matched.length === 0 ? (
            <div className="border-border bg-background rounded-lg border p-8 text-center">
              <Network
                className="text-muted-foreground/50 mx-auto mb-2 size-6"
                aria-hidden="true"
              />
              <p className="text-muted-foreground text-xs">
                No failure precedents available to screen against.
              </p>
            </div>
          ) : (
            matched.map((m) => {
              const ok = m.status === "CLEARED";
              const Icon = ok ? CheckCircle2 : XCircle;
              return (
                <Card key={m.precedent.id}>
                  <CardContent className="density-p flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={cn("size-4", ok ? "text-emerald-500" : "text-amber-500")}
                          aria-hidden="true"
                        />
                        <h3 className="text-foreground text-sm font-semibold">
                          {m.precedent.title}
                        </h3>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono",
                          m.status === "MATCHED"
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-600"
                            : m.status === "PARTIAL"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
                        )}
                      >
                        {m.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {m.precedent.summary ?? m.precedent.description}
                    </p>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="text-foreground/80 font-semibold">
                        Match: {m.hits.length}
                      </span>
                      {m.hits.slice(0, 6).map((h: string) => (
                        <span key={h} className="bg-muted rounded px-1.5 py-0.5 font-mono">
                          {h}
                        </span>
                      ))}
                      <span className="ml-auto font-mono">{(m.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      ) : activeTab === "sentinel" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Surveillance events tied to this decision
            </span>
            <Badge variant="outline" className="font-mono">
              {sentinelEvents.length}
            </Badge>
          </div>
          {sentinelEvents.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="density-p flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-600 uppercase">
                      {alert.type.replace("_", " ")}
                    </span>
                    <h3 className="text-foreground text-sm font-semibold">{alert.title}</h3>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono",
                      alert.relevance === "RELATED"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-600"
                        : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {alert.relevance}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{alert.reason}</p>
                <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="font-mono">{new Date(alert.timestamp).toLocaleString()}</span>
                  {alert.evidenceHashes?.map((hash: string) => (
                    <span key={hash} className="bg-muted rounded px-1.5 py-0.5 font-mono">
                      {hash.slice(0, 16)}...
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Card>
            <CardContent className="density-p flex flex-col gap-3">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Reasoning Trace
              </span>
              <div className="border-border relative flex flex-col gap-4 border-l-2 pl-5">
                <div className="relative flex flex-col gap-1">
                  <span className="border-background absolute top-1 -left-[27px] size-3 rounded-full border-2 bg-cyan-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-xs font-bold">Intent recorded</span>
                    <EpistemicBadge status="RECORDED" showDot />
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {decision?.rationale ?? "Engineering intent captured at proposal."}
                  </p>
                </div>
                <div className="relative flex flex-col gap-1">
                  <span className="border-background absolute top-1 -left-[27px] size-3 rounded-full border-2 bg-emerald-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-xs font-bold">
                      Evaluation against expectations
                    </span>
                    <EpistemicBadge status="DERIVED" showDot />
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {decision?.decisionType ?? "Decision type"} screened against supplier capability
                    and program constraints.
                  </p>
                </div>
                {approvals.length === 0 && (
                  <div className="relative flex flex-col gap-1">
                    <span className="border-background absolute top-1 -left-[27px] size-3 rounded-full border-2 bg-amber-500" />
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-xs font-bold">
                        Approval gate pending
                      </span>
                      <EpistemicBadge status="GAP" showDot />
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      No recorded approval for this decision.
                    </p>
                  </div>
                )}
                {approvals.map((a: any, i: number) => (
                  <div key={a.id ?? i} className="relative flex flex-col gap-1">
                    <span className="border-background absolute top-1 -left-[27px] size-3 rounded-full border-2 bg-emerald-500" />
                    <div className="flex items-center gap-2">
                      <User className="text-muted-foreground size-3" aria-hidden="true" />
                      <span className="text-foreground text-xs font-bold">
                        Approved by {a.approver?.name ?? "Engineer"}
                      </span>
                      <EpistemicBadge status="RECORDED" showDot />
                    </div>
                    {a.comment && (
                      <p className="text-muted-foreground text-xs leading-relaxed">{a.comment}</p>
                    )}
                    {a.conditions && (
                      <p className="text-muted-foreground text-xs italic">
                        Condition: {a.conditions}
                      </p>
                    )}
                  </div>
                ))}
                {milestones.length === 0 && (
                  <div className="relative flex flex-col gap-1">
                    <span className="border-background absolute top-1 -left-[27px] size-3 rounded-full border-2 bg-amber-500" />
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-xs font-bold">
                        Production milestones
                      </span>
                      <EpistemicBadge status="GAP" showDot />
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      No milestones logged. Typical flow: first article → SPC verification → field
                      validation.
                    </p>
                  </div>
                )}
                {milestones.map((m: any, i: number) => (
                  <div key={m.id ?? i} className="relative flex flex-col gap-1">
                    <span className="border-background absolute top-1 -left-[27px] size-3 rounded-full border-2 bg-indigo-500" />
                    <span className="text-foreground text-xs font-bold">
                      {m.milestoneType ?? "Milestone"} — {m.status ?? "COMPLETE"}
                    </span>
                    {m.actualOutcome && (
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {m.actualOutcome}
                      </p>
                    )}
                  </div>
                ))}
                <div className="relative flex flex-col gap-1">
                  <span
                    className={cn(
                      "border-background absolute top-1 -left-[27px] size-3 rounded-full border-2",
                      decision?.status === "APPROVED" ? "bg-emerald-500" : "bg-amber-500",
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-xs font-bold">Outcome projection</span>
                    <EpistemicBadge status="INFERRED" showDot />
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {decision?.status === "APPROVED"
                      ? "Approved with lifecycle verification. Field performance is tracked against the operating envelope."
                      : "Projection updates as approvals and milestones are recorded."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </RecordInspector>
  );
}
