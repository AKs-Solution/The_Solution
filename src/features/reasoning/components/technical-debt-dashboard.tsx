"use client";

import { useState } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, Hash, Layers } from "lucide-react";
import { TechnicalDebtItem } from "@/server/reasoning/technical-debt-engine";

interface TechnicalDebtDashboardProps {
  metrics: {
    totalDebtItems: number;
    criticalItems: number;
    highItems: number;
    mediumItems: number;
    lowItems: number;
    overallDebtScore: number;
  };
  items: TechnicalDebtItem[];
  onSelectDebtItem?: (item: TechnicalDebtItem) => void;
}

export function TechnicalDebtDashboard({
  metrics,
  items,
  onSelectDebtItem,
}: TechnicalDebtDashboardProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");

  const filteredItems = items.filter((i) => {
    if (selectedSeverity === "ALL") return true;
    return i.severity === selectedSeverity;
  });

  const getSeverityBadge = (severity: TechnicalDebtItem["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-400">
            <ShieldAlert className="h-3.5 w-3.5" /> CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" /> HIGH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> {severity}
          </span>
        );
    }
  };

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-6 font-sans text-zinc-900 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900">
            <ShieldAlert className="h-6 w-6 text-rose-400" /> Engineering Technical Debt Engine
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Continuous deterministic scan across 18 engineering debt categories with evidence-backed
            mitigations.
          </p>
        </div>

        {/* Overall Debt Score Badge */}
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5">
          <div>
            <div className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Engineering Health
            </div>
            <div className="flex items-baseline gap-1 text-2xl font-black text-zinc-900">
              {metrics.overallDebtScore}{" "}
              <span className="text-xs font-normal text-zinc-500">/ 100</span>
            </div>
          </div>
          <div className="h-8 w-px bg-zinc-100" />
          <div className="space-y-0.5 text-xs">
            <div className="font-semibold text-rose-400">{metrics.criticalItems} Critical</div>
            <div className="font-semibold text-amber-400">{metrics.highItems} High Risk</div>
          </div>
        </div>
      </div>

      {/* Severity Filters */}
      <div className="mt-6 flex items-center gap-2">
        {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverity(sev)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              selectedSeverity === sev
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/25"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Debt List */}
      <div className="mt-6 space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectDebtItem?.(item)}
            className="group cursor-pointer rounded-xl border border-zinc-200 bg-zinc-100 p-5 shadow-lg transition-all hover:border-zinc-200 hover:bg-zinc-100"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(item.severity)}
                  <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-xs text-indigo-400">
                    {item.category.replace("_", " ")}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-xs text-zinc-500">
                    <Layers className="h-3 w-3" /> Confidence: {Math.round(item.confidence * 100)}%
                  </span>
                </div>

                <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-indigo-300">
                  {item.title}
                  <ChevronRight className="h-4 w-4 text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </h3>

                <p className="text-xs leading-relaxed text-zinc-700">{item.description}</p>

                {item.evidenceHashes.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="flex items-center gap-1 rounded border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[11px] text-zinc-500">
                      <Hash className="h-3 w-3 text-emerald-400" />{" "}
                      {item.evidenceHashes[0].slice(0, 16)}...
                    </span>
                  </div>
                )}

                <div className="mt-3 border-t border-zinc-200 pt-2">
                  <div className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                    Recommended Remediation:
                  </div>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-zinc-700">
                    {item.recommendedActions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
