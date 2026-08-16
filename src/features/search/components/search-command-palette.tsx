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
  icon:
    | "Tags"
    | "FileText"
    | "Building2"
    | "Hash"
    | "LayoutDashboard"
    | "Activity"
    | "GitBranch"
    | "Layers"
    | "FileCheck"
    | "Brain"
    | "ScrollText";
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
  {
    id: "qa-ingestion",
    type: "page",
    label: "Ingestion Pipeline",
    subtitle: "Document intake, parsers, and provenance jobs",
    href: "/ingestion",
    icon: "FileText",
  },
  {
    id: "qa-graph",
    type: "page",
    label: "Knowledge Graph Explorer",
    subtitle: "Traceable engineering relationships and subgraphs",
    href: "/knowledge-graph",
    icon: "GitBranch",
  },
  {
    id: "qa-rules",
    type: "page",
    label: "Deterministic Rules Engine",
    subtitle: "Condition DSL evaluation and topological rule runs",
    href: "/rules",
    icon: "FileCheck",
  },
  {
    id: "qa-orchestrator",
    type: "page",
    label: "Pipeline Orchestrator",
    subtitle: "Synchronous sequencing of verification engines",
    href: "/orchestrator",
    icon: "Activity",
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
    const handler = () => {
      setQuery("");
      setResults(QUICK_ACTIONS);
      setCategory("ALL");
      setFocusedIndex(0);
      setError(null);
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    window.addEventListener("consecuencia:open-search", handler);
    return () => window.removeEventListener("consecuencia:open-search", handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const timer = setTimeout(
      async () => {
        if (!query.trim()) {
          setResults(QUICK_ACTIONS);
          setError(null);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);
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
            const combined = [
              ...localMatches,
              ...fetched.filter((f: SearchResult) => !localMatches.some((m) => m.href === f.href)),
            ];
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
      },
      query.trim() ? 180 : 0,
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-zinc-900/40 px-4 pt-[10vh] backdrop-blur-md transition-all">
      <div className="fixed inset-0" onClick={() => setIsOpen(false)} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Workspace Command Palette"
        className="relative z-50 w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-xl"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3.5">
          <div className="flex size-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-50">
            <Command className="size-4" />
          </div>
          <input
            ref={inputRef}
            id="command-palette-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, component ID, blueprint name, or jump to route..."
            className="flex-1 bg-transparent text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400"
            aria-label="Search workspace"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded p-1 text-xs text-zinc-400 hover:text-zinc-700"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Close search"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Filter Category Pills */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-zinc-200 bg-zinc-50 px-4 py-2">
          {(["ALL", "PAGES", "DECISIONS", "ENTITIES", "DOCUMENTS"] as FilterCategory[]).map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "cursor-pointer rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors select-none",
                  category === cat
                    ? "border border-zinc-900 bg-zinc-900 text-zinc-50"
                    : "border border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                )}
              >
                {cat}
              </button>
            ),
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="command-palette-results"
          className="max-h-[55vh] space-y-1 overflow-y-auto p-2"
          role="listbox"
        >
          {isLoading && (
            <div className="px-4 py-8 text-center font-mono text-xs text-zinc-400">
              Querying Knowledge Graph & Truth Pipeline...
            </div>
          )}
          {!isLoading && error && (
            <div className="px-4 py-6 text-center font-mono text-xs text-rose-600">{error}</div>
          )}
          {!isLoading && !error && filteredResults.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-zinc-400">
              No matching aerospace assets found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!isLoading && !error && filteredResults.length > 0 && (
            <ul className="flex flex-col gap-1">
              {!query.trim() && (
                <div className="px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
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
                        "group flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                        isSelected
                          ? "border-zinc-900 bg-zinc-100 text-zinc-900"
                          : "border-transparent text-zinc-700 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                          isSelected
                            ? "border-zinc-900 bg-zinc-900 text-zinc-50"
                            : "border-zinc-200 bg-white text-zinc-500 group-hover:text-zinc-700",
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-xs font-semibold text-zinc-900">
                          {result.label}
                        </span>
                        <span className="mt-0.5 truncate text-[11px] text-zinc-500">
                          {result.subtitle}
                        </span>
                      </div>
                      <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-500 uppercase">
                        {result.type}
                      </span>
                      <ArrowRight
                        className={cn(
                          "size-3.5 transition-transform",
                          isSelected ? "translate-x-0.5 text-zinc-900" : "text-transparent",
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
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-2.5 font-mono text-[11px] text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-600">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-600">
                ↵
              </kbd>
              Execute
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] text-zinc-600">
                ESC
              </kbd>
              Dismiss
            </span>
          </div>
          <span className="text-[10px] font-semibold text-zinc-500">CONSECUENCIA COMMAND v1.0</span>
        </div>
      </div>
    </div>
  );
}
