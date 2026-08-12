"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export type DensityMode = "compact" | "comfortable";

export function DensityToggle() {
  const [density, setDensity] = useState<DensityMode>("compact");

  useEffect(() => {
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
      className="flex h-8.5 items-center gap-1.5 rounded-lg border border-border/70 bg-surface/60 px-2.5 text-xs font-semibold text-muted-foreground hover:border-sky-500/40 hover:bg-surface-hover hover:text-foreground transition-all cursor-pointer shadow-xs select-none"
    >
      <SlidersHorizontal className="size-3.5 text-sky-400" />
      <span className="hidden font-mono text-[11px] sm:inline uppercase tracking-wider">
        {density}
      </span>
    </button>
  );
}
