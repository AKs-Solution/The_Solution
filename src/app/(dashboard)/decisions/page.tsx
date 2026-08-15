/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { GitCommit, RefreshCw, FileText, ChevronRight, Plus, Sparkles } from "lucide-react";
import {
  PageContainer,
  Stack,
  SubTabInspector,
  useScopedTabState,
  useWorkspaceTabs,
} from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider, Input } from "@/components/ui";
import { EpistemicBadge } from "@/components/ui/epistemic-badge";
import { useToast } from "@/components/ui/toaster";

export default function DecisionAuditTrailPage() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openTab } = useWorkspaceTabs();
  const { toast } = useToast();
  const proposeFormRef = useRef<HTMLDivElement>(null);
  const summaryInputRef = useRef<HTMLInputElement>(null);

  const focusProposeForm = () => {
    proposeFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      summaryInputRef.current?.focus();
    }, 250);
  };

  // Form state (scoped per workspace tab so switching tabs preserves drafts)
  const [decisionType, setDecisionType] = useScopedTabState(
    "decisions.decisionType",
    "TOLERANCE_CHANGE",
  );
  const [description, setDescription] = useScopedTabState("decisions.description", "");
  const [rationale, setRationale] = useScopedTabState("decisions.rationale", "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const openInTab = (d: any) =>
    openTab({
      kind: "decision",
      ref: d.id,
      title: d.description,
      subtitle: d.decisionType,
      href: `/decisions/${d.id}`,
    });

  const fetchDecisions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/decisions");
      if (res.ok) {
        const json = await res.json();
        setDecisions(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!description.trim()) {
      setFormError("Decision summary is required.");
      summaryInputRef.current?.focus();
      return;
    }
    if (!rationale.trim()) {
      setFormError("Engineering rationale is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decisionType,
          description: description.trim(),
          rationale: rationale.trim(),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setDescription("");
        setRationale("");
        toast({
          title: "Decision Intent Recorded",
          description: "Engineering decision logged with deterministic audit trail.",
          variant: "success",
        });
        await fetchDecisions();
        if (json.data?.id) {
          openInTab(json.data);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setFormError(errJson.error || "Failed to record decision intent.");
        toast({
          title: "Recording Failed",
          description: errJson.error || "Failed to save decision.",
          variant: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setFormError("A network error occurred while submitting.");
      toast({
        title: "Network Error",
        description: "Could not connect to the decision service.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="bg-white">
      <Stack gap={8}>
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-2">
              <GitCommit className="size-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Engineering Decision Audit Trail
              </h1>
              <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[9px] text-emerald-700">
                LIFECYCLE VERIFIED
              </Badge>
            </div>
            <p className="text-sm text-zinc-500">
              Trace engineering intent from proposal and approval through production milestones and
              measured outcomes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={focusProposeForm}
              size="sm"
              className="bg-emerald-600 font-semibold text-zinc-50 hover:bg-emerald-700 cursor-pointer"
            >
              <Plus className="mr-1.5 size-3.5" /> Propose Decision
            </Button>
            <Button
              onClick={fetchDecisions}
              variant="secondary"
              size="sm"
              className="border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
            >
              <RefreshCw className={cn("mr-2 size-3.5", isLoading && "animate-spin")} /> Refresh Audit Trail
            </Button>
          </div>
        </div>

        <SubTabInspector activeTab="overview" className="rounded-xl border border-zinc-200" />

        {/* WORKSPACE LAYOUT */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT: DECISIONS TIMELINE */}
          <div className="flex flex-col gap-4 text-left lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                Historical Decision Ledger ({decisions.length})
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-400">
                <RefreshCw className="size-6 animate-spin text-zinc-500" />
                <span className="text-xs">Loading ledger entries...</span>
              </div>
            ) : decisions.length === 0 ? (
              /* EMPTY STATE CARD */
              <Card className="border-zinc-200 bg-zinc-50 p-10">
                <CardContent className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-400 shadow-xs">
                    <FileText className="size-8" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900">
                    No engineering decisions recorded yet
                  </h3>
                  <p className="max-w-sm text-sm text-zinc-500">
                    Decisions proposed in this workspace will appear here with their full audit
                    trail once recorded.
                  </p>
                  <Button
                    onClick={focusProposeForm}
                    className="mt-2 bg-emerald-600 text-zinc-50 hover:bg-emerald-700 cursor-pointer"
                  >
                    <Plus className="mr-2 size-3.5" /> Propose Decision
                  </Button>
                </CardContent>
              </Card>
            ) : (
              decisions.map((d) => (
                <Link
                  key={d.id}
                  href={`/decisions/${d.id}`}
                  onClick={() => openInTab(d)}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition-all hover:border-zinc-300 hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-100 p-3 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-900 transition-colors">
                      <GitCommit className="size-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-900 transition-colors group-hover:text-emerald-700">
                          {d.description}
                        </h4>
                        <EpistemicBadge status={d.epistemicStatus || "RECORDED"} size="sm" />
                      </div>
                      <span className="mt-1 text-[10px] text-zinc-500 font-mono">
                        Type: {d.decisionType} · Status: {d.status} · Proposed by{" "}
                        {d.proposedBy?.name || "Engineer"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-zinc-400 group-hover:text-emerald-600 transition-colors" />
                </Link>
              ))
            )}
          </div>

          {/* RIGHT: PROPOSE DECISION FORM */}
          <div className="lg:col-span-1">
            <Card ref={proposeFormRef} className="scroll-mt-24 border-zinc-200 bg-white shadow-xs">
              <CardContent className="p-6">
                <form onSubmit={handleCreateDecision}>
                  <Stack gap={4}>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
                        Log Intent
                      </span>
                      <h3 className="text-sm font-bold text-zinc-900">
                        Propose Engineering Decision
                      </h3>
                    </div>

                    <Divider className="border-zinc-200" />

                    {formError && (
                      <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                        {formError}
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs font-semibold text-zinc-600">Decision Type</label>
                      <select
                        value={decisionType}
                        onChange={(e) => setDecisionType(e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="TOLERANCE_CHANGE">TOLERANCE_CHANGE (Bore / Dimensions)</option>
                        <option value="MATERIAL_SUB">MATERIAL_SUB (Alloy / Composite)</option>
                        <option value="SUPPLIER_CHANGE">SUPPLIER_CHANGE (Vendor Qualification)</option>
                        <option value="PROCESS_CHANGE">PROCESS_CHANGE (Manufacturing / Heat-Treat)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs font-semibold text-zinc-600">
                        Decision Summary
                      </label>
                      <Input
                        ref={summaryInputRef}
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Tighten bore tolerance ±0.015 → ±0.010"
                        className="h-10 border-zinc-200 bg-zinc-50 text-sm focus:bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs font-semibold text-zinc-600">
                        Engineering Rationale
                      </label>
                      <Input
                        required
                        value={rationale}
                        onChange={(e) => setRationale(e.target.value)}
                        placeholder="e.g. Improve fit margin by 30% for wing root bracket"
                        className="h-10 border-zinc-200 bg-zinc-50 text-sm focus:bg-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-10 w-full bg-emerald-600 text-xs font-semibold tracking-wider text-zinc-50 uppercase hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? "Logging Decision..." : "Record Decision Intent"}
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Stack>
    </PageContainer>
  );
}
