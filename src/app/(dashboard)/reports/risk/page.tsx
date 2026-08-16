/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Play, RefreshCw, BarChart2, ShieldCheck } from "lucide-react";
import { PageContainer, Panel, Stack } from "@/components/layout";
import { Button, Badge, Divider } from "@/components/ui";

export default function RiskPage() {
  const [risks, setRisks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mitigatingId, setMitigatingId] = useState<string | null>(null);

  const fetchRisks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/risk/simulate");
      if (res.ok) {
        const json = await res.json();
        setRisks(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRisks();
  }, [fetchRisks]);

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/risk/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate" }),
      });
      if (res.ok) {
        const json = await res.json();
        setRisks(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMitigate = async (id: string) => {
    setMitigatingId(id);
    try {
      const res = await fetch("/api/risk/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mitigate", riskId: id }),
      });
      if (res.ok) {
        await fetchRisks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMitigatingId(null);
    }
  };

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Dashboard</span>
            <span>/</span>
            <span>Reports</span>
            <span>/</span>
            <span className="font-medium text-slate-800">Risk</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart2 className="size-6 text-red-600" />
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                Predictive Program Risk Syndication
              </h1>
            </div>
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              size="sm"
              onClick={handleSimulate}
              disabled={isLoading}
            >
              <Play className="mr-2 size-4" />
              Run Monte Carlo Simulation
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Analyze global program supply structures against real-time manufacturing telemetry and
            raw material lead times to predict critical path delays.
          </p>
        </div>

        {/* RISK MATRIX */}
        <div className="flex flex-col gap-4">
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Active Program Risk Forecasts
          </span>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="size-6 animate-spin text-slate-400" />
            </div>
          ) : risks.length > 0 ? (
            <div className="flex flex-col gap-4">
              {risks.map((r) => {
                const isHighRisk = r.criticalPathRisk > 50;
                const isMitigated = r.criticalPathRisk < 20;

                return (
                  <div
                    key={r.id}
                    className={`flex flex-col gap-4 rounded-xl border p-5 transition-all ${
                      isMitigated
                        ? "border-emerald-200 bg-emerald-50/5"
                        : isHighRisk
                          ? "border-red-200 bg-red-50/5"
                          : "border-slate-200 bg-slate-50/10"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col">
                        <h3 className="text-sm font-bold text-slate-900">{r.programName}</h3>
                        <span className="text-[10px] text-slate-400">
                          Simulation Run: {new Date(r.simulatedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                            Delay Risk Score
                          </span>
                          <span
                            className={`text-base font-bold ${isMitigated ? "text-emerald-600" : isHighRisk ? "text-red-600" : "text-amber-600"}`}
                          >
                            {r.criticalPathRisk}%
                          </span>
                        </div>

                        {isMitigated ? (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
                            Clear
                          </Badge>
                        ) : isHighRisk ? (
                          <Badge className="border-red-200 bg-red-50 text-red-800">
                            Critical Path Alert
                          </Badge>
                        ) : (
                          <Badge className="border-amber-200 bg-amber-50 text-amber-800">
                            Watchlist
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Divider className="border-slate-100" />

                    <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
                      <div className="rounded border border-slate-100 bg-slate-50 p-4">
                        <span className="mb-1 block text-slate-400">Identified Bottleneck</span>
                        <span className="block font-bold text-slate-800">
                          {r.bottlenecks?.supplierName}
                        </span>
                        <span className="mt-1 block text-[10px] text-slate-500">
                          {r.bottlenecks?.cause}
                        </span>
                      </div>

                      <div className="flex flex-col justify-between rounded border border-slate-100 bg-slate-50 p-4">
                        <div>
                          <span className="block text-slate-400">Delay Probability</span>
                          <span className="mt-1 block text-lg font-bold text-slate-800">
                            {Math.round(r.delayProbability * 100)}%
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Calculated over 10,000 supply runs
                        </span>
                      </div>

                      <div className="flex flex-col justify-between rounded border border-slate-100 bg-slate-50 p-4">
                        <div>
                          <span className="block text-slate-400">Est Schedule Impact</span>
                          <span
                            className={`mt-1 block text-lg font-bold ${r.bottlenecks?.leadTimeDelayDays > 10 ? "text-red-600" : "text-slate-800"}`}
                          >
                            +{r.bottlenecks?.leadTimeDelayDays} Days
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Critical path delay estimate
                        </span>
                      </div>
                    </div>

                    {isHighRisk && !isMitigated && (
                      <div className="mt-1 flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="size-4 shrink-0" />
                          <span>
                            Single-point bottleneck detected at Tier-2. Dynamic recovery options
                            available.
                          </span>
                        </div>
                        <Button
                          onClick={() => handleMitigate(r.id)}
                          disabled={mitigatingId === r.id}
                          className="flex h-9 items-center gap-1.5 bg-red-600 text-white hover:bg-red-700"
                        >
                          <ShieldCheck className="size-4" />
                          <span>
                            {mitigatingId === r.id
                              ? "Syndicating Route..."
                              : "Run Autonomous Recovery"}
                          </span>
                        </Button>
                      </div>
                    )}

                    {isMitigated && (
                      <div className="mt-1 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-700">
                        <ShieldCheck className="size-4 shrink-0" />
                        <span>
                          Mitigation complete. Order load re-allocated to Helix Machining
                          (alternate), clearing the critical path bottleneck.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Panel padding="lg" className="text-muted-foreground text-center text-sm">
              No program risks simulated yet.
            </Panel>
          )}
        </div>
      </Stack>
    </PageContainer>
  );
}
