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
    <div className="w-full space-y-6 rounded-xl border border-zinc-200 bg-white p-6 font-sans text-zinc-900 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <History className="h-5 w-5 text-indigo-400" /> Deterministic Precedent Failure Explorer
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Query historical failure precedents, invalidated assumptions, and evidence-backed
            corrective actions.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search material, part, failure mode..."
            className="w-64 rounded-xl border border-zinc-200 bg-zinc-100 py-2 pr-4 pl-9 text-xs text-zinc-900 placeholder-zinc-500 transition-all focus:border-indigo-500 focus:outline-none"
          />
        </form>
      </div>

      {/* Precedent Cards */}
      <div className="space-y-4">
        {precedents.map((p) => (
          <div
            key={p.id}
            className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-100 p-5 shadow-md transition-all hover:border-zinc-200"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-xs text-indigo-400">
                  {p.componentType}
                </span>
                <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-500">
                  Material: {p.material}
                </span>
              </div>
              <span className="font-mono text-xs text-zinc-500">{p.programContext}</span>
            </div>

            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> {p.failureMode}
            </h3>

            <p className="text-xs leading-relaxed text-zinc-700">
              <strong className="text-zinc-900">Root Cause:</strong> {p.rootCause}
            </p>

            <div className="grid grid-cols-1 gap-3 border-t border-zinc-200 pt-2 text-xs md:grid-cols-2">
              <div className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 p-3">
                <div className="flex items-center gap-1 font-semibold text-rose-700">
                  <AlertTriangle className="h-3.5 w-3.5" /> Invalidated Assumption:
                </div>
                <div className="text-zinc-700">{p.invalidatedAssumption}</div>
              </div>

              <div className="space-y-1 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Proven Corrective Action:
                </div>
                <div className="text-zinc-700">{p.provenCorrectiveAction}</div>
              </div>
            </div>

            {p.evidenceHashes.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="flex items-center gap-1 rounded border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[11px] text-zinc-500">
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
