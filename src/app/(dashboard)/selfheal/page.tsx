/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, RefreshCw, AlertOctagon, GitBranch } from "lucide-react";
import { PageContainer, Panel, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider, Input } from "@/components/ui";

export default function DisruptionRecoveryPage() {
  const [reroutes, setReroutes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [engineerName, setEngineerName] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchReroutes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/selfheal/route");
      if (res.ok) {
        const json = await res.json();
        setReroutes(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReroutes();
  }, [fetchReroutes]);

  const handleManualReroute = async (id: string) => {
    if (!engineerName) return;
    setResolvingId(id);
    try {
      const res = await fetch("/api/selfheal/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rerouteId: id }),
      });
      if (res.ok) {
        setEngineerName("");
        await fetchReroutes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="font-medium text-slate-800">Recovery Router</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="size-6 text-rose-600" />
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                Supply Chain Recovery Router
              </h1>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchReroutes} disabled={isLoading}>
              <RefreshCw className="mr-2 size-4" />
              Sync Routes
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Review proposed alternative sourcing links under active disruptions. No automated path
            switching. All re-routing requires manual G-code review and verification.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* REROUTES SECTION */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Supply Disruption Recovery Logs
            </span>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="size-6 animate-spin text-slate-400" />
              </div>
            ) : reroutes.length > 0 ? (
              <div className="flex flex-col gap-4">
                {reroutes.map((r) => {
                  const isResolved = r.gcodeRewritten;

                  return (
                    <div
                      key={r.id}
                      className={`flex flex-col gap-4 rounded-xl border p-5 transition-all ${
                        isResolved
                          ? "border-emerald-200 bg-emerald-50/5"
                          : "border-rose-200 bg-rose-50/5"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col text-left">
                          <h3 className="text-sm font-bold text-slate-900">{r.programName}</h3>
                          <span className="text-[10px] text-slate-400">Reroute ID: {r.id}</span>
                        </div>

                        {isResolved ? (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
                            Path Verified
                          </Badge>
                        ) : (
                          <Badge className="border-rose-200 bg-rose-50 text-rose-800">
                            Disruption Active
                          </Badge>
                        )}
                      </div>

                      <Divider className="border-slate-100" />

                      <div className="grid grid-cols-1 gap-4 text-left text-xs sm:grid-cols-2">
                        <div className="rounded border border-slate-100 bg-slate-50 p-3">
                          <span className="mb-0.5 block text-slate-400">Disrupted Node</span>
                          <span className="block font-bold text-rose-600">{r.disruptedNode}</span>
                        </div>
                        <div className="rounded border border-slate-100 bg-slate-50 p-3">
                          <span className="mb-0.5 block text-slate-400">
                            Alternate Sourcing Path
                          </span>
                          <span
                            className={`${isResolved ? "font-bold text-emerald-600" : "font-semibold text-slate-800"} block`}
                          >
                            {r.alternateNode}
                          </span>
                        </div>
                      </div>

                      {!isResolved && (
                        <div className="mt-1 flex flex-col gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-left text-xs">
                          <div className="flex items-center gap-2 text-rose-700">
                            <AlertOctagon className="size-4 shrink-0" />
                            <span>
                              Warning: Alternative path proposed. Requires manual verification of
                              G-code parameters on alternate machines.
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={engineerName}
                              onChange={(e) => setEngineerName(e.target.value)}
                              placeholder="Your Name (Lead Manufacturing Engineer)"
                              className="bg-background h-8 max-w-xs text-xs"
                            />
                            <Button
                              onClick={() => handleManualReroute(r.id)}
                              disabled={!engineerName || resolvingId === r.id}
                              className="h-8 bg-rose-600 py-1 text-xs text-white hover:bg-rose-700"
                            >
                              {resolvingId === r.id
                                ? "Verifying..."
                                : "Verify & Attest Alternate Path"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {isResolved && (
                        <div className="mt-1 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-700">
                          <ShieldCheck className="size-4 shrink-0" />
                          <span>
                            Supply path and G-code updates signed off manually. Alternate route
                            active.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Panel padding="lg" className="text-muted-foreground text-center text-sm">
                No disruptions monitored.
              </Panel>
            )}
          </div>

          {/* SOURCING RULES */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <Stack gap={4}>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      Resilience Sourcing
                    </span>
                    <h2 className="text-foreground text-base font-bold">Policy Rules</h2>
                  </div>

                  <Divider className="border-slate-200" />

                  <div className="rounded border border-slate-200 bg-slate-50 p-3 text-left text-xs">
                    <span className="mb-1 block font-semibold text-slate-800">
                      Rerouting Protocol:
                    </span>
                    <p className="text-[11px] leading-normal text-slate-500">
                      Geopolitical or supplier disruption recovery paths are proposed by similarity
                      calculations, but remain inactive until G-code compatibility is manually
                      certified.
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
