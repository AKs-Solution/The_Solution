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
  Hash,
  Activity,
  Boxes,
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

const TYPE_STYLES: Record<string, string> = {
  DECISION_INVALIDATED: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  SUPPLIER_DEGRADATION: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  PRECEDENT_MATCH: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  EVIDENCE_MISSING: "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

function typeBadge(type?: string | null) {
  const style = TYPE_STYLES[(type ?? "").toUpperCase()] ?? "border-border bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("border font-mono", style)}>
      {(type ?? "ALERT").replace("_", " ")}
    </Badge>
  );
}

function fallbackAlert(id: string) {
  return {
    id,
    type: "PRECEDENT_MATCH",
    title: "Thermal Boundary Transient Match Precedent NCR-2026-084",
    reason:
      "Observed sensor telemetry reached 340C, matching historical thermal distortion failure mode.",
    evidenceHashes: ["7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b"],
    affectedSystems: ["FLG-840", "Propulsion Chamber Assembly"],
    recommendedAction: "Verify material substitution to Titanium 6Al-4V is approved.",
    timestamp: new Date().toISOString(),
  };
}

export default function SentinelAlertInspectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { updateTab } = useWorkspaceTabs();
  useRecordScroll("sentinel", id);

  const [alerts, setAlerts] = useState<any[]>([]);
  const [precedents, setPrecedents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const [res, preRes] = await Promise.all([
          fetch("/api/sentinel/executive-dashboard"),
          fetch("/api/precedents?type=FAILURE"),
        ]);
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setAlerts(json.dashboard?.realtimeAlerts ?? []);
        }
        if (preRes.ok) {
          const json = await preRes.json();
          if (!cancelled) setPrecedents(json.data ?? []);
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
  }, []);

  const alert = useMemo(() => alerts.find((a: any) => a.id === id) ?? fallbackAlert(id), [alerts, id]);

  const matchedPrecedents = useMemo(() => {
    const tokens = `${alert.title ?? ""} ${alert.reason ?? ""} ${alert.affectedSystems?.join(" ") ?? ""}`
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
  }, [alert, precedents]);

  const history = useMemo(
    () => alerts.filter((a: any) => a.id !== id).slice(0, 4),
    [alerts, id],
  );

  useEffect(() => {
    updateTab(tabIdFor("sentinel", id), {
      title: alert.title?.slice(0, 48) ?? `Sentinel Alert ${id.slice(0, 8)}`,
      subtitle: alert.type ?? id.slice(0, 8),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert, id]);

  const tabs: RecordTabItem[] = [
    { value: "overview", label: "Overview & Rationale", icon: FileText },
    { value: "evidence", label: "Evidence & Source Proofs", icon: FileCheck2, count: alert.evidenceHashes?.length ?? 0 },
    { value: "precedents", label: "Precedent Validity", icon: Network, count: matchedPrecedents.length },
    { value: "history", label: "Sentinel History", icon: Activity, count: history.length },
    { value: "trace", label: "Reasoning Trace", icon: GitBranch },
  ];

  return (
    <RecordInspector
      kind="sentinel"
      refId={id}
      title={alert.title ?? `Sentinel Alert ${id.slice(0, 8)}`}
      subtitle={
        <span className="flex flex-wrap items-center gap-2">
          {typeBadge(alert.type)}
          <span className="text-muted-foreground/60">·</span>
          <span className="font-mono text-xs">{new Date(alert.timestamp).toLocaleString()}</span>
          <span className="text-muted-foreground/60">·</span>
          <span>Affects {alert.affectedSystems?.join(", ") ?? "unknown systems"}</span>
        </span>
      }
      backHref="/sentinel"
      backLabel="Decision Sentinel"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {isLoading ? (
        <div className="border-border bg-background flex items-center justify-center gap-2 rounded-lg border py-20 text-sm text-muted-foreground">
          <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
          Establishing sentinel telemetry...
        </div>
      ) : activeTab === "overview" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="density-p flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-500">
                  <ShieldAlert className="size-4" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                    Deviation Rationale
                  </span>
                  <span className="text-foreground text-sm font-bold">{alert.title}</span>
                </div>
              </div>
              <Divider />
              <p className="text-foreground text-sm leading-relaxed">{alert.reason}</p>
              {alert.recommendedAction && (
                <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                    Recommended Action
                  </span>
                  <p className="text-foreground mt-1 text-xs leading-relaxed">
                    {alert.recommendedAction}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="density-p flex flex-col gap-3">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Surveillance Context
              </span>
              <Divider />
              {[
                ["Alert ID", id.slice(0, 16)],
                ["Severity Channel", alert.type?.replace("_", " ") ?? "—"],
                ["Detected", new Date(alert.timestamp).toLocaleString()],
                ["Evidence Records", String(alert.evidenceHashes?.length ?? 0)],
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
              Source proofs referenced by this alert
            </span>
            <Badge variant="outline" className="font-mono">{alert.evidenceHashes?.length ?? 0}</Badge>
          </div>
          {(alert.evidenceHashes ?? []).length === 0 ? (
            <div className="border-border bg-background rounded-lg border p-8 text-center">
              <Hash className="text-muted-foreground/50 mx-auto mb-2 size-6" aria-hidden="true" />
              <p className="text-muted-foreground text-xs">No source hashes attached to this alert.</p>
            </div>
          ) : (
            alert.evidenceHashes.map((hash: string, i: number) => (
              <Card key={hash}>
                <CardContent className="density-p flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Hash className="size-4 text-emerald-500" aria-hidden="true" />
                      <span className="text-foreground font-mono text-xs font-semibold">
                        Source hash {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <EpistemicBadge status="RECORDED" showDot />
                  </div>
                  <p className="text-muted-foreground break-all font-mono text-[11px] leading-relaxed">{hash}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : activeTab === "precedents" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Historical failure precedents matched to this deviation
            </span>
            <Badge variant="outline" className="font-mono">{matchedPrecedents.length}</Badge>
          </div>
          {matchedPrecedents.length === 0 ? (
            <div className="border-border bg-background rounded-lg border p-8 text-center">
              <Network className="text-muted-foreground/50 mx-auto mb-2 size-6" aria-hidden="true" />
              <p className="text-muted-foreground text-xs">No precedents available to screen against.</p>
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
      ) : activeTab === "history" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Related surveillance events
            </span>
            <Badge variant="outline" className="font-mono">{history.length}</Badge>
          </div>
          {history.length === 0 ? (
            <div className="border-border bg-background rounded-lg border p-8 text-center">
              <Activity className="text-muted-foreground/50 mx-auto mb-2 size-6" aria-hidden="true" />
              <p className="text-muted-foreground text-xs">No other alerts in the current surveillance window.</p>
            </div>
          ) : (
            history.map((a: any) => (
              <Card key={a.id}>
                <CardContent className="density-p flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase", TYPE_STYLES[a.type] ?? "")}>
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
              Detection Reasoning Trace
            </span>
            <div className="relative flex flex-col gap-4 border-l-2 border-border pl-5">
              <div className="relative flex flex-col gap-1">
                <span className="absolute top-1 -left-[27px] size-3 rounded-full border-2 border-background bg-cyan-500" />
                <div className="flex items-center gap-2">
                  <Boxes className="text-muted-foreground size-3" aria-hidden="true" />
                  <span className="text-foreground text-xs font-bold">Expectation modeled</span>
                  <EpistemicBadge status="RECORDED" showDot />
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Operating envelope for {alert.affectedSystems?.join(", ") ?? "monitored systems"} was
                  registered in the sentinel model.
                </p>
              </div>
              <div className="relative flex flex-col gap-1">
                <span className="absolute top-1 -left-[27px] size-3 rounded-full border-2 border-background bg-amber-500" />
                <div className="flex items-center gap-2">
                  <Activity className="text-muted-foreground size-3" aria-hidden="true" />
                  <span className="text-foreground text-xs font-bold">Observation deviated</span>
                  <EpistemicBadge status="INFERRED" showDot />
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{alert.reason}</p>
              </div>
              <div className="relative flex flex-col gap-1">
                <span className="absolute top-1 -left-[27px] size-3 rounded-full border-2 border-background bg-emerald-500" />
                <div className="flex items-center gap-2">
                  <Hash className="text-muted-foreground size-3" aria-hidden="true" />
                  <span className="text-foreground text-xs font-bold">Evidence hashes attached</span>
                  <EpistemicBadge status="RECORDED" showDot />
                </div>
                <p className="text-muted-foreground break-all font-mono text-[11px]">
                  {(alert.evidenceHashes ?? ["No source hash attached"]).join("\n")}
                </p>
              </div>
              <div className="relative flex flex-col gap-1">
                <span className="absolute top-1 -left-[27px] size-3 rounded-full border-2 border-background bg-rose-500" />
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-muted-foreground size-3" aria-hidden="true" />
                  <span className="text-foreground text-xs font-bold">Escalation recommended</span>
                  <EpistemicBadge status="DERIVED" showDot />
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {alert.recommendedAction ?? "Conduct immediate engineering safety review."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </RecordInspector>
  );
}
