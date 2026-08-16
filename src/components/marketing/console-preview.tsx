"use client";

import { useState } from "react";
import { cn } from "@/shared/utils";

const CALLOUTS = [
  {
    id: "flatness",
    feature: "Flange face A",
    callout: "Flatness",
    requirement: "0.02 mm",
    measured: "0.014 mm",
    status: "PASS" as const,
  },
  {
    id: "concentricity",
    feature: "Bore Ø 412",
    callout: "Concentricity",
    requirement: "0.05 mm",
    measured: "0.031 mm",
    status: "PASS" as const,
  },
  {
    id: "perp",
    feature: "Bolt circle",
    callout: "Perpendicularity",
    requirement: "0.02 mm",
    measured: "0.014 mm",
    status: "PASS" as const,
  },
];

const HASH = "a7f3c91e2b84d06f1c55e8a0b9d4f217";

export function ConsolePreview() {
  const [selectedId, setSelectedId] = useState(CALLOUTS[0].id);
  const selected = CALLOUTS.find((item) => item.id === selectedId) ?? CALLOUTS[0];

  return (
    <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-slate-300" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-slate-300" aria-hidden="true" />
        <span className="size-2.5 rounded-full bg-slate-300" aria-hidden="true" />
        <span className="ml-3 truncate font-mono text-[11px] text-slate-500">
          Mission Console / drawings / Turbine-Flange-Assembly-RevB.dxf
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-b border-slate-200 p-6 lg:border-r lg:border-b-0">
          <p className="font-mono text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            GD&T blueprint analysis
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">
            Turbine Flange Assembly · Rev B
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Flange flatness 0.02 mm · concentricity PASS
          </p>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="p-3.5 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Callout
                  </th>
                  <th className="p-3.5 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Requirement
                  </th>
                  <th className="p-3.5 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {CALLOUTS.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "cursor-pointer border-b border-slate-100 text-sm text-slate-800 transition-colors last:border-0",
                      selectedId === row.id ? "bg-slate-50/80" : "hover:bg-slate-50/80",
                    )}
                  >
                    <td className="p-0">
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className="w-full p-3.5 text-left font-mono text-xs text-slate-600"
                      >
                        {row.callout}
                      </button>
                    </td>
                    <td className="p-0">
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className="w-full p-3.5 text-left text-sm"
                      >
                        {row.requirement}
                      </button>
                    </td>
                    <td className="p-0">
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className="w-full p-3.5 text-left font-mono text-xs text-emerald-700"
                      >
                        {row.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-slate-50 p-6">
          <p className="font-mono text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Epistemic state
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-900">{selected.feature}</p>
            <span className="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-xs text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
              DERIVED
            </span>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
              <dt className="text-slate-500">Measured</dt>
              <dd className="font-mono text-xs text-slate-600">{selected.measured}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
              <dt className="text-slate-500">Physics rules passed</dt>
              <dd className="font-mono text-xs text-slate-600">15</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
              <dt className="text-slate-500">Contradictions</dt>
              <dd className="font-mono text-xs text-slate-600">0</dd>
            </div>
            <div>
              <dt className="text-slate-500">SHA-256 evidence</dt>
              <dd className="mt-1 font-mono text-xs break-all text-slate-600">{HASH}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
