/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, RefreshCw, ShieldAlert, Cpu } from "lucide-react";
import { PageContainer, Panel, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider, Input } from "@/components/ui";

export default function MetrologyRegistryPage() {
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [engineerName, setEngineerName] = useState("");
  const [signingId, setSigningId] = useState<string | null>(null);

  const fetchTelemetry = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/telemetry/spindle");
      if (res.ok) {
        const json = await res.json();
        setTelemetry(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  const handleSignOff = async (id: string) => {
    if (!engineerName) return;
    setSigningId(id);
    try {
      const res = await fetch("/api/telemetry/spindle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "adjust", telemetryId: id }),
      });
      if (res.ok) {
        setEngineerName("");
        await fetchTelemetry();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSigningId(null);
    }
  };

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="font-medium text-zinc-800">Metrology Registry</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="size-6 text-indigo-600" />
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                Metrology & Sensor Deviation Registry
              </h1>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchTelemetry} disabled={isLoading}>
              <RefreshCw className="mr-2 size-4" />
              Sync Sensors
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Monitor raw physical metrology scan deviations from connected Faro/Zeiss systems. No
            automated feed correction. All deviations require named engineer attestation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Sensor Deviation Records
            </span>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="size-6 animate-spin text-zinc-400" />
              </div>
            ) : telemetry.length > 0 ? (
              <div className="flex flex-col gap-4">
                {telemetry.map((t) => {
                  const limitCrossed = t.deviationMM > 0.05;
                  const isAttested = t.isAdjusted;

                  return (
                    <div
                      key={t.id}
                      className={`flex flex-col gap-3 rounded-xl border p-5 transition-all ${
                        isAttested
                          ? "border-emerald-200 bg-emerald-50/5"
                          : limitCrossed
                            ? "border-amber-200 bg-amber-50/5"
                            : "border-zinc-200 bg-zinc-50/10"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Cpu className="size-5 text-indigo-600" />
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-bold text-zinc-900">{t.machineId}</span>
                            <span className="text-[10px] text-zinc-400">
                              Recorded: {new Date(t.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        {isAttested ? (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
                            Attested By Engineer
                          </Badge>
                        ) : limitCrossed ? (
                          <Badge className="border-amber-200 bg-amber-50 text-amber-800">
                            Tolerance Alert
                          </Badge>
                        ) : (
                          <Badge className="border-zinc-200 bg-zinc-100 text-zinc-800">
                            Nominal
                          </Badge>
                        )}
                      </div>

                      <Divider className="border-zinc-100" />

                      <div className="grid grid-cols-2 gap-4 text-left text-xs sm:grid-cols-4">
                        <div>
                          <span className="block text-zinc-400">Spindle Speed</span>
                          <span className="font-semibold text-zinc-800">
                            {t.spindleSpeedRPM.toLocaleString()} RPM
                          </span>
                        </div>
                        <div>
                          <span className="block text-zinc-400">Feed Rate</span>
                          <span className="font-semibold text-zinc-800">
                            {t.feedRateMMPM.toLocaleString()} mm/min
                          </span>
                        </div>
                        <div>
                          <span className="block text-zinc-400">Sensor G-Force</span>
                          <span className="font-semibold text-zinc-800">{t.vibrationG} G</span>
                        </div>
                        <div>
                          <span className="block text-zinc-400">Measured Deviation</span>
                          <span
                            className={`font-bold ${limitCrossed && !isAttested ? "text-amber-600" : "text-zinc-800"}`}
                          >
                            {t.deviationMM} mm
                          </span>
                        </div>
                      </div>

                      {limitCrossed && !isAttested && (
                        <div className="mt-1 flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left text-xs">
                          <div className="flex items-center gap-2 text-amber-700">
                            <ShieldAlert className="size-4 shrink-0" />
                            <span>
                              Warning: Metrology drift exceeds nominal 0.05mm limit. Requires manual
                              engineering review.
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={engineerName}
                              onChange={(e) => setEngineerName(e.target.value)}
                              placeholder="Your Name (Attesting Engineer)"
                              className="bg-background h-8 max-w-xs text-xs"
                            />
                            <Button
                              onClick={() => handleSignOff(t.id)}
                              disabled={!engineerName || signingId === t.id}
                              className="h-8 bg-amber-600 py-1 text-xs text-white hover:bg-amber-700"
                            >
                              {signingId === t.id
                                ? "Signing off..."
                                : "Attest Deviation as Acceptable"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Panel padding="lg" className="text-muted-foreground text-center text-sm">
                No sensor logs found.
              </Panel>
            )}
          </div>

          {/* POLICY LIMITS */}
          <div className="lg:col-span-1">
            <Card className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <Stack gap={4}>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                      Quality Policy
                    </span>
                    <h2 className="text-foreground text-base font-bold">Tolerance Guidelines</h2>
                  </div>

                  <Divider className="border-zinc-200" />

                  <div className="flex flex-col gap-2 text-left text-xs">
                    <div className="rounded border border-zinc-200 bg-zinc-50 p-3">
                      <span className="mb-1 block font-semibold text-zinc-800">
                        Standard Limits:
                      </span>
                      <p className="text-[11px] leading-relaxed text-zinc-500">
                        Any structural deviation exceeding ±0.05mm must be manually audited and
                        signed off by a named lead engineer before final assembly integration.
                      </p>
                    </div>
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
