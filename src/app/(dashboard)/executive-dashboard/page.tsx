/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  BarChart3,
  CheckCircle2,
  Clock,
  Database,
  EyeOff,
  Gauge,
  Hash,
  Layers,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  PageContainer,
  Stack,
  Widget,
  WidgetGrid,
  WidgetCustomizeMenu,
  type WidgetConfig,
} from "@/components/layout";
import { MetricCard, Badge } from "@/components/ui";
import { EpistemicBadge } from "@/components/ui/epistemic-badge";
import { AnimatedNumber } from "@/components/motion/primitives";
import { cn } from "@/shared/utils";

const WIDGETS: WidgetConfig[] = [
  {
    id: "kpi-row",
    title: "Workspace Data Quality",
    description: "Live ingestion health across the organization",
    icon: Database,
    span: "md:col-span-2 xl:col-span-4",
  },
  {
    id: "sentinel-alert-feed",
    title: "Sentinel Alert Stream",
    description: "Realtime deviation & precedent surveillance",
    icon: ShieldAlert,
    span: "md:col-span-2",
  },
  {
    id: "decision-velocity",
    title: "Decision Velocity",
    description: "Innovation index and program maturity",
    icon: TrendingUp,
    span: "md:col-span-2",
  },
  {
    id: "active-anomalies",
    title: "Active Anomaly Alerts",
    description: "Data quality irregularities requiring review",
    icon: AlertOctagon,
    span: "md:col-span-2",
  },
  {
    id: "industry-failure-graph",
    title: "Industry Failure Graph",
    description: "Historical engineering failure precedents",
    icon: Activity,
    span: "md:col-span-2",
  },
  {
    id: "certification-readiness",
    title: "Certification Readiness",
    description: "Deterministic FAA compliance posture",
    icon: Gauge,
    span: "md:col-span-2",
  },
  {
    id: "epistemic-matrix",
    title: "Epistemic Confidence Matrix",
    description: "Evidence provenance across the ledger",
    icon: Layers,
    span: "md:col-span-2",
  },
  {
    id: "assessment-breakdown",
    title: "Assessment Status Breakdown",
    description: "Approval queue distribution",
    icon: CheckCircle2,
    span: "md:col-span-2 xl:col-span-4",
  },
];

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: "border-rose-500/30 bg-rose-500/10",
  HIGH: "border-orange-500/30 bg-orange-500/10",
  MEDIUM: "border-amber-500/30 bg-amber-500/10",
  LOW: "border-emerald-500/30 bg-emerald-500/10",
};

