"use client";

import { useState } from "react";
import { Search, History, Hash, CheckCircle2, AlertTriangle } from "lucide-react";
import { HistoricalFailurePrecedent } from "@/server/sentinel/precedent-failure-engine";

interface PrecedentExplorerProps {
  precedents: HistoricalFailurePrecedent[];
  onSearch?: (query: string) => void;
}

export function PrecedentExplorer({ precedents, onSearch }: PrecedentExplorerProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchTerm);
  };

  return (
    <div className="w-full space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-6 font-sans text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <History className="h-5 w-5 text-indigo-400" /> Deterministic Precedent Failure Explorer
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Query historical failure precedents, invalidated assumptions, and evidence-backed
            corrective actions.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search material, part, failure mode..."
            className="w-64 rounded-xl border border-slate-700 bg-slate-800 py-2 pr-4 pl-9 text-xs text-white placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-none"
          />
        </form>
      </div>

      {/* Precedent Cards */}
      <div className="space-y-4">
        {precedents.map((p) => (
          <div
            key={p.id}
            className="space-y-3 rounded-xl border border-slate-800 bg-slate-800/40 p-5 shadow-md transition-all hover:border-slate-700"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-xs text-indigo-400">
                  {p.componentType}
                </span>
                <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-400">
                  Material: {p.material}
                </span>
              </div>
              <span className="font-mono text-xs text-slate-400">{p.programContext}</span>
            </div>

            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> {p.failureMode}
            </h3>

            <p className="text-xs leading-relaxed text-slate-300">
              <strong className="text-slate-200">Root Cause:</strong> {p.rootCause}
            </p>

            <div className="grid grid-cols-1 gap-3 border-t border-slate-800/60 pt-2 text-xs md:grid-cols-2">
              <div className="space-y-1 rounded-lg border border-rose-500/20 bg-rose-950/20 p-3">
                <div className="flex items-center gap-1 font-semibold text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> Invalidated Assumption:
                </div>
                <div className="text-slate-300">{p.invalidatedAssumption}</div>
              </div>

              <div className="space-y-1 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3">
                <div className="flex items-center gap-1 font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Proven Corrective Action:
                </div>
                <div className="text-slate-300">{p.provenCorrectiveAction}</div>
              </div>
            </div>

            {p.evidenceHashes.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-[11px] text-slate-400">
                  <Hash className="h-3 w-3 text-emerald-400" /> {p.evidenceHashes[0]}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
