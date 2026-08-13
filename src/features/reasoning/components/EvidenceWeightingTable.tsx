"use client";

import { EvidenceWeightResult } from "@/server/reasoning/types";

interface Props {
  weights: EvidenceWeightResult[];
}

export function EvidenceWeightingTable({ weights }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">
            Transparent Evidence Weighting Matrix
          </h3>
          <p className="text-xs text-zinc-500">
            Multi-factor evaluation breakdown for every piece of evidence used in the reasoning
            pipeline.
          </p>
        </div>
        <span className="rounded-full border border-cyan-800 bg-cyan-950 px-3 py-1 font-mono text-xs text-cyan-300">
          {weights.length} Evidence Sources Evaluated
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-xs text-zinc-700">
          <thead className="border-b border-zinc-200 bg-white font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
            <tr>
              <th className="px-4 py-3">Evidence Title & Type</th>
              <th className="px-3 py-3">Verification</th>
              <th className="px-3 py-3">Source Quality</th>
              <th className="px-3 py-3">Recency</th>
              <th className="px-3 py-3">Relevance</th>
              <th className="px-3 py-3">Confirmation</th>
              <th className="px-3 py-3">Conflict Penalty</th>
              <th className="px-4 py-3 text-right">Final Weight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {weights.map((w) => (
              <tr key={w.evidenceId} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  <div className="font-semibold text-zinc-900">{w.title}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-cyan-400">{w.evidenceType}</div>
                  <div className="mt-1 text-[11px] leading-relaxed text-zinc-500 italic">
                    &quot;{w.weightExplanation}&quot;
                  </div>
                </td>
                <td className="px-3 py-3 font-mono">{Math.round(w.verificationLevel * 100)}%</td>
                <td className="px-3 py-3 font-mono">{Math.round(w.sourceQuality * 100)}%</td>
                <td className="px-3 py-3 font-mono">{Math.round(w.recencyScore * 100)}%</td>
                <td className="px-3 py-3 font-mono">{Math.round(w.relevanceScore * 100)}%</td>
                <td className="px-3 py-3 font-mono">
                  {w.independentConfirmation ? (
                    <span className="font-semibold text-emerald-400">+15% Boost</span>
                  ) : (
                    <span className="text-zinc-500">None</span>
                  )}
                </td>
                <td className="px-3 py-3 font-mono">
                  {w.conflictingScore > 0 ? (
                    <span className="font-semibold text-rose-400">
                      -{Math.round(w.conflictingScore * 100)}%
                    </span>
                  ) : (
                    <span className="text-zinc-500">0%</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm font-bold text-cyan-300">
                  {w.finalWeight}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
