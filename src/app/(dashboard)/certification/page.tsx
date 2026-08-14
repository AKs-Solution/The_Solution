"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileCheck2,
  Gauge,
  History,
  RefreshCw,
  ShieldCheck,
  Timer,
  TrendingUp,
} from "lucide-react";
import {
  PageContainer,
  Stack,
  Widget,
  WidgetGrid,
  WidgetCustomizeMenu,
  type WidgetConfig,
} from "@/components/layout";
import { Badge, Button, Checkbox } from "@/components/ui";
import { cn } from "@/shared/utils";

const WIDGETS: WidgetConfig[] = [
  {
    id: "certification-prediction",
    title: "Certification Prediction",
    description: "Deterministic FAA outcome assessment",
    icon: Gauge,
    span: "md:col-span-2 xl:col-span-2",
  },
  {
    id: "certification-reasoning",
    title: "Deterministic Reasoning",
    description: "Basis, timeline, and recommended action",
    icon: ShieldCheck,
    span: "md:col-span-2 xl:col-span-2",
  },
  {
    id: "certification-precedents",
    title: "Historical Certification Precedents",
    description: "Program-matched FAA outcomes",
    icon: History,
    span: "md:col-span-2 xl:col-span-4",
  },
];

const CHANGE_TYPES = [
  "Fatigue Allowable Change",
  "Material Grade Upgrade",
  "Primary Load Path Change",
  "Structural Margin Reduction",
];

interface CertificationAssessmentBody {
  changeType: string;
  allowableChangePercent: number;
  materialChange: boolean;
  loadCaseChange: boolean;
  aircraft: string;
}

interface CertificationPrecedentDetail {
  program: string;
  allowableChange: string;
  faaOutcome: string;
  duration: string;
  costImpact: string;
}

interface CertificationResult {
  prediction: string;
  confidence: number;
  historicalPrecedents: number;
  primaryReason: string;
  expectedTimeline: string;
  recommendedAction: string;
  precedentDetails?: CertificationPrecedentDetail[];
}

