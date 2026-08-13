"use client";

import { EngineeringConclusionData } from "@/server/reasoning/types";

interface Props {
  conclusion: EngineeringConclusionData | null;
  confidenceScore: number;
  isSupportedByEvidence: boolean;
  citations: Array<{ evidenceId: string; citationText: string; relevanceWeight: number }>;
}

export function ConclusionExplanationPanel({
  conclusion,
  confidenceScore,
  isSupportedByEvidence,
  citations,
}: Props) {
  if (!conclusion) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-xs text-zinc-500 italic">
        No conclusion generated yet. Execute a reasoning session to derive evidence-backed
        conclusions.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Conclusion Banner */}
      <div
        className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md transition-all ${
          isSupportedByEvidence
            ? "border-emerald-500/50 bg-gradient-to-br from-white via-emerald-950/40 to-white shadow-emerald-950/30"
            : "border-rose-500/50 bg-gradient-to-br from-white via-rose-950/40 to-white shadow-rose-950/30"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`h-3.5 w-3.5 rounded-full ${
                isSupportedByEvidence ? "animate-pulse bg-emerald-400" : "bg-rose-500"
              }`}
            ></span>
            <h3 className="text-xl font-bold tracking-tight text-zinc-900">
              {isSupportedByEvidence
                ? "Verified Engineering Conclusion"
                : "Insufficient Evidence Warning"}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-500">Confidence Score:</span>
            <span
              className={`rounded-lg border px-3 py-1 font-mono text-sm font-extrabold ${
                confidenceScore >= 0.8
                  ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                  : confidenceScore >= 0.5
                    ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                    : "border-rose-500/40 bg-rose-500/20 text-rose-300"
              }`}
            >
              {Math.round(confidenceScore * 100)}%
            </span>
          </div>
        </div>

        <p className="text-sm leading-relaxed font-medium text-zinc-900">{conclusion.statement}</p>

        {conclusion.recommendation && (
          <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-4 text-xs">
            <span className="mb-1 block font-bold tracking-wider text-cyan-400 uppercase">
              Review Board Recommendation:
            </span>
            <p className="leading-relaxed text-zinc-700">{conclusion.recommendation}</p>
          </div>
        )}
      </div>

      {/* Traceable Citations */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-zinc-900">
          Traceable Evidence Citations ({citations.length})
        </h4>
        <div className="space-y-2">
          {citations.map((c) => (
            <div
              key={c.evidenceId}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700"
            >
              <span className="font-mono text-cyan-300">{c.citationText}</span>
              <span className="font-mono text-[11px] text-zinc-500">
                Weight: {c.relevanceWeight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
