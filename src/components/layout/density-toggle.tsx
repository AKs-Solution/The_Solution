"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export type DensityMode = "compact" | "comfortable";

export function DensityToggle() {
  const [density, setDensity] = useState<DensityMode>("compact");

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const saved = localStorage.getItem("consecuencia.ui.density") as DensityMode;
        if (saved === "compact" || saved === "comfortable") {
          setDensity(saved);
          document.documentElement.setAttribute("data-density", saved);
        } else {
          document.documentElement.setAttribute("data-density", "compact");
        }
      } catch {
        // Ignore localStorage issues
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const toggleDensity = () => {
    const next: DensityMode = density === "compact" ? "comfortable" : "compact";
    setDensity(next);
    document.documentElement.setAttribute("data-density", next);
    try {
      localStorage.setItem("consecuencia.ui.density", next);
    } catch {
      // Ignore
    }
  };

  return (
    <button
      type="button"
      onClick={toggleDensity}
      title={`Current Density: ${density.toUpperCase()} (Click to toggle)`}
      className="flex h-7.5 cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-500 shadow-xs transition-all select-none hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800"
    >
      <SlidersHorizontal className="size-3 text-slate-400" />
      <span className="hidden font-mono text-[10px] tracking-wider uppercase sm:inline">
        {density}
      </span>
    </button>
  );
}
