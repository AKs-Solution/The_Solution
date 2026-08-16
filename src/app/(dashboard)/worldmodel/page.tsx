/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, RefreshCw, UserCheck } from "lucide-react";
import { PageContainer, Panel, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider, Input } from "@/components/ui";

export default function ValidationTimelinePage() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [engineerName, setEngineerName] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTimeline = useCallback(async () => {
    setIsLoading(true);
    try {
      const msRes = await fetch("/api/retrieval/search?scope=milestones");
      const cfRes = await fetch("/api/retrieval/search?scope=conflicts");
      if (msRes.ok && cfRes.ok) {
        const msJson = await msRes.json();
        const cfJson = await cfRes.json();
        setMilestones(msJson.data || []);
        setConflicts(cfJson.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const handleResolve = async (conflictId: string) => {
    if (!engineerName || !resolutionNotes) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/retrieval/attest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve",
          conflictId,
          engineerName,
          resolutionNotes,
        }),
      });
      if (res.ok) {
        setEngineerName("");
        setResolutionNotes("");
        await fetchTimeline();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="font-medium text-slate-800">Validation Timeline</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="size-6 text-indigo-600" />
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                Ingestion & Validation Timeline
              </h1>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchTimeline} disabled={isLoading}>
              <RefreshCw className="mr-2 size-4" />
              Refresh Ledger
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Monitor the locked 6-9 month validation pathway. Audit all records corrections,
            attestation sign-offs, and resolved conflict logs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* TIMELINE SEGMENT */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Locked 6-9 Month Deployment Roadmap
            </span>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="size-6 animate-spin text-slate-400" />
              </div>
            ) : milestones.length > 0 ? (
              <div className="relative ml-4 flex flex-col gap-6 border-l border-slate-200 pl-6">
                {milestones.map((m) => {
                  const isActive = m.status === "ACTIVE";
                  const isCompleted = m.status === "COMPLETED";

                  return (
                    <div key={m.id} className="relative flex flex-col gap-2">
                      {/* DOTS */}
                      <span
                        className={`absolute top-1.5 -left-[31px] size-4 rounded-full border-2 ${
                          isCompleted
                            ? "border-emerald-500 bg-emerald-500"
                            : isActive
                              ? "animate-pulse border-amber-500 bg-amber-500"
                              : "border-slate-300 bg-slate-100"
                        }`}
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-950">{m.stageName}</h3>
                        <Badge
                          variant={isCompleted ? "success" : isActive ? "warning" : "secondary"}
                        >
                          {m.status}
                        </Badge>
                      </div>

                      {m.precisionPercent !== null && (
                        <div className="text-xs font-medium text-slate-600">
                          Algorithm Measured Precision:{" "}
                          <span className="font-bold text-indigo-600">
                            {Math.round(m.precisionPercent * 100)}%
                          </span>{" "}
                          (based on 200 target validation cases)
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-[10px] text-slate-500">
                        <span>Target Start: {new Date(m.startDate).toLocaleDateString()}</span>
                        {m.signOffDate && (
                          <span>
                            Signed Off: {new Date(m.signOffDate).toLocaleDateString()} by{" "}
                            {m.signedOffBy}
                          </span>
                        )}
                      </div>

                      <Divider className="mt-2 border-slate-100" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <Panel padding="lg" className="text-muted-foreground text-center text-sm">
                Timeline not loaded.
              </Panel>
            )}
          </div>

          {/* GOVERNANCE RESOLUTIONS */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Conflict & Resolution Ledger
            </span>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="size-6 animate-spin text-slate-400" />
              </div>
            ) : conflicts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {conflicts.map((c) => {
                  const isResolved = c.resolvedAt !== null;

                  return (
                    <Card
                      key={c.id}
                      className={`border ${isResolved ? "border-slate-200" : "border-amber-200"}`}
                    >
                      <CardContent className="flex flex-col gap-3 p-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            Governance Log
                          </span>
                          <Badge variant={isResolved ? "success" : "warning"} size="sm">
                            {isResolved ? "Resolved" : "Unresolved Conflict"}
                          </Badge>
                        </div>

                        <div className="text-left text-xs leading-relaxed text-slate-600">
                          {c.description}
                        </div>

                        <Divider className="border-slate-100" />

                        {isResolved ? (
                          <div className="flex flex-col gap-2 text-left text-xs">
                            <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                              <UserCheck className="size-4" />
                              <span>Resolved by {c.resolvedBy}</span>
                            </div>
                            <p className="rounded border border-slate-100 bg-slate-50 p-2.5 text-[10px] leading-normal text-slate-500">
                              Resolution notes: {c.resolutionNotes}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 text-left">
                            <span className="text-xs font-semibold text-slate-800">
                              Submit Resolution Sign-off
                            </span>
                            <Input
                              value={engineerName}
                              onChange={(e) => setEngineerName(e.target.value)}
                              placeholder="Your Name (Quality Engineer)"
                              className="bg-background h-8 text-xs"
                            />
                            <textarea
                              value={resolutionNotes}
                              onChange={(e) => setResolutionNotes(e.target.value)}
                              className="bg-background flex h-16 w-full rounded-md border border-slate-200 px-3 py-2 text-xs focus-visible:outline-none"
                              placeholder="Describe engineering reconciliation notes..."
                            />
                            <Button
                              onClick={() => handleResolve(c.id)}
                              disabled={!engineerName || !resolutionNotes || isSubmitting}
                              className="w-full bg-amber-600 text-white hover:bg-amber-700"
                              size="sm"
                            >
                              {isSubmitting ? "Submitting Resolution..." : "Resolve & Log Change"}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500">
                No conflicts currently logged.
              </div>
            )}
          </div>
        </div>
      </Stack>
    </PageContainer>
  );
}
