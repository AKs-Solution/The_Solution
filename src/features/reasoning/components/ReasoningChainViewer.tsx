"use client";

import { ReasoningStepData } from "@/server/reasoning/types";

interface Props {
  steps: ReasoningStepData[];
  currentStageIndex?: number;
}

export function ReasoningChainViewer({ steps }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-400"></span>
          14-Stage Reasoning Pipeline Execution
        </h3>
        <span className="font-mono text-xs text-slate-500">
          {steps.filter((s) => s.status === "COMPLETED").length} / {steps.length || 14} Stages
          Complete
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => {
          const isCompleted = step.status === "COMPLETED";
          const isFailed = step.status === "FAILED";

          return (
            <div
              key={step.id || step.stageIndex}
              className={`rounded-xl border p-4 backdrop-blur-md transition-all duration-200 ${
                isCompleted
                  ? "border-cyan-500/30 bg-white shadow-lg shadow-cyan-950/20 hover:border-cyan-500/60"
                  : isFailed
                    ? "border-rose-500/40 bg-rose-950/40"
                    : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-md border border-cyan-500/20 bg-slate-100 px-2 py-0.5 font-mono text-xs text-cyan-400">
                  Stage {step.stageIndex}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isCompleted
                      ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                      : isFailed
                        ? "border border-rose-500/30 bg-rose-500/20 text-rose-300"
                        : "border border-amber-500/30 bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {step.status}
                </span>
              </div>

              <h4 className="text-sm font-semibold tracking-wide text-slate-900 capitalize">
                {step.stageName.replace(/_/g, " ")}
              </h4>

              {step.durationMs !== undefined && (
                <div className="mt-3 flex items-center justify-between font-mono text-xs text-slate-500">
                  <span>Execution Time</span>
                  <span>{step.durationMs} ms</span>
                </div>
              )}

              {step.errorMessage && (
                <p className="mt-2 rounded border border-rose-800/40 bg-rose-950/60 p-2 text-xs text-rose-300">
                  {step.errorMessage}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