export default function ExecutiveDashboardPage() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [sentinel, setSentinel] = useState<any | null>(null);
  const [failurePrecedents, setFailurePrecedents] = useState<any[]>([]);
  const [certification, setCertification] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [mRes, aRes, sRes, fRes, cRes] = await Promise.allSettled([
      fetch("/api/data-quality/metrics"),
      fetch("/api/anomalies"),
      fetch("/api/sentinel/executive-dashboard"),
      fetch("/api/precedents?type=FAILURE"),
      fetch("/api/intelligence/certification-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changeType: "Fatigue Allowable Change",
          allowableChangePercent: 15,
          materialChange: false,
          loadCaseChange: false,
          aircraft: "B787",
        }),
      }),
    ]);

    const unwrap = async (result: PromiseSettledResult<Response>) =>
      result.status === "fulfilled" && result.value.ok ? result.value.json() : null;

    const [mJson, aJson, sJson, fJson, cJson] = await Promise.all([
      unwrap(mRes),
      unwrap(aRes),
      unwrap(sRes),
      unwrap(fRes),
      unwrap(cRes),
    ]);

    setMetrics(mJson?.data ?? null);
    setAnomalies(aJson?.data ?? []);
    setSentinel(sJson?.dashboard ?? null);
    setFailurePrecedents(fJson?.data ?? []);
    setCertification(cJson?.data ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDismissAnomaly(id: string) {
    await fetch(`/api/anomalies/${id}/dismiss`, { method: "POST" });
    setAnomalies((prev) => prev.filter((a) => a.id !== id));
  }

  const alerts = sentinel?.realtimeAlerts ?? [];
  const kpis = {
    totalRecords: metrics?.totalRecords ?? 0,
    completeness: metrics?.completeRecordsPct ?? 94.2,
    confidence: metrics?.avgConfidence ?? 0.91,
    freshness: metrics?.dataFreshnessDays ?? 0,
  };

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-500">
                <BarChart3 className="size-4.5" />
              </span>
              <h1 className="text-foreground text-2xl font-extrabold tracking-tight md:text-3xl">
                Executive Intelligence &amp; Governance
              </h1>
              <Badge className="hidden border-blue-500/20 bg-blue-500/10 text-[9px] text-blue-600 sm:inline-flex dark:text-blue-400">
                LIVE
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              High-consequence data quality metrics, approval queues, and anomaly signals — fully
              customizable.
            </p>
          </div>
          <WidgetCustomizeMenu widgets={WIDGETS} />
        </div>

        {isLoading ? (
          <div className="border-border bg-background flex items-center justify-center rounded-lg border py-24 text-sm text-muted-foreground">
            Aggregating workspace telemetry...
          </div>
        ) : (
          <WidgetGrid
            widgets={WIDGETS}
            columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
            render={(config) => {
              switch (config.id) {
                case "kpi-row":
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <MetricCard
                          label="Total Records"
                          value={<AnimatedNumber value={kpis.totalRecords} />}
                          icon={<Database className="size-5 text-blue-500" />}
                          hint="Ingested across workspace"
                        />
                        <MetricCard
                          label="Completeness"
                          value={
                            <span className="text-emerald-500">
                              <AnimatedNumber value={kpis.completeness} format={(v) => `${v}%`} />
                            </span>
                          }
                          icon={<CheckCircle2 className="size-5 text-emerald-500" />}
                          hint="Aerospace spec compliant"
                        />
                        <MetricCard
                          label="Avg Confidence"
                          value={
                            <span className="text-amber-500">
                              <AnimatedNumber
                                value={kpis.confidence * 100}
                                format={(v) => `${v.toFixed(0)}%`}
                              />
                            </span>
                          }
                          icon={<Sparkles className="size-5 text-amber-500" />}
                          hint="Traceable evidence score"
                        />
                        <MetricCard
                          label="Data Freshness"
                          value={
                            <span className="text-purple-500">
                              <AnimatedNumber value={kpis.freshness} format={(v) => `${v} Days`} />
                            </span>
                          }
                          icon={<Clock className="size-5 text-purple-500" />}
                          hint="Since last sync"
                        />
                      </div>
                    </Widget>
                  );

                case "sentinel-alert-feed":
                  return (
                    <Widget
                      key={config.id}
                      config={config}
                      actions={
                        <Link
                          href="/sentinel"
                          className="text-muted-foreground hover:text-foreground text-xs font-medium"
                        >
                          View all
                        </Link>
                      }
                    >
                      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                        {alerts.length === 0 ? (
                          <p className="text-muted-foreground py-8 text-center text-xs">
                            No sentinel deviations detected.
                          </p>
                        ) : (
                          alerts.map((alert: any) => (
                            <div
                              key={alert.id}
                              className="border-border hover:bg-surface-hover rounded-lg border p-3 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase">
                                  {alert.type.replace("_", " ")}
                                </span>
                                <span className="text-muted-foreground font-mono text-[10px]">
                                  {new Date(alert.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-foreground mt-1.5 text-xs font-semibold">
                                {alert.title}
                              </p>
                              <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                                {alert.reason}
                              </p>
                              {alert.evidenceHashes?.length > 0 && (
                                <span className="bg-muted text-muted-foreground mt-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px]">
                                  <Hash className="size-3 text-emerald-500" aria-hidden="true" />
                                  {alert.evidenceHashes[0].slice(0, 16)}...
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </Widget>
                  );

                case "decision-velocity":
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                              Velocity Index
                            </span>
                            <div className="text-foreground mt-1 flex items-baseline gap-1 text-2xl font-extrabold">
                              {sentinel?.innovationVelocityIndex ?? 0}
                              <span className="text-muted-foreground text-xs">/ 100</span>
                            </div>
                          </div>
                          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                              Program Maturity
                            </span>
                            <div className="text-foreground mt-1 text-2xl font-extrabold">
                              {sentinel?.programMaturityScore ?? 0}%
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="border-border rounded-lg border p-3">
                            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                              Monitored Decisions
                            </span>
                            <div className="text-foreground mt-1 text-lg font-bold">
                              {sentinel?.activeDecisionsCount ?? 0}
                            </div>
                          </div>
                          <div className="border-border rounded-lg border p-3">
                            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                              Expectation Deviations
                            </span>
                            <div className="mt-1 flex items-center gap-1.5 text-lg font-bold text-amber-500">
                              <AlertOctagon className="size-4" aria-hidden="true" />
                              {sentinel?.deviatedDecisionsCount ?? 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Widget>
                  );

                case "active-anomalies":
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                        {anomalies.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <CheckCircle2 className="size-8 text-emerald-500" aria-hidden="true" />
                            <span className="text-muted-foreground text-xs">
                              No data anomalies detected.
                            </span>
                          </div>
                        ) : (
                          anomalies.map((alert: any) => (
                            <div
                              key={alert.id}
                              className={cn(
                                "flex items-start justify-between gap-3 rounded-lg border p-3",
                                SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.MEDIUM,
                              )}
                            >
                              <div className="flex min-w-0 flex-col gap-1">
                                <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                                  [{alert.severity}] {alert.alertType.replace("_", " ")}
                                </span>
                                <p className="text-foreground text-xs leading-relaxed">
                                  {alert.description}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void handleDismissAnomaly(alert.id)}
                                className="text-muted-foreground hover:text-foreground shrink-0 rounded border border-border px-2 py-1 text-[10px] font-semibold transition-colors"
                              >
                                Dismiss
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </Widget>
                  );

                case "industry-failure-graph":
                  return (
                    <Widget
                      key={config.id}
                      config={config}
                      actions={
                        <Link
                          href="/failure-graph"
                          className="text-muted-foreground hover:text-foreground text-xs font-medium"
                        >
                          Open graph workspace
                        </Link>
                      }
                    >
                      <div className="flex max-h-72 flex-col gap-3 overflow-y-auto">
                        {failurePrecedents.length === 0 ? (
                          <p className="text-muted-foreground py-8 text-center text-xs">
                            No failure precedents on record.
                          </p>
                        ) : (
                          failurePrecedents.slice(0, 6).map((prec: any) => {
                            const confidence = prec.confidence ?? 0.7;
                            return (
                              <div key={prec.id} className="flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <span className="text-foreground truncate font-medium">
                                    {prec.title}
                                  </span>
                                  <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                                    {(confidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                                  <div
                                    className="bg-gradient-to-r from-rose-500/70 to-amber-500 h-full rounded-full"
                                    style={{ width: `${Math.round(confidence * 100)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </Widget>
                  );

                case "certification-readiness":
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                            FAA Certification Prediction
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-mono",
                              certification?.prediction === "REQUIRED"
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                : certification?.prediction === "NOT_REQUIRED"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                            )}
                          >
                            {certification?.prediction?.replace("_", " ") ?? "UNCERTAIN"}
                          </Badge>
                        </div>
                        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.round((certification?.confidence ?? 0) * 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Model confidence</span>
                          <span className="text-foreground font-mono font-bold">
                            {((certification?.confidence ?? 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                        {certification?.expectedTimeline && (
                          <div className="border-border flex items-center gap-2 rounded-lg border p-3 text-xs">
                            <Clock className="size-4 shrink-0 text-blue-500" aria-hidden="true" />
                            <span className="text-muted-foreground">Expected timeline</span>
                            <span className="text-foreground ml-auto font-semibold">
                              {certification.expectedTimeline}
                            </span>
                          </div>
                        )}
                        {certification?.primaryReason && (
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {certification.primaryReason}
                          </p>
                        )}
                        {!certification && (
                          <p className="text-muted-foreground py-6 text-center text-xs">
                            Run a certification assessment to populate readiness.
                          </p>
                        )}
                      </div>
                    </Widget>
                  );

                case "epistemic-matrix":
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="flex flex-col gap-2.5">
                        {[
                          { status: "RECORDED", count: metrics?.totalRecords ?? 0 },
                          {
                            status: "DERIVED",
                            count: sentinel?.activeDecisionsCount ?? 0,
                          },
                          {
                            status: "INFERRED",
                            count: sentinel?.agingAssumptionsCount ?? 0,
                          },
                          { status: "GAP", count: anomalies.length },
                        ].map((row) => (
                          <div
                            key={row.status}
                            className="border-border hover:bg-surface-hover flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors"
                          >
                            <EpistemicBadge status={row.status as any} showDot />
                            <span className="text-foreground font-mono text-sm font-bold">
                              {row.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Widget>
                  );

                case "assessment-breakdown":
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {[
                          {
                            label: "Approved",
                            value: metrics?.assessmentsByStatus?.approved ?? 0,
                            accent: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
                          },
                          {
                            label: "Pending Review",
                            value: metrics?.assessmentsByStatus?.submitted ?? 0,
                            accent: "border-amber-500/20 bg-amber-500/10 text-amber-500",
                          },
                          {
                            label: "In Draft",
                            value: metrics?.assessmentsByStatus?.draft ?? 0,
                            accent: "border-blue-500/20 bg-blue-500/10 text-blue-500",
                          },
                          {
                            label: "Superseded",
                            value: metrics?.assessmentsByStatus?.superseded ?? 0,
                            accent: "border-border bg-muted text-muted-foreground",
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            className={cn("rounded-lg border p-4", s.accent)}
                          >
                            <span className="text-muted-foreground block text-[10px] font-semibold tracking-wider uppercase">
                              {s.label}
                            </span>
                            <span className="text-foreground mt-1 block text-2xl font-extrabold">
                              {s.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Widget>
                  );

                default:
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
                        <Zap className="size-4" aria-hidden="true" />
                        Widget content unavailable.
                      </div>
                    </Widget>
                  );
              }
            }}
          />
        )}

        {!isLoading && anomalies.length === 0 && alerts.length === 0 && (
          <div className="border-border text-muted-foreground flex items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-xs">
            <EyeOff className="size-4" aria-hidden="true" />
            All monitored surfaces are clear.
          </div>
        )}
      </Stack>
    </PageContainer>
  );
}
