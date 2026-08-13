"use client";

import { useState } from "react";
import { EngineeringPrincipleData } from "@/server/reasoning/types";

interface Props {
  principles: EngineeringPrincipleData[];
}

export function EngineeringPrincipleExplorer({ principles }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const categories = Array.from(new Set(principles.map((p) => p.category)));

  const filtered = principles.filter((p) => {
    if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">Engineering Principle Library</h3>
          <p className="text-xs text-zinc-500">
            Reusable, versioned, governing physical and systemic principles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search principles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-cyan-500 focus:outline-none"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Categories ({principles.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((pr) => (
          <div
            key={pr.code}
            className="rounded-xl border border-zinc-200 bg-white p-4 backdrop-blur-md transition-all hover:border-zinc-200"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded border border-purple-800 bg-purple-950 px-2 py-0.5 font-mono text-xs text-purple-300">
                {pr.code}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-500">Category: {pr.category}</span>
                <span className="font-mono text-xs text-zinc-500">v{pr.version}</span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-zinc-900">{pr.name}</h4>
            <p className="mt-1 text-xs leading-relaxed text-zinc-700">{pr.description}</p>

            {pr.governingEquations && pr.governingEquations.length > 0 && (
              <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-2.5">
                <span className="mb-1 block font-mono text-[10px] text-zinc-500 uppercase">
                  Governing Equations:
                </span>
                {pr.governingEquations.map((eq, i) => (
                  <code key={i} className="block font-mono text-xs font-semibold text-cyan-300">
                    {eq}
                  </code>
                ))}
              </div>
            )}

            {pr.supportingEvidenceRefs && pr.supportingEvidenceRefs.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-zinc-500">Refs:</span>
                {pr.supportingEvidenceRefs.map((ref, i) => (
                  <span
                    key={i}
                    className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500"
                  >
                    {ref}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