export default function CertificationPage() {
  const [changeType, setChangeType] = useState(CHANGE_TYPES[0]);
  const [allowableChangePercent, setAllowableChangePercent] = useState(15);
  const [materialChange, setMaterialChange] = useState(false);
  const [loadCaseChange, setLoadCaseChange] = useState(false);
  const [aircraft, setAircraft] = useState("B787");
  const [result, setResult] = useState<CertificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAssessment = useCallback(async (body: CertificationAssessmentBody) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/intelligence/certification-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = await res.json();
        setResult(json.data ?? null);
      }
    } catch {
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void runAssessment({
        changeType,
        allowableChangePercent: 15,
        materialChange: false,
        loadCaseChange: false,
        aircraft,
      });
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runAssessment({
      changeType,
      allowableChangePercent,
      materialChange,
      loadCaseChange,
      aircraft,
    });
  }

  const prediction = result?.prediction ?? "UNCERTAIN";

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-md border border-indigo-500/20 bg-indigo-500/10 text-indigo-500">
                <FileCheck2 className="size-4.5" />
              </span>
              <h1 className="text-foreground text-2xl font-extrabold tracking-tight md:text-3xl">
                Certification Readiness
              </h1>
              <Badge className="hidden border-indigo-500/20 bg-indigo-500/10 text-[9px] text-indigo-600 sm:inline-flex">
                DETERMINISTIC
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Evaluate a planned design change against FAA certification precedents before it enters
              the pipeline.
            </p>
          </div>
          <WidgetCustomizeMenu widgets={WIDGETS} />
        </div>

        <form onSubmit={handleSubmit} className="border-border bg-background rounded-lg border p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs font-medium">Change type</span>
              <select
                value={changeType}
                onChange={(e) => setChangeType(e.target.value)}
                className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
              >
                {CHANGE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs font-medium">
                Allowable change:{" "}
                <span className="text-foreground font-mono">{allowableChangePercent}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={30}
                value={allowableChangePercent}
                onChange={(e) => setAllowableChangePercent(Number(e.target.value))}
                className="accent-foreground mt-2 w-full"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs font-medium">Program</span>
              <select
                value={aircraft}
                onChange={(e) => setAircraft(e.target.value)}
                className="border-border bg-background text-foreground focus-visible:ring-ring rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
              >
                {["B787", "A350", "B737", "A320", "C919"].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col justify-end gap-2">
              <div className="flex items-center justify-between gap-2">
                <Checkbox
                  checked={materialChange}
                  onChange={(e) => setMaterialChange(e.target.checked)}
                  label="Material change"
                />
                <Checkbox
                  checked={loadCaseChange}
                  onChange={(e) => setLoadCaseChange(e.target.checked)}
                  label="Load case change"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button type="submit" disabled={isLoading} className="gap-2">
              <RefreshCw className={cn("size-4", isLoading && "animate-spin")} aria-hidden="true" />
              {isLoading ? "Assessing..." : "Run Certification Assessment"}
            </Button>
          </div>
        </form>

        {isLoading ? (
          <div className="border-border bg-background text-muted-foreground flex items-center justify-center rounded-lg border py-24 text-sm">
            Evaluating against FAA certification precedents...
          </div>
        ) : (
          <WidgetGrid
            widgets={WIDGETS}
            columns="grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
            render={(config) => {
              switch (config.id) {
                case "certification-prediction":
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="flex flex-col items-center gap-4 py-2 text-center">
                        <span
                          className={cn(
                            "rounded-lg border px-4 py-2 font-mono text-lg font-extrabold tracking-wide",
                            prediction === "REQUIRED"
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-600"
                              : prediction === "NOT_REQUIRED"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-600",
                          )}
                        >
                          {prediction.replace("_", " ")}
                        </span>
                        <div className="w-full">
                          <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                            <span>Confidence</span>
                            <span className="text-foreground font-mono font-bold">
                              {((result?.confidence ?? 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                              style={{
                                width: `${Math.round((result?.confidence ?? 0) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                          <TrendingUp className="size-3.5" aria-hidden="true" />
                          {result?.historicalPrecedents ?? 0} historical precedents evaluated
                        </div>
                      </div>
                    </Widget>
                  );

                case "certification-reasoning":
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="flex flex-col gap-3">
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                          <span className="text-muted-foreground block text-[10px] font-semibold tracking-wider uppercase">
                            Primary basis
                          </span>
                          <p className="text-foreground mt-1 text-xs leading-relaxed">
                            {result?.primaryReason ?? "Awaiting assessment."}
                          </p>
                        </div>
                        <div className="border-border flex items-center gap-2 rounded-lg border p-3 text-xs">
                          <Timer className="size-4 shrink-0 text-amber-500" aria-hidden="true" />
                          <span className="text-muted-foreground">Expected timeline</span>
                          <span className="text-foreground ml-auto font-semibold">
                            {result?.expectedTimeline ?? "—"}
                          </span>
                        </div>
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                          <span className="text-muted-foreground block text-[10px] font-semibold tracking-wider uppercase">
                            Recommended action
                          </span>
                          <p className="text-foreground mt-1 text-xs leading-relaxed">
                            {result?.recommendedAction ?? "Awaiting assessment."}
                          </p>
                        </div>
                      </div>
                    </Widget>
                  );

                case "certification-precedents":
                  return (
                    <Widget key={config.id} config={config}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="text-muted-foreground border-border border-b font-mono text-[10px] tracking-wider uppercase">
                              <th className="density-px-sm density-py-sm font-semibold">Program</th>
                              <th className="density-px-sm density-py-sm font-semibold">Change</th>
                              <th className="density-px-sm density-py-sm font-semibold">
                                FAA outcome
                              </th>
                              <th className="density-px-sm density-py-sm font-semibold">
                                Duration
                              </th>
                              <th className="density-px-sm density-py-sm font-semibold">
                                Cost impact
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-border divide-y">
                            {(result?.precedentDetails ?? []).map(
                              (p: CertificationPrecedentDetail, i: number) => (
                                <tr key={i} className="hover:bg-surface-hover transition-colors">
                                  <td className="text-foreground density-px-sm density-py-sm font-medium">
                                    {p.program}
                                  </td>
                                  <td className="text-muted-foreground density-px-sm density-py-sm">
                                    {p.allowableChange}
                                  </td>
                                  <td className="density-px-sm density-py-sm">
                                    <span
                                      className={cn(
                                        "rounded px-2 py-0.5 font-mono text-[10px] font-semibold",
                                        p.faaOutcome.toLowerCase().includes("required")
                                          ? "bg-rose-500/10 text-rose-600"
                                          : "bg-emerald-500/10 text-emerald-600",
                                      )}
                                    >
                                      {p.faaOutcome}
                                    </span>
                                  </td>
                                  <td className="text-muted-foreground density-px-sm density-py-sm font-mono text-xs">
                                    {p.duration}
                                  </td>
                                  <td className="text-muted-foreground density-px-sm density-py-sm text-xs">
                                    {p.costImpact}
                                  </td>
                                </tr>
                              ),
                            )}
                            {(result?.precedentDetails ?? []).length === 0 && (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="text-muted-foreground density-py-sm text-center text-xs"
                                >
                                  No precedents on record for this configuration.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Widget>
                  );

                default:
                  return null;
              }
            }}
          />
        )}
      </Stack>
    </PageContainer>
  );
}
