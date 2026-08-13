"use client";

import { useState } from "react";
import { Search, FileSearch, Hash, AlertTriangle, CheckCircle2, Play } from "lucide-react";
import { InvestigationReport } from "@/server/copilot/investigation-engine";

interface InvestigationWorkspaceProps {
  report?: InvestigationReport;
  onRunInvestigation?: (topic: string) => Promise<InvestigationReport>;
}

export function InvestigationWorkspace({
  report: initialReport,
  onRunInvestigation,
}: InvestigationWorkspaceProps) {
  const [topic, setTopic] = useState<string>("Titanium fastener vibration fatigue failures");
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<InvestigationReport | undefined>(initialReport);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;
    setLoading(true);
    try {
      if (onRunInvestigation) {
        const res = await onRunInvestigation(topic);
        setReport(res);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 rounded-xl border border-zinc-200 bg-white p-6 font-sans text-zinc-900 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <FileSearch className="h-5 w-5 text-indigo-400" /> Automated Engineering Investigation
            Workspace
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Execute deep automated investigations across drawings, quality events, telemetry
            streams, and failure precedents.
          </p>
        </div>

        {/* Launcher Form */}
        <form onSubmit={handleRun} className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter investigation topic..."
              className="w-72 rounded-xl border border-zinc-200 bg-zinc-100 py-2 pr-4 pl-9 text-xs text-zinc-900 placeholder-zinc-500 transition-all focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" /> {loading ? "Investigating..." : "Run"}
          </button>
        </form>
      </div>

      {/* Report Display */}
      {report && (
        <div className="space-y-6">
          <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-100 p-5">
            <div className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Executive Summary
            </div>
            <p className="text-xs leading-relaxed text-zinc-900">{report.executiveSummary}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-rose-500/20 bg-rose-950/20 p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-rose-400 uppercase">
                <AlertTriangle className="h-4 w-4" /> Root Causes Identified
              </h3>
              <ul className="list-inside list-disc space-y-1 text-xs text-zinc-700">
                {report.rootCauses.map((rc, idx) => (
                  <li key={idx}>{rc}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-400 uppercase">
                <CheckCircle2 className="h-4 w-4" /> Proven Corrective Actions
              </h3>
              <ul className="list-inside list-disc space-y-1 text-xs text-zinc-700">
                {report.provenCorrectiveActions.map((pca, idx) => (
                  <li key={idx}>{pca}</li>
                ))}
              </ul>
            </div>
          </div>

          {report.evidenceHashes.length > 0 && (
            <div className="flex items-center gap-2 border-t border-zinc-200 pt-2">
              <span className="text-xs font-semibold text-zinc-500">Evidence Hashes:</span>
              {report.evidenceHashes.map((hash, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 rounded border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[11px] text-emerald-400"
                >
                  <Hash className="h-3 w-3" /> {hash.slice(0, 16)}...
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
