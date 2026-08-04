"use client";

import { useState } from "react";
import { ReasoningSearchResult } from "@/server/reasoning/types";

export function ReasoningSearchBar() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ReasoningSearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch("/api/reasoning/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const json = await res.json();
        setResult(json.data);
      }
    } catch {
      // Ignore
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask an engineering question (e.g. 'Can we substitute Grade 5 Titanium under cyclic fatigue?')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition disabled:opacity-50"
        >
          {isSearching ? "Reasoning..." : "Reason Query"}
        </button>
      </form>

      {result && (
        <div className="p-5 rounded-xl bg-slate-900 border border-cyan-900/60 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
              Reasoning Search Answer
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              Confidence: {Math.round(result.confidenceScore * 100)}%
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-medium">{result.answer}</p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Applied Principles:</span>
              <div className="flex flex-wrap gap-1">
                {result.appliedPrinciples.map((p) => (
                  <span
                    key={p.code}
                    className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-[10px]"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Cited Evidence Sources:</span>
              <ul className="space-y-1 text-slate-300">
                {result.citedEvidence.map((ev) => (
                  <li key={ev.id} className="truncate">
                    • {ev.title} ({Math.round(ev.weight * 100)}%)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
