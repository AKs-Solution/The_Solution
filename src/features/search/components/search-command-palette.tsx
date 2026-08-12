"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Tags,
  Building2,
  Hash,
  X,
  LayoutDashboard,
  Activity,
  GitBranch,
  Layers,
  FileCheck,
  Brain,
  ScrollText,
  Command,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/shared/utils";

interface SearchResult {
  id: string;
  type: "entity" | "document" | "organization" | "user" | "page" | "decision";
  label: string;
  subtitle: string;
  href: string;
  icon: "Tags" | "FileText" | "Building2" | "Hash" | "LayoutDashboard" | "Activity" | "GitBranch" | "Layers" | "FileCheck" | "Brain" | "ScrollText";
}

const ICONS = {
  Tags,
  FileText,
  Building2,
  Hash,
  LayoutDashboard,
  Activity,
  GitBranch,
  Layers,
  FileCheck,
  Brain,
  ScrollText,
} as const;

function iconFor(type: SearchResult["icon"]) {
  return ICONS[type] ?? Hash;
}

type FilterCategory = "ALL" | "PAGES" | "DECISIONS" | "ENTITIES" | "DOCUMENTS";

const QUICK_ACTIONS: SearchResult[] = [
  {
    id: "qa-exec",
    type: "page",
    label: "Executive Mission Console",
    subtitle: "High-level governance, program health & risk postures",
    href: "/executive-dashboard",
    icon: "LayoutDashboard",
  },
  {
    id: "qa-sentinel",
    type: "page",
    label: "Decision Sentinel Surveillance",
    subtitle: "Realtime surveillance of engineering hypotheses & anomalies",
    href: "/sentinel",
    icon: "Activity",
  },
  {
    id: "qa-precedents",
    type: "page",
    label: "The Precedent Engine",
    subtitle: "Historical engineering failure precedents & institutional memory",
    href: "/precedents",
    icon: "ScrollText",
  },
  {
    id: "qa-drawings",
    type: "page",
    label: "Engineering Drawing Intelligence",
    subtitle: "3-Layer GD&T risk engine & CAD blueprint revision compare",
    href: "/drawings",
    icon: "Layers",
  },
  {
    id: "qa-compliance",
    type: "page",
    label: "Autonomous Compliance Dossier",
    subtitle: "FAR Part 25 & AS9100 Rev D digital thread certification",
    href: "/compliance",
    icon: "FileCheck",
  },
  {
    id: "qa-copilot",
    type: "page",
    label: "Engineering Copilot Workspace",
    subtitle: "Deterministic multi-hop evidence reasoning & synthesis",
    href: "/copilot",
    icon: "Brain",
  },
  {
    id: "qa-failure-graph",
    type: "page",
    label: "Failure Graph & Risk Contagion",
    subtitle: "Topological propagation network of engineering defects",
    href: "/failure-graph",
    icon: "GitBranch",
  },
];

