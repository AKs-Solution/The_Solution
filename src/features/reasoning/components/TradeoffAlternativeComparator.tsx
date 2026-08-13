"use client";

import { AlternativeData, TradeoffData } from "@/server/reasoning/types";

interface Props {
  tradeoffs: TradeoffData[];
  alternatives: AlternativeData[];
}

export function TradeoffAlternativeComparator({ tradeoffs, alternatives }: Props) {
  return (
    <div className="space-y-6">
      {/* Alternatives Comparison */}
      <div>
        <h3 className="mb-1 text-lg font-semibold text-zinc-900">Generated Design Alternatives</h3>
        <p className="mb-4 text-xs text-zinc-500">
          Comparative evaluation of candidate engineering designs against system requirements.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {alternatives.map((alt) => {
            const isSelected = alt.status === "SELECTED";
            const isRejected = alt.status === "REJECTED";

            return (
              <div
                key={alt.id || alt.name}
                className={`rounded-xl border p-4 backdrop-blur-md ${
                  isSelected
                    ? "border-emerald-500/40 bg-emerald-950/40"
                    : isRejected
                      ? "border-rose-500/30 bg-rose-950/30"
                      : "border-zinc-200 bg-white"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">{alt.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isSelected
                        ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : isRejected
                          ? "border border-rose-500/40 bg-rose-500/20 text-rose-300"
                          : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {alt.status} (Score: {alt.score})
                  </span>
                </div>

                <p className="mb-3 text-xs text-zinc-700">{alt.description}</p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-emerald-900/30 bg-white p-2.5">
                    <span className="mb-1 block text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                      Pros
                    </span>
                    <ul className="list-inside list-disc space-y-0.5 text-zinc-700">
                      {alt.pros.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-rose-900/30 bg-white p-2.5">
                    <span className="mb-1 block text-[10px] font-bold tracking-wider text-rose-400 uppercase">
                      Cons
                    </span>
                    <ul className="list-inside list-disc space-y-0.5 text-zinc-700">
                      {alt.cons.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {alt.rejectionReason && (
                  <div className="mt-3 rounded border border-rose-800/40 bg-rose-950/60 p-2 text-xs text-rose-300">
                    <span className="font-semibold">Rejection Rationale:</span>{" "}
                    {alt.rejectionReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tradeoff Matrix */}
      <div>
        <h3 className="mb-1 text-lg font-semibold text-zinc-900">Tradeoff Evaluation Vectors</h3>
        <p className="mb-3 text-xs text-zinc-500">
          Multi-attribute tradeoff balances across competing constraints.
        </p>

        <div className="space-y-3">
          {tradeoffs.map((t) => (
            <div
              key={t.id || t.criterion}
              className="rounded-xl border border-zinc-200 bg-white p-3.5 text-xs"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-bold text-cyan-300">{t.criterion}</span>
                {t.selectedOption && (
                  <span className="font-mono text-[11px] text-emerald-400">
                    Selected Option: {t.selectedOption}
                  </span>
                )}
              </div>
              <p className="leading-relaxed text-zinc-700">{t.comparisonDetails}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
