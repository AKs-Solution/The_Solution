"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Cpu,
  History,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Wrench,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, Badge } from "@/components/ui";
import { cn } from "@/shared/utils";
import { FusedDrawingRiskResult } from "@/server/drawings/rules/types";

interface DrawingRiskDashboardProps {
  assessment: FusedDrawingRiskResult;
  onRefresh?: () => void;
}

export function DrawingRiskDashboard({ assessment }: DrawingRiskDashboardProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "exp-rule-0": true, // Expand first item by default
  });

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const {
    metadata,
    assessments,
    confidenceMetrics,
    categoryBreakdown,
    explainability,
    triggeredRules,
  } = assessment;

  return (
    <div className="flex flex-col gap-6 text-zinc-900">
      {/* 1. TOP TITLE BLOCK METADATA CARD */}
      <Card className="border-indigo-500/20 bg-zinc-100 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-700">
                <FileText className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-zinc-900">
                    {metadata.partNumber}
                  </h2>
                  <Badge className="border-indigo-500/30 bg-indigo-500/10 font-mono text-indigo-700">
                    REV {metadata.revision}
                  </Badge>
                  <Badge className="border-amber-500/30 bg-amber-500/10 font-mono text-amber-700">
                    {metadata.materialFamily}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {metadata.material} • Standard: {metadata.drawingStandard}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-semibold text-zinc-500">OVERALL RISK SCORE</div>
                <div className="text-2xl font-black tracking-tight text-amber-600">
                  {assessments.overallAssessment.score} / 100
                </div>
              </div>
              <Badge
                className={cn(
                  "px-3 py-1 text-xs font-bold tracking-wider uppercase",
                  assessments.overallAssessment.level === "CRITICAL"
                    ? "border-rose-500/40 bg-rose-500/20 text-rose-700"
                    : assessments.overallAssessment.level === "HIGH"
                      ? "border-amber-500/40 bg-amber-500/20 text-amber-700"
                      : "border-emerald-500/40 bg-emerald-500/20 text-emerald-700",
                )}
              >
                {assessments.overallAssessment.level} RISK
              </Badge>
            </div>
          </div>

          {/* METADATA GRID */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-xs sm:grid-cols-4 lg:grid-cols-6">
            <div>
              <span className="block text-zinc-500">Finish:</span>
              <span className="font-semibold text-zinc-700">{metadata.finish || "None"}</span>
            </div>
            <div>
              <span className="block text-zinc-500">Datums:</span>
              <span className="font-mono font-semibold text-indigo-600">
                {metadata.datums.map((d) => `[${d}]`).join(" ")}
              </span>
            </div>
            <div>
              <span className="block text-zinc-500">Units:</span>
              <span className="font-semibold text-zinc-700 uppercase">{metadata.units}</span>
            </div>
            <div>
              <span className="block text-zinc-500">Scale:</span>
              <span className="font-semibold text-zinc-700">{metadata.scale || "1:1"}</span>
            </div>
            <div>
              <span className="block text-zinc-500">Threads Extracted:</span>
              <span className="font-semibold text-zinc-700">
                {metadata.threads.length > 0 ? metadata.threads[0] : "None"}
              </span>
            </div>
            <div>
              <span className="block text-zinc-500">Rules Triggered:</span>
              <span className="font-semibold text-amber-600">
                {triggeredRules.length} Manufacturing Rules
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. THREE-LAYER ASSESSMENT SUMMARY */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* ENGINEERING ASSESSMENT */}
        <Card className="border-indigo-500/30 bg-indigo-50">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="size-4 text-indigo-600" />
                <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
                  Engineering Assessment
                </span>
              </div>
              <Badge className="border-indigo-500/30 bg-indigo-500/10 font-mono text-[10px] text-indigo-700">
                Score: {assessments.engineeringAssessment.score}/100
              </Badge>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600">
              {assessments.engineeringAssessment.summary}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-indigo-500/20 pt-3 text-[11px]">
              <span className="text-zinc-500">Engineering Confidence:</span>
              <span className="font-bold text-indigo-600">
                {Math.round(confidenceMetrics.engineeringConfidence * 100)}% (
                {assessments.engineeringAssessment.confidenceLabel})
              </span>
            </div>
          </CardContent>
        </Card>

        {/* HISTORICAL ASSESSMENT */}
        <Card className="border-emerald-500/30 bg-emerald-50">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="size-4 text-emerald-600" />
                <span className="text-xs font-bold tracking-wider text-emerald-600 uppercase">
                  Historical Assessment
                </span>
              </div>
              <Badge className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-700">
                Score: {assessments.historicalAssessment.score}/100
              </Badge>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600">
              {assessments.historicalAssessment.summary}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-500/20 pt-3 text-[11px]">
              <span className="text-zinc-500">Historical Confidence:</span>
              <span className="font-bold text-emerald-600">
                {Math.round(confidenceMetrics.historicalConfidence * 100)}% (
                {assessments.historicalAssessment.confidenceLabel})
              </span>
            </div>
          </CardContent>
        </Card>

        {/* OVERALL ASSESSMENT */}
        <Card className="border-amber-500/30 bg-amber-50">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-600" />
                <span className="text-xs font-bold tracking-wider text-amber-600 uppercase">
                  Overall Assessment
                </span>
              </div>
              <Badge className="border-amber-500/30 bg-amber-500/10 font-mono text-[10px] text-amber-700">
                Score: {assessments.overallAssessment.score}/100
              </Badge>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600">
              {assessments.overallAssessment.summary}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-amber-500/20 pt-3 text-[11px]">
              <span className="text-zinc-500">Overall Fused Confidence:</span>
              <span className="font-bold text-amber-600">
                {Math.round(confidenceMetrics.overallConfidence * 100)}% (
                {assessments.overallAssessment.confidenceLabel})
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. EIGHT RISK CATEGORIES BREAKDOWN */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wider text-zinc-500 uppercase">
          <ShieldAlert className="size-4 text-indigo-600" />
          Risk Category Ratings (8 Dimensions)
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categoryBreakdown.map((cat) => (
            <div
              key={cat.category}
              className="flex flex-col justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-100 p-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600">{cat.category}</span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-bold",
                    cat.level === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-700"
                      : cat.level === "HIGH"
                        ? "bg-amber-500/20 text-amber-700"
                        : "bg-emerald-500/20 text-emerald-700",
                  )}
                >
                  {cat.level}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-zinc-900">{cat.score}</span>
                <span className="text-[10px] text-zinc-500">/ 100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. EXPANDABLE TOLERANCE CALLOUT EXPLANATIONS */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-zinc-500 uppercase">
            <Wrench className="size-4 text-indigo-600" />
            Tolerance & GD&T Risk Reasoning ({explainability.length} Callouts Evaluated)
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {explainability.map((item) => {
            const isExpanded = expandedItems[item.id] ?? false;
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 transition-colors hover:border-zinc-400"
              >
                {/* CARD HEADER */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700">
                      <AlertTriangle className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                        <span>{item.featureCallout}</span>
                        <Badge className="border-amber-500/30 bg-amber-500/10 font-mono text-[10px] text-amber-700">
                          {item.ruleTriggered}
                        </Badge>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{item.why}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <Badge
                      className={cn(
                        "text-[10px] font-bold uppercase",
                        item.riskRating === "HIGH"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
                      )}
                    >
                      Confidence: {Math.round(item.overallConfidence * 100)}%
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="size-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                {/* EXPANDABLE CONTENT */}
                {isExpanded && (
                  <div className="flex flex-col gap-4 border-t border-zinc-200 bg-zinc-100 p-5 text-xs">
                    {/* WHY REASONING */}
                    <div>
                      <span className="mb-1 block font-bold tracking-wider text-indigo-600 uppercase">
                        Manufacturing Physics Reasoning (Why)
                      </span>
                      <p className="rounded-lg border border-zinc-200 bg-zinc-100 p-3 leading-relaxed text-zinc-700">
                        {item.why}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* EVIDENCE */}
                      <div>
                        <span className="mb-1 block font-bold tracking-wider text-zinc-500 uppercase">
                          Extracted Evidence
                        </span>
                        <div className="rounded border border-zinc-200 bg-zinc-100 p-2.5 font-mono text-zinc-600">
                          {item.evidence}
                        </div>
                      </div>

                      {/* HISTORICAL PRECEDENT */}
                      <div>
                        <span className="mb-1 block font-bold tracking-wider text-emerald-600 uppercase">
                          Historical Assessment
                        </span>
                        <div className="rounded border border-zinc-200 bg-zinc-100 p-2.5 leading-relaxed text-zinc-600">
                          {item.historicalPrecedentUsed}
                        </div>
                      </div>
                    </div>

                    {/* ACTIONABLE RECOMMENDATION */}
                    <div>
                      <span className="mb-1 block font-bold tracking-wider text-amber-600 uppercase">
                        Actionable Mitigation Recommendation
                      </span>
                      <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-amber-700">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-amber-700" />
                        <span>{item.recommendation}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
