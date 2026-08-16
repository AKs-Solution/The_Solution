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
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-500 disabled:opacity-50"
        >
          {isSearching ? "Reasoning..." : "Reason Query"}
        </button>
      </form>

      {result && (
        <div className="space-y-3 rounded-xl border border-cyan-900/60 bg-white p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-mono text-[10px] tracking-wider text-cyan-400 uppercase">
              Reasoning Search Answer
            </span>
            <span className="rounded border border-cyan-800 bg-cyan-950 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
              Confidence: {Math.round(result.confidenceScore * 100)}%
            </span>
          </div>

          <p className="text-xs leading-relaxed font-medium text-slate-900">{result.answer}</p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
            <div>
              <span className="mb-1 block font-semibold text-slate-500">Applied Principles:</span>
              <div className="flex flex-wrap gap-1">
                {result.appliedPrinciples.map((p) => (
                  <span
                    key={p.code}
                    className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-cyan-300"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-1 block font-semibold text-slate-500">
                Cited Evidence Sources:
              </span>
              <ul className="space-y-1 text-slate-700">
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
