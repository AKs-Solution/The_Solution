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
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  RecordInspector,
  useRecordScroll,
  useWorkspaceTabs,
  tabIdFor,
} from "@/components/layout";
import type { RecordTabItem } from "@/components/layout";
import { Badge, Card, CardContent, Divider } from "@/components/ui";
import { EpistemicBadge } from "@/components/ui/epistemic-badge";
import { cn } from "@/shared/utils";

const CHANGE_TYPE_STYLES: Record<string, string> = {
  DIMENSION: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  NOTE: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  MATERIAL: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  TOLERANCE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CALL: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function changeTypeBadge(type?: string | null) {
  const style = CHANGE_TYPE_STYLES[(type ?? "").toUpperCase()] ?? "border-border bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("border font-mono", style)}>
      {type ?? "CHANGE"}
    </Badge>
  );
}

export default function DrawingInspectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { updateTab } = useWorkspaceTabs();
  useRecordScroll("drawing", id);

  const [job, setJob] = useState<any | null>(null);
  const [precedents, setPrecedents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const [res, preRes, sentRes] = await Promise.all([
          fetch(`/api/drawings/comparisons/${id}`),
          fetch("/api/precedents?type=FAILURE"),
          fetch("/api/sentinel/executive-dashboard"),
        ]);
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setJob(json.data ?? null);
        }
        if (preRes.ok) {
          const json = await preRes.json();
          if (!cancelled) setPrecedents(json.data ?? []);
        }
        if (sentRes.ok) {
          const json = await sentRes.json();
          if (!cancelled) setAlerts(json.dashboard?.realtimeAlerts ?? []);
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

  const changes = job?.changes ?? [];
  const dimsCount = changes.filter((c: any) => c.changeType === "DIMENSION").length;

  const matchedPrecedents = useMemo(() => {
    if (changes.length === 0) return [];
    const tokens = changes
      .flatMap((c: any) => [c.category, c.description, c.oldValue, c.newValue, c.manufacturingImpact])
      .join(" ")
      .toLowerCase()
      .split(/\W+/)
      .filter((t: string) => t.length > 3);
    return precedents.slice(0, 12).map((p: any) => {
      const haystack = `${p.title ?? ""} ${p.summary ?? ""} ${p.description ?? ""} ${p.applicableSystems?.join(" ") ?? ""}`.toLowerCase();
      const hits = tokens.filter((t: string) => haystack.includes(t));
      return {
        precedent: p,
        hits,
        status: hits.length > 0 ? "MATCHED" : "CLEARED",
        confidence: p.confidence ?? p.confidenceScore ?? 0.6,
      };
    });
  }, [changes, precedents]);

  useEffect(() => {
    if (!job) return;
    const revLabel =
      job.revB?.revisionLabel && job.revA?.revisionLabel
        ? `${job.revA.revisionLabel} → ${job.revB.revisionLabel}`
        : `Job ${id.slice(0, 8)}`;
    updateTab(tabIdFor("drawing", id), {
      title: `Drawing Inspection ${id.slice(0, 8)}`,
      subtitle: revLabel,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job, id]);

  const tabs: RecordTabItem[] = [
    { value: "overview", label: "Overview & Rationale", icon: FileText },
    { value: "evidence", label: "Evidence & Source Proofs", icon: FileCheck2, count: changes.length },
    { value: "precedents", label: "Precedent Validity", icon: Network, count: matchedPrecedents.length },
    { value: "sentinel", label: "Sentinel History", icon: ShieldAlert, count: alerts.length },
    { value: "trace", label: "Reasoning Trace", icon: GitBranch },
  ];

  if (!isLoading && !job) {
    return (
      <RecordInspector
        kind="drawing"
        refId={id}
        title={`Drawing Inspection ${id.slice(0, 8)}`}
        backHref="/drawings"
        backLabel="Drawing Intelligence"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="border-border bg-background flex flex-col items-center gap-2 rounded-lg border py-20 text-sm text-muted-foreground">
          <Layers className="size-6 opacity-50" aria-hidden="true" />
          <p>Drawing inspection job not found.</p>
        </div>
      </RecordInspector>
    );
  }

  return (
    <RecordInspector
      kind="drawing"
      refId={id}
      title={`Drawing Inspection ${id.slice(0, 8)}`}
      subtitle={
        job ? (
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs">
              {job.revA?.revisionLabel ?? "Rev A"} → {job.revB?.revisionLabel ?? "Rev B"}
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span>{changes.length} detected changes</span>
            <span className="text-muted-foreground/60">·</span>
            <span>{dimsCount} dimension changes</span>
          </span>
        ) : undefined
      }
      badges={job ? <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 font-mono text-emerald-600 dark:text-emerald-400">READY</Badge> : undefined}
      backHref="/drawings"
      backLabel="Drawing Intelligence"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {isLoading ? (
        <div className="border-border bg-background flex items-center justify-center gap-2 rounded-lg border py-20 text-sm text-muted-foreground">
          <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
          Loading drawing inspection...
        </div>
      ) : activeTab === "overview" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="density-p flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md border border-indigo-500/20 bg-indigo-500/10 text-indigo-500">
                  <Layers className="size-4" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                    Revision Comparison Rationale
                  </span>
                  <span className="text-foreground text-sm font-bold">
                    {changes.length > 0
                      ? `${changes.length} engineering changes require disposition.`
                      : "No engineering changes detected between revisions."}
                  </span>
                </div>
              </div>
              <Divider />
              <p className="text-muted-foreground text-xs leading-relaxed">
                Each detected change is screened against manufacturing capability and inspection
                requirements. Dimensional changes receive the highest scrutiny due to interface
                fit risk.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Total Changes", value: changes.length, tone: "text-foreground" },
                  { label: "Dimensions", value: dimsCount, tone: "text-indigo-500" },
                  { label: "Materials", value: changes.filter((c: any) => c.changeType === "MATERIAL").length, tone: "text-amber-500" },
                  { label: "Notes", value: changes.filter((c: any) => c.changeType === "NOTE").length, tone: "text-cyan-500" },
                ].map((s) => (
                  <div key={s.label} className="border-border rounded-lg border p-3">
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                      {s.label}
                    </span>
                    <div className={cn("mt-1 text-xl font-bold", s.tone)}>{s.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="density-p flex flex-col gap-3">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Inspection Metadata
              </span>
              <Divider />
              {[
                ["Job ID", id.slice(0, 16)],
                ["Revision A", job?.revA?.drawingNumber ?? "—"],
                ["Revision B", job?.revB?.drawingNumber ?? "—"],
                ["Status", job?.status ?? "READY"],
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
              Detected changes as source proofs
            </span>
            <Badge variant="outline" className="font-mono">{changes.length}</Badge>
          </div>
          {changes.length === 0 ? (
            <div className="border-border bg-background rounded-lg border p-8 text-center">
              <FileCheck2 className="text-muted-foreground/50 mx-auto mb-2 size-6" aria-hidden="true" />
              <p className="text-muted-foreground text-xs">No drawing changes detected.</p>
            </div>
          ) : (
            changes.map((c: any) => (
              <Card key={c.id}>
                <CardContent className="density-p flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {changeTypeBadge(c.changeType)}
                      <h3 className="text-foreground text-sm font-semibold">{c.category}</h3>
                    </div>
                    <EpistemicBadge status="RECORDED" showDot />
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{c.description}</p>
                  <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-muted/40 p-2.5 font-mono text-xs">
                    <div>
                      <span className="text-muted-foreground mb-0.5 block text-[9px] uppercase">
                        {job?.revA?.revisionLabel ?? "Rev A"}
                      </span>
                      <span className="text-muted-foreground line-through">{c.oldValue || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground mb-0.5 block text-[9px] uppercase">
                        {job?.revB?.revisionLabel ?? "Rev B"}
                      </span>
                      <span className="text-foreground font-bold">{c.newValue || "N/A"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-md border border-indigo-500/20 bg-indigo-500/5 p-2.5">
                      <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                        Manufacturing Impact
                      </span>
                      <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                        {c.manufacturingImpact || "Unable to determine."}
                      </p>
                    </div>
                    <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                      <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                        Quality Impact
                      </span>
                      <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                        {c.qualityImpact || "Unable to determine."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : activeTab === "precedents" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Historical failure precedents screened against change content
            </span>
            <Badge variant="outline" className="font-mono">{matchedPrecedents.length}</Badge>
          </div>
          {matchedPrecedents.length === 0 ? (
            <div className="border-border bg-background rounded-lg border p-8 text-center">
              <Network className="text-muted-foreground/50 mx-auto mb-2 size-6" aria-hidden="true" />
              <p className="text-muted-foreground text-xs">
                No failure precedents available to screen against.
              </p>
            </div>
          ) : (
            matchedPrecedents.map((m) => (
              <Card key={m.precedent.id}>
                <CardContent className="density-p flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-foreground text-sm font-semibold">{m.precedent.title}</h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-mono",
                        m.status === "MATCHED"
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {m.precedent.summary ?? m.precedent.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                    {m.hits.slice(0, 6).map((h: string) => (
                      <span key={h} className="bg-muted rounded px-1.5 py-0.5 font-mono">{h}</span>
                    ))}
                    <span className="ml-auto font-mono">{(m.confidence * 100).toFixed(0)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : activeTab === "sentinel" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Active surveillance events
            </span>
            <Badge variant="outline" className="font-mono">{alerts.length}</Badge>
          </div>
          {alerts.length === 0 ? (
            <div className="border-border bg-background rounded-lg border p-8 text-center">
              <ShieldAlert className="text-muted-foreground/50 mx-auto mb-2 size-6" aria-hidden="true" />
              <p className="text-muted-foreground text-xs">No active sentinel alerts.</p>
            </div>
          ) : (
            alerts.slice(0, 5).map((a: any) => (
              <Card key={a.id}>
                <CardContent className="density-p flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase">
                      {a.type.replace("_", " ")}
                    </span>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {new Date(a.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-foreground text-sm font-semibold">{a.title}</h3>
                  <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">{a.reason}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="density-p flex flex-col gap-3">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Change Disposition Reasoning Trace
            </span>
            <div className="relative flex flex-col gap-4 border-l-2 border-border pl-5">
              <div className="relative flex flex-col gap-1">
                <span className="absolute top-1 -left-[27px] size-3 rounded-full border-2 border-background bg-cyan-500" />
                <div className="flex items-center gap-2">
                  <Layers className="text-muted-foreground size-3" aria-hidden="true" />
                  <span className="text-foreground text-xs font-bold">Revision diff captured</span>
                  <EpistemicBadge status="RECORDED" showDot />
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {job?.revA?.revisionLabel ?? "Rev A"} vs {job?.revB?.revisionLabel ?? "Rev B"} sheets
                  vectorized and diffed across {changes.length} features.
                </p>
              </div>
              <div className="relative flex flex-col gap-1">
                <span className="absolute top-1 -left-[27px] size-3 rounded-full border-2 border-background bg-emerald-500" />
                <div className="flex items-center gap-2">
                  <ArrowRight className="text-muted-foreground size-3" aria-hidden="true" />
                  <span className="text-foreground text-xs font-bold">Old value → New value</span>
                  <EpistemicBadge status="DERIVED" showDot />
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {changes.length} value transitions screened for interface fit and tolerance
                  compliance.
                </p>
              </div>
              <div className="relative flex flex-col gap-1">
                <span className="absolute top-1 -left-[27px] size-3 rounded-full border-2 border-background bg-amber-500" />
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-muted-foreground size-3" aria-hidden="true" />
                  <span className="text-foreground text-xs font-bold">Manufacturing & quality impact</span>
                  <EpistemicBadge status="INFERRED" showDot />
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Each change mapped to manufacturing capability and inspection requirements for
                  disposition.
                </p>
              </div>
              <div className="relative flex flex-col gap-1">
                <span className="absolute top-1 -left-[27px] size-3 rounded-full border-2 border-background bg-rose-500" />
                <div className="flex items-center gap-2">
                  <FileCheck2 className="text-muted-foreground size-3" aria-hidden="true" />
                  <span className="text-foreground text-xs font-bold">Disposition pending</span>
                  <EpistemicBadge status="GAP" showDot />
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Approved revisions should be logged against the drawing record and supplier
                  capability confirmed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </RecordInspector>
  );
}
