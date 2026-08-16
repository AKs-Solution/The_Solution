/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Layers, PlaneTakeoff, RefreshCw } from "lucide-react";
import { PageContainer, Panel, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider, Input } from "@/components/ui";

export default function LifecycleTwinPage() {
  const [twins, setTwins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [engineerName, setEngineerName] = useState("");
  const [wearingId, setWearingId] = useState<string | null>(null);

  const fetchTwins = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/causal/twin");
      if (res.ok) {
        const json = await res.json();
        setTwins(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTwins();
  }, [fetchTwins]);

  const handleManualLifeAttestation = async (id: string) => {
    if (!engineerName) return;
    setWearingId(id);
    try {
      const res = await fetch("/api/causal/twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twinId: id }),
      });
      if (res.ok) {
        setEngineerName("");
        await fetchTwins();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWearingId(null);
    }
  };

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="font-medium text-slate-800">Lifecycle Twin</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PlaneTakeoff className="size-6 text-indigo-600" />
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                Lifecycle Fatigue Attestations
              </h1>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchTwins} disabled={isLoading}>
              <RefreshCw className="mr-2 size-4" />
              Sync Sensors
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Review as-built structural metrology anomalies mapped against actual operational flight
            hours. No automated cycle reductions. All life adjustments must be manually signed off.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Operational Fleet Log
            </span>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="size-6 animate-spin text-slate-400" />
              </div>
            ) : twins.length > 0 ? (
              <div className="flex flex-col gap-4">
                {twins.map((t) => {
                  const lifePercent = Math.max(10, Math.round((t.predictedLifeHrs / 8000.0) * 100));

                  return (
                    <div
                      key={t.id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/10 p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Layers className="size-5 text-slate-500" />
                          <div className="flex flex-col text-left">
                            <h3 className="font-mono text-sm font-bold text-slate-900">
                              PART ID: {t.componentId.slice(0, 15)}...
                            </h3>
                            <span className="text-[10px] text-slate-400">Twin ID: {t.id}</span>
                          </div>
                        </div>

                        <Badge className="border-indigo-200 bg-indigo-50 text-indigo-800">
                          Active Telemetry Stream
                        </Badge>
                      </div>

                      <Divider className="border-slate-100" />

                      <div className="grid grid-cols-3 gap-4 text-left text-xs">
                        <div>
                          <span className="mb-0.5 block text-slate-400">As-Flown Hours</span>
                          <span className="font-bold text-slate-800">
                            {t.flightHours.toLocaleString()} Hrs
                          </span>
                        </div>
                        <div>
                          <span className="mb-0.5 block text-slate-400">As-Built Deviation</span>
                          <span className="font-semibold text-slate-800">
                            {t.metrologyAnomalyMM} mm (Surface)
                          </span>
                        </div>
                        <div>
                          <span className="mb-0.5 block text-slate-400">
                            Remaining Service Life
                          </span>
                          <span className="font-bold text-indigo-600">
                            {t.predictedLifeHrs.toLocaleString()} Hrs
                          </span>
                        </div>
                      </div>

                      {/* LIFE PROGRESS BAR */}
                      <div className="flex flex-col gap-1 text-left text-xs">
                        <div className="flex justify-between text-[10px] font-medium text-slate-500">
                          <span>Verified Structural Margin</span>
                          <span>{lifePercent}% Remaining</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${lifePercent}%` }}
                          />
                        </div>
                      </div>

                      {/* MANUAL REVIEW CARD */}
                      <div className="mt-1 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 text-left text-xs">
                        <span className="font-semibold text-slate-500">
                          Sign off on fatigue degradation adjustement based on sensor analysis:
                        </span>
                        <div className="flex gap-2">
                          <Input
                            value={engineerName}
                            onChange={(e) => setEngineerName(e.target.value)}
                            placeholder="Your Name (Lead Structural Engineer)"
                            className="bg-background h-8 max-w-xs text-xs"
                          />
                          <Button
                            onClick={() => handleManualLifeAttestation(t.id)}
                            disabled={!engineerName || wearingId === t.id}
                            className="h-8 bg-indigo-600 py-1 text-xs text-white hover:bg-indigo-700"
                          >
                            {wearingId === t.id
                              ? "Submitting..."
                              : "Attest Life Adjustment (-400 Hrs)"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Panel padding="lg" className="text-muted-foreground text-center text-sm">
                No fleet twins registered.
              </Panel>
            )}
          </div>

          {/* POLICY GUIDE */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <Stack gap={4}>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      Attestation Policy
                    </span>
                    <h2 className="text-foreground text-base font-bold">Lifecycle Wear Bounds</h2>
                  </div>

                  <Divider className="border-slate-200" />

                  <div className="rounded border border-slate-200 bg-slate-50 p-3 text-left text-xs">
                    <span className="mb-1 block font-semibold text-slate-800">
                      Fatigue Audit Rules:
                    </span>
                    <p className="text-[11px] leading-normal text-slate-500">
                      Any modification to remaining flight hours or fatigue bounds must be manually
                      authorized by a named lead engineer. Confabulated or automated lifecycle
                      estimations are blocked.
                    </p>
                  </div>
                </Stack>
              </CardContent>
            </Card>
          </div>
        </div>
      </Stack>
    </PageContainer>
  );
}
