"use client";

import { useState } from "react";
import { AlertOctagon, CheckCircle, ShieldAlert, Zap } from "lucide-react";

export interface AssumptionItem {
  id: string;
  statement: string;
  justification: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  impactIfInvalid: string;
  isVerified: boolean;
}

interface AssumptionTrackerProps {
  assumptions: AssumptionItem[];
  onInvalidate?: (assumptionId: string, reason: string) => Promise<void>;
}

export function AssumptionTracker({ assumptions, onInvalidate }: AssumptionTrackerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleInvalidate = async (id: string) => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await onInvalidate?.(id, reason);
      setSelectedId(null);
      setReason("");
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk: AssumptionItem["riskLevel"]) => {
    switch (risk) {
      case "CRITICAL":
        return (
          <span className="rounded border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-400">
            CRITICAL RISK
          </span>
        );
      case "HIGH":
        return (
          <span className="rounded border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
            HIGH RISK
          </span>
        );
      default:
        return (
          <span className="rounded border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
            {risk} RISK
          </span>
        );
    }
  };

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-900 p-6 font-sans text-slate-100 shadow-2xl">
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Zap className="h-5 w-5 text-amber-400" /> First-Class Engineering Assumptions
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Tracking validation status. Invalidating an assumption automatically propagates warnings
            to dependent decisions.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {assumptions.map((asm) => (
          <div
            key={asm.id}
            className={`rounded-xl border p-4 transition-all ${
              asm.isVerified
                ? "border-slate-800 bg-slate-800/40"
                : "border-amber-500/30 bg-amber-950/20 shadow-lg shadow-amber-950/20"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {asm.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle className="h-3.5 w-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
                      <AlertOctagon className="h-3.5 w-3.5" /> Unverified / Invalidated
                    </span>
                  )}
                  {getRiskBadge(asm.riskLevel)}
                </div>

                <h3 className="mt-2 text-sm font-semibold text-slate-100">{asm.statement}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  <strong className="text-slate-300">Justification:</strong> {asm.justification}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  <strong className="text-rose-400">Impact if Invalid:</strong>{" "}
                  {asm.impactIfInvalid}
                </p>
              </div>

              {asm.isVerified && (
                <button
                  onClick={() => setSelectedId(selectedId === asm.id ? null : asm.id)}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-600/20 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-600 hover:text-white"
                >
                  <ShieldAlert className="h-3.5 w-3.5" /> Invalidate
                </button>
              )}
            </div>

            {selectedId === asm.id && (
              <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide explicit engineering reason for invalidating this assumption..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-rose-500 focus:outline-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading || !reason.trim()}
                    onClick={() => handleInvalidate(asm.id)}
                    className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 disabled:opacity-50"
                  >
                    {loading ? "Propagating..." : "Confirm Invalidation & Trigger Warnings"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