export function SearchCommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FilterCategory>("ALL");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("morningstar:open-search", handler);
    return () => window.removeEventListener("morningstar:open-search", handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (!query.trim()) {
      setResults(QUICK_ACTIONS);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=12`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error ?? "Search failed");
        }
        if (!cancelled) {
          const fetched = json.data ?? [];
          // Also filter quick actions locally if they match query
          const localMatches = QUICK_ACTIONS.filter(
            (qa) =>
              qa.label.toLowerCase().includes(query.toLowerCase()) ||
              qa.subtitle.toLowerCase().includes(query.toLowerCase()),
          );
          const combined = [...localMatches, ...fetched.filter((f: SearchResult) => !localMatches.some((m) => m.href === f.href))];
          setResults(combined);
          setFocusedIndex(0);
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setError(err instanceof Error ? err.message : "Search failed");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults(QUICK_ACTIONS);
      setCategory("ALL");
      setFocusedIndex(0);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setFocusedIndex(0);
  }, [results, category]);

  const filteredResults = results.filter((r) => {
    if (category === "ALL") return true;
    if (category === "PAGES") return r.type === "page";
    if (category === "DECISIONS") return r.type === "decision" || r.href.includes("decision");
    if (category === "ENTITIES") return r.type === "entity";
    if (category === "DOCUMENTS") return r.type === "document";
    return true;
  });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, Math.max(filteredResults.length - 1, 0)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" && filteredResults[focusedIndex]) {
        e.preventDefault();
        const result = filteredResults[focusedIndex];
        setIsOpen(false);
        router.push(result.href);
      }
    },
    [filteredResults, focusedIndex, router],
  );

  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.querySelector(
      `[data-index="${focusedIndex}"]`,
    ) as HTMLElement | null;
    item?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 backdrop-blur-md bg-black/60 transition-all">
      <div
        className="fixed inset-0"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Aerospace Command Palette"
        className="relative z-50 w-full max-w-2xl rounded-2xl border border-sky-500/30 bg-[#06090e]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(14,165,233,0.15)] text-slate-100 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 px-4 py-3.5 bg-slate-900/40">
          <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Command className="size-4" />
          </div>
          <input
            ref={inputRef}
            id="command-palette-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, component ID, blueprint name, or jump to route..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none font-medium"
            aria-label="Search workspace"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-slate-500 hover:text-slate-300 rounded p-1 text-xs"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-slate-800 transition-colors"
            aria-label="Close search"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Filter Category Pills */}
        <div className="flex items-center gap-1.5 border-b border-slate-800/60 px-4 py-2 bg-slate-950/50 overflow-x-auto no-scrollbar">
          {(["ALL", "PAGES", "DECISIONS", "ENTITIES", "DOCUMENTS"] as FilterCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-mono font-semibold transition-all cursor-pointer select-none",
                category === cat
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="command-palette-results"
          className="max-h-[55vh] overflow-y-auto p-2 space-y-1"
          role="listbox"
        >
          {isLoading && (
            <div className="text-slate-400 px-4 py-8 text-center text-xs font-mono">
              ⚡ Querying Knowledge Graph & Truth Pipeline...
            </div>
          )}
          {!isLoading && error && (
            <div className="text-rose-400 px-4 py-6 text-center text-xs font-mono">
              {error}
            </div>
          )}
          {!isLoading && !error && filteredResults.length === 0 && (
            <div className="text-slate-400 px-4 py-8 text-center text-xs">
              No matching aerospace assets found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!isLoading && !error && filteredResults.length > 0 && (
            <ul className="flex flex-col gap-1">
              {!query.trim() && (
                <div className="px-3 py-1.5 text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase">
                  Quick Navigation Console
                </div>
              )}
              {filteredResults.map((result, index) => {
                const Icon = iconFor(result.icon);
                const isSelected = index === focusedIndex;
                return (
                  <li key={`${result.type}-${result.id}-${index}`} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-index={index}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(result.href);
                      }}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all cursor-pointer border",
                        isSelected
                          ? "border-sky-500/40 bg-sky-500/10 text-white shadow-[0_0_15px_-3px_rgba(14,165,233,0.35)]"
                          : "border-transparent text-slate-300 hover:border-slate-700/60 hover:bg-slate-800/50 hover:text-white",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                          isSelected
                            ? "border-sky-500/40 bg-sky-500/20 text-sky-300"
                            : "border-slate-800 bg-slate-900 text-slate-400 group-hover:text-slate-200",
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="flex flex-1 flex-col min-w-0">
                        <span className="text-xs font-semibold text-white truncate">
                          {result.label}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate mt-0.5">
                          {result.subtitle}
                        </span>
                      </div>
                      <span className="rounded bg-slate-800/80 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-400 uppercase border border-slate-700/50">
                        {result.type}
                      </span>
                      <ArrowRight
                        className={cn(
                          "size-3.5 transition-transform",
                          isSelected ? "text-sky-400 translate-x-0.5" : "text-transparent",
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/80 px-4 py-2.5 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-300">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-300">
                ↵
              </kbd>
              Execute
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-300">
                ESC
              </kbd>
              Dismiss
            </span>
          </div>
          <span className="text-[10px] text-sky-400 font-semibold">
            CONSECUENCIA COMMAND v1.0
          </span>
        </div>
      </div>
    </div>
  );
}

