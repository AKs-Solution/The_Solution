"use client";

import { ConflictData } from "@/server/reasoning/types";

interface Props {
  conflicts: ConflictData[];
  uncertainties: string[];
}

const severityColors: Record<
  ConflictData["severity"],
  { bg: string; border: string; badge: string }
> = {
  CRITICAL: { bg: "bg-rose-950/50", border: "border-rose-500/60", badge: "bg-rose-500 text-white" },
  HIGH: {
    bg: "bg-orange-950/50",
    border: "border-orange-500/50",
    badge: "bg-orange-500/20 text-orange-300 border border-orange-500/40",
  },
  MEDIUM: {
    bg: "bg-amber-950/40",
    border: "border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
  },
  LOW: { bg: "bg-white", border: "border-slate-200", badge: "bg-slate-100 text-slate-500" },
};

export function ConflictAlertCenter({ conflicts, uncertainties }: Props) {
  return (
    <div className="space-y-6">
      {/* Detected Conflicts */}
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            Conflict Detection & Contradiction Alerts
          </h3>
          <span className="font-mono text-xs text-slate-500">
            {conflicts.length} Active Conflicts Detected
          </span>
        </div>

        {conflicts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
            No contradictory evidence, circular reasoning, or principle violations detected.
          </div>
        ) : (
          <div className="space-y-3">
            {conflicts.map((cf) => {
              const styles = severityColors[cf.severity] || severityColors.LOW;

              return (
                <div
                  key={cf.id || cf.description}
                  className={`rounded-xl border p-4 ${styles.bg} ${styles.border} backdrop-blur-md`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {cf.conflictType.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${styles.badge}`}
                    >
                      {cf.severity}
                    </span>
                  </div>

                  <p className="mb-3 text-xs leading-relaxed text-slate-900">{cf.description}</p>

                  <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
                    <span className="mb-1 block font-semibold text-cyan-300">
                      Mitigation Recommendation:
                    </span>
                    <p className="text-slate-700 italic">{cf.mitigationRecommendation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Remaining Uncertainties */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-slate-900">
          Remaining Engineering Uncertainties
        </h4>
        {uncertainties.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No unresolved uncertainties remaining.</p>
        ) : (
          <ul className="space-y-2">
            {uncertainties.map((u, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700"
              >
                <span className="font-bold text-amber-400">•</span>
                <span>{u}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
