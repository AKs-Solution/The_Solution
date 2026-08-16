/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Layers,
  FileText,
  Truck,
  Activity,
  LayoutDashboard,
  ShieldCheck,
  Gauge,
  Brain,
  Monitor,
  AlertTriangle,
  GitBranch,
  Workflow,
  ScrollText,
  Cpu,
  RefreshCw,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  useWorkspacePreferences,
  type WorkspaceViewIcon,
} from "@/components/layout/workspace-preferences";
import { useWorkspaceTabs, type WorkspaceTabKind } from "@/components/layout/workspace-tabs";

const VIEW_ICONS: Record<WorkspaceViewIcon, LucideIcon> = {
  layout: LayoutDashboard,
  shield: ShieldCheck,
  gauge: Gauge,
  truck: Truck,
  brain: Brain,
};

const TAB_ICONS: Record<WorkspaceTabKind, LucideIcon> = {
  decision: FileText,
  sentinel: Activity,
  drawing: Layers,
  "failure-graph": Gauge,
  ledger: Monitor,
};

const ALL_PLATFORM_ROUTES: { label: string; href: string; category: string; icon: LucideIcon }[] = [
  { label: "Mission Console", href: "/dashboard", category: "Core", icon: LayoutDashboard },
  { label: "Executive Overview", href: "/executive-dashboard", category: "Core", icon: Monitor },
  { label: "Decision Sentinel", href: "/sentinel", category: "Core", icon: Activity },
  { label: "Historical Precedents", href: "/precedents", category: "Core", icon: Layers },
  { label: "Failure Graph & Contagion", href: "/failure-graph", category: "Core", icon: GitBranch },
  { label: "Decision Ledger", href: "/decisions", category: "Core", icon: Workflow },
  {
    label: "Reasoning & Contradictions",
    href: "/contradictions",
    category: "Core",
    icon: AlertTriangle,
  },
  { label: "Drawings & GD&T Rules", href: "/drawings", category: "Engineering", icon: Layers },
  {
    label: "Autonomous Compliance Dossier",
    href: "/compliance",
    category: "Engineering",
    icon: ShieldCheck,
  },
  {
    label: "Certification Readiness",
    href: "/certification",
    category: "Engineering",
    icon: ShieldCheck,
  },
  { label: "Engineering Copilot & AI", href: "/copilot", category: "Engineering", icon: Brain },
  { label: "Supplier Risk & Sourcing", href: "/suppliers", category: "Engineering", icon: Truck },
  { label: "Ingestion Pipeline", href: "/ingestion", category: "Knowledge", icon: FileText },
  {
    label: "Knowledge Graph Explorer",
    href: "/knowledge-graph",
    category: "Knowledge",
    icon: GitBranch,
  },
  { label: "Deterministic Rules Engine", href: "/rules", category: "Governance", icon: Workflow },
  { label: "Pipeline Orchestrator", href: "/orchestrator", category: "Governance", icon: Zap },
  { label: "Reality Engine Assessments", href: "/reality", category: "Governance", icon: Cpu },
  { label: "Audit Log (SHA-256)", href: "/audit", category: "Governance", icon: ScrollText },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { views, applyView } = useWorkspacePreferences();
  const { tabs, activeTabId, activateTab, closeTabs, openTab } = useWorkspaceTabs();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(
      async () => {
        if (!search.trim()) {
          setResults([]);
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        try {
          const res = await fetch(`/api/search/universal?q=${encodeURIComponent(search)}`);
          if (res.ok) {
            const json = await res.json();
            setResults(json.data || []);
          }
        } catch (err) {
          console.error("Universal search error:", err);
        } finally {
          setIsLoading(false);
        }
      },
      search.trim() ? 150 : 0,
    );

    return () => clearTimeout(timer);
  }, [search]);

  if (!open) return null;

  const handleSelect = (href: string) => {
    setOpen(false);
    setSearch("");
    router.push(href);
  };

  const handleNewDecision = () => {
    setOpen(false);
    openTab({
      kind: "ledger",
      ref: "/decisions",
      title: "Decision Audit Trail",
      href: "/decisions",
    });
  };

  const handleSyncSurveillance = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("consecuencia:sync-surveillance"));
    router.push("/sentinel");
  };

  const filteredRoutes = ALL_PLATFORM_ROUTES.filter(
    (r) =>
      r.label.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-white p-4 pt-16 backdrop-blur-md">
      <div className="animate-fade-in w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
        {/* Search Input Bar */}
        <div className="relative flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3">
          <Search className="size-4.5 shrink-0 text-zinc-500" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands, drawings, decisions, rules, modules..."
            className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
            aria-label="Search command palette"
          />
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
              ESC
            </span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="Close search"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-h-[28rem] scrollbar-thin scrollbar-thumb-slate-800 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 p-6 text-center text-xs text-zinc-500">
              <RefreshCw className="size-3.5 animate-spin text-zinc-500" />
              Searching aerospace database...
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                Database Results
              </div>
              {results.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleSelect(r.href)}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-2.5 text-left text-zinc-900 transition-colors hover:border-zinc-200 hover:bg-zinc-100"
                >
                  <div className="flex items-center gap-2.5">
                    {r.type === "Drawing" && <Layers className="size-4 text-indigo-400" />}
                    {r.type === "Decision" && <FileText className="size-4 text-emerald-400" />}
                    {r.type === "Supplier" && <Truck className="size-4 text-amber-400" />}
                    {r.type === "Program" && <Activity className="size-4 text-rose-400" />}
                    <span className="text-xs font-medium text-zinc-900">{r.title}</span>
                  </div>
                  <span className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-zinc-500 uppercase">
                    {r.type}
                  </span>
                </div>
              ))}
            </div>
          ) : search.trim() ? (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                Matching Platform Modules ({filteredRoutes.length})
              </div>
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => {
                  const Icon = route.icon;
                  return (
                    <button
                      key={route.href}
                      onClick={() => handleSelect(route.href)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-transparent p-2.5 text-left text-zinc-900 transition-colors hover:border-zinc-200 hover:bg-zinc-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="size-4 text-zinc-500" />
                        <span className="text-xs font-medium text-zinc-900">{route.label}</span>
                      </div>
                      <span className="font-mono text-[9px] text-zinc-500 uppercase">
                        {route.category}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500">
                  No matching platform commands or entities for &quot;{search}&quot;.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-1 text-left text-xs">
              {/* Quick Actions */}
              <div>
                <span className="mb-2 block px-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                  Instant Actions
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSyncSurveillance}
                    className="flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white p-2.5 text-left transition-all hover:border-zinc-900 hover:bg-zinc-100"
                  >
                    <Activity className="size-4 shrink-0 text-rose-400" />
                    <div>
                      <div className="text-xs font-semibold text-zinc-900">Sync Surveillance</div>
                      <div className="text-[10px] text-zinc-500">
                        Trigger live Sentinel telemetry
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={handleNewDecision}
                    className="flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white p-2.5 text-left transition-all hover:border-zinc-900 hover:bg-zinc-100"
                  >
                    <Workflow className="size-4 shrink-0 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-zinc-900">
                        New Decision Proposal
                      </div>
                      <div className="text-[10px] text-zinc-500">Open scoped ledger tab</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Saved Workspace Views */}
              {views.length > 0 && (
                <div>
                  <span className="mb-2 block px-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                    Saved Workspace Views
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {views.map((view) => {
                      const Icon = VIEW_ICONS[view.icon] ?? LayoutDashboard;
                      return (
                        <button
                          key={view.id}
                          onClick={() => {
                            applyView(view.id);
                            setOpen(false);
                          }}
                          className="flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white p-2 text-left transition-all hover:border-zinc-200 hover:bg-zinc-100"
                        >
                          <Icon className="size-3.5 shrink-0 text-zinc-500" />
                          <span className="truncate text-xs font-medium text-zinc-900">
                            {view.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Workspace Tabs */}
              {tabs.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                      Active Workspace Tabs ({tabs.length})
                    </span>
                    <button
                      onClick={() => {
                        closeTabs();
                        setOpen(false);
                      }}
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 transition-colors hover:text-rose-400"
                    >
                      Close all tabs
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {tabs.map((tab) => {
                      const Icon = TAB_ICONS[tab.kind] ?? Monitor;
                      return (
                        <div
                          key={tab.id}
                          onClick={() => {
                            activateTab(tab.id);
                            setOpen(false);
                          }}
                          className={[
                            "flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-2 text-left transition-all hover:bg-zinc-100",
                            activeTabId === tab.id
                              ? "border-zinc-900 bg-zinc-100 text-zinc-900"
                              : "border-zinc-200 bg-white text-zinc-700",
                          ].join(" ")}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <Icon className="size-3.5 shrink-0 text-zinc-500" />
                            <span className="truncate text-xs font-medium">{tab.title}</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              closeTabs([tab.id]);
                            }}
                            className="rounded p-1 text-zinc-500 hover:bg-rose-500/20 hover:text-rose-400"
                            aria-label={`Close tab ${tab.title}`}
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Platform Navigation */}
              <div>
                <span className="mb-2 block px-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                  Platform Routes (16 Modules)
                </span>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {ALL_PLATFORM_ROUTES.slice(0, 12).map((route) => {
                    const Icon = route.icon;
                    return (
                      <button
                        key={route.href}
                        onClick={() => handleSelect(route.href)}
                        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 text-left transition-all hover:border-zinc-200 hover:bg-zinc-100"
                      >
                        <Icon className="size-3.5 shrink-0 text-zinc-500" />
                        <span className="truncate text-xs font-medium text-zinc-900">
                          {route.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="flex items-center justify-between border-t border-zinc-200 pt-2 font-mono text-[10px] text-zinc-500">
                <div className="flex items-center gap-3">
                  <span>
                    <kbd className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-500">Ctrl+B</kbd>{" "}
                    Toggle Sidebar
                  </span>
                  <span>
                    <kbd className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-500">Alt+N</kbd> New
                    Tab
                  </span>
                  <span>
                    <kbd className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-500">⌘K</kbd> Search
                  </span>
                </div>
                <span className="font-semibold text-emerald-400">CONSECUENCIA BY AK</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
