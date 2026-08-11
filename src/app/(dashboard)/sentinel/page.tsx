"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertOctagon,
  Hash,
  ShieldAlert,
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
import { Badge } from "@/components/ui";
import { EpistemicBadge } from "@/components/ui/epistemic-badge";

const WIDGETS: WidgetConfig[] = [
  {
    id: "sentinel-alert-feed",
    title: "Sentinel Alert Stream",
    description: "Continuous surveillance of engineering hypotheses",
    icon: ShieldAlert,
    span: "md:col-span-2 xl:col-span-2",
  },
  {
    id: "decision-velocity",
    title: "Innovation Velocity",
    description: "Index, maturity, and decision throughput",
    icon: TrendingUp,
    span: "md:col-span-2 xl:col-span-2",
  },
  {
    id: "active-anomalies",
    title: "Expectation Deviations",
    description: "Hypotheses diverging from modeled expectations",
    icon: AlertOctagon,
    span: "md:col-span-2 xl:col-span-2",
  },
  {
    id: "epistemic-matrix",
    title: "Surveillance Epistemic Posture",
    description: "Provenance of monitored signals",
    icon: Activity,
    span: "md:col-span-2 xl:col-span-2",
  },
];

export default function SentinelPage() {
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sentinel/executive-dashboard");
      if (res.ok) {
        const json = await res.json();
        setDashboard(json.dashboard ?? null);
      }
    } catch {
      // Sentinel engine unavailable — show empty posture.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const alerts = dashboard?.realtimeAlerts ?? [];
  const selectedAlert = alerts.find((a: any) => a.id === selected) ?? null;

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-500">
                <Activity className="size-4.5" />
              </span>
              <h1 className="text-foreground text-2xl font-extrabold tracking-tight md:text-3xl">
                Decision Sentinel
              </h1>
              <Badge className="hidden border-rose-500/20 bg-rose-500/10 text-[9px] text-rose-600 sm:inline-flex dark:text-rose-400">
                LIVE
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Realtime surveillance of active engineering hypotheses, expectation deviations, and
              precedent alerts.
            </p>
          </div>
          <WidgetCustomizeMenu widgets={WIDGETS} />
        </div>

        {isLoading ? (
          <div className="border-border bg-background flex items-center justify-center rounded-lg border py-24 text-sm text-muted-foreground">
            Establishing sentinel telemetry...
          </div>
        ) : (
          <WidgetGrid
            widgets={WIDGETS}
            columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
            render={(config) => {
              switch (config.id) {
                case "sentinel-alert-feed":
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
                        {alerts.length === 0 ? (
                          <p className="text-muted-foreground py-10 text-center text-xs">
                            No deviations under active surveillance.
                          </p>
                        ) : (
                          alerts.map((alert: any) => (
                            <button
                              key={alert.id}
                              type="button"
                              onClick={() => setSelected(alert.id)}
                              className={[
                                "border-border hover:bg-surface-hover rounded-lg border p-3 text-left transition-colors",
                                selected === alert.id ? "border-rose-500/40 bg-rose-500/5" : "",
                              ].join(" ")}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase">
                                  {alert.type.replace("_", " ")}
                                </span>
                                <span className="text-muted-foreground font-mono text-[10px]">
                                  {new Date(alert.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-foreground mt-1.5 text-xs font-semibold">
                                {alert.title}
                              </p>
                              <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
                                {alert.reason}
                              </p>
                              {alert.evidenceHashes?.length > 0 && (
                                <span className="bg-muted text-muted-foreground mt-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px]">
                                  <Hash className="size-3 text-emerald-500" aria-hidden="true" />
                                  {alert.evidenceHashes[0].slice(0, 16)}...
                                </span>
                              )}
                            </button>
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
                              {dashboard?.innovationVelocityIndex ?? 0}
                              <span className="text-muted-foreground text-xs">/ 100</span>
                            </div>
                          </div>
                          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                              Program Maturity
                            </span>
                            <div className="text-foreground mt-1 text-2xl font-extrabold">
                              {dashboard?.programMaturityScore ?? 0}%
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="border-border rounded-lg border p-3 text-center">
                            <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                              Monitored
                            </div>
                            <div className="text-foreground mt-1 text-xl font-bold">
                              {dashboard?.activeDecisionsCount ?? 0}
                            </div>
                          </div>
                          <div className="border-border rounded-lg border p-3 text-center">
                            <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                              Deviated
                            </div>
                            <div className="mt-1 text-xl font-bold text-amber-500">
                              {dashboard?.deviatedDecisionsCount ?? 0}
                            </div>
                          </div>
                          <div className="border-border rounded-lg border p-3 text-center">
                            <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                              Debt Hotspots
                            </div>
                            <div className="mt-1 text-xl font-bold text-rose-500">
                              {dashboard?.technicalDebtHotspotsCount ?? 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Widget>
                  );

                case "active-anomalies":
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                          {
                            label: "Aging Assumptions",
                            value: dashboard?.agingAssumptionsCount ?? 0,
                            icon: <Zap className="size-5 text-indigo-500" aria-hidden="true" />,
                          },
                          {
                            label: "Technical Debt Hotspots",
                            value: dashboard?.technicalDebtHotspotsCount ?? 0,
                            icon: <AlertOctagon className="size-5 text-rose-500" aria-hidden="true" />,
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="border-border hover:bg-surface-hover flex items-center justify-between rounded-lg border p-4 transition-colors"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                                {stat.label}
                              </span>
                              <span className="text-foreground text-2xl font-extrabold">
                                {stat.value}
                              </span>
                            </div>
                            {stat.icon}
                          </div>
                        ))}
                        <p className="text-muted-foreground text-xs leading-relaxed sm:col-span-2">
                          Deviation detection compares modeled decision expectations against ingested
                          evidence. Any mismatch is surfaced here with full traceability to source
                          hashes.
                        </p>
                      </div>
                    </Widget>
                  );

                case "epistemic-matrix":
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="flex flex-col gap-2.5">
                        {[
                          { status: "RECORDED", count: dashboard?.activeDecisionsCount ?? 0 },
                          { status: "DERIVED", count: alerts.length },
                          { status: "INFERRED", count: dashboard?.agingAssumptionsCount ?? 0 },
                          { status: "GAP", count: dashboard?.deviatedDecisionsCount ?? 0 },
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

                default:
                  return null;
              }
            }}
          />
        )}

        {selectedAlert && (
          <div className="border-border bg-background rounded-lg border p-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-mono text-[10px] font-bold tracking-widest uppercase">
                Alert detail
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <h3 className="text-foreground text-sm font-bold">{selectedAlert.title}</h3>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              {selectedAlert.reason}
            </p>
            {selectedAlert.evidenceHashes?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedAlert.evidenceHashes.map((hash: string) => (
                  <span
                    key={hash}
                    className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]"
                  >
                    {hash.slice(0, 24)}...
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </Stack>
    </PageContainer>
  );
}
