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
import { useWorkspacePreferences, type WorkspaceViewIcon } from "@/components/layout/workspace-preferences";
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
  { label: "Reasoning & Contradictions", href: "/contradictions", category: "Core", icon: AlertTriangle },
  { label: "Drawings & GD&T Rules", href: "/drawings", category: "Engineering", icon: Layers },
  { label: "Autonomous Compliance Dossier", href: "/compliance", category: "Engineering", icon: ShieldCheck },
  { label: "Certification Readiness", href: "/certification", category: "Engineering", icon: ShieldCheck },
  { label: "Engineering Copilot & AI", href: "/copilot", category: "Engineering", icon: Brain },
  { label: "Supplier Risk & Sourcing", href: "/suppliers", category: "Engineering", icon: Truck },
  { label: "Ingestion Pipeline", href: "/ingestion", category: "Knowledge", icon: FileText },
  { label: "Knowledge Graph Explorer", href: "/knowledge-graph", category: "Knowledge", icon: GitBranch },
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
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
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
    }, 150);

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
      kind: "decision",
      ref: "/decisions",
      title: "New Decision",
      href: "/decisions",
    });
    router.push("/decisions");
  };

  const handleSyncSurveillance = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("consecuencia:sync-surveillance"));
    router.push("/sentinel");
  };

  const filteredRoutes = ALL_PLATFORM_ROUTES.filter((r) =>
    r.label.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-950/80 fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 backdrop-blur-md">
      <div className="border-slate-800 bg-[#080c14] animate-fade-in w-full max-w-2xl overflow-hidden rounded-xl border shadow-2xl">
        {/* Search Input Bar */}
        <div className="border-slate-800 relative flex items-center gap-3 border-b px-4 py-3 bg-slate-900/40">
          <Search className="text-sky-400 size-4.5 shrink-0" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands, drawings, decisions, rules, modules..."
            className="placeholder:text-slate-500 text-slate-100 w-full bg-transparent text-sm focus:outline-none"
            aria-label="Search command palette"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
              ESC
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg p-1 transition-colors"
              aria-label="Close search"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-h-[28rem] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-slate-800">
          {isLoading ? (
            <div className="text-slate-400 p-6 text-center text-xs flex items-center justify-center gap-2">
              <RefreshCw className="size-3.5 animate-spin text-sky-400" />
              Searching aerospace database...
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Database Results
              </div>
              {results.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleSelect(r.href)}
                  className="hover:bg-slate-800/60 text-slate-200 flex cursor-pointer items-center justify-between rounded-lg p-2.5 text-left transition-colors border border-transparent hover:border-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    {r.type === "Drawing" && <Layers className="size-4 text-indigo-400" />}
                    {r.type === "Decision" && <FileText className="size-4 text-emerald-400" />}
                    {r.type === "Supplier" && <Truck className="size-4 text-amber-400" />}
                    {r.type === "Program" && <Activity className="size-4 text-rose-400" />}
                    <span className="text-slate-100 text-xs font-medium">{r.title}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[9px] font-semibold uppercase rounded bg-slate-800 px-1.5 py-0.5 border border-slate-700">
                    {r.type}
                  </span>
                </div>
              ))}
            </div>
          ) : search.trim() ? (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Matching Platform Modules ({filteredRoutes.length})
              </div>
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route) => {
                  const Icon = route.icon;
                  return (
                    <button
                      key={route.href}
                      onClick={() => handleSelect(route.href)}
                      className="hover:bg-slate-800/60 text-slate-200 flex w-full cursor-pointer items-center justify-between rounded-lg p-2.5 text-left transition-colors border border-transparent hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="size-4 text-sky-400" />
                        <span className="text-slate-100 text-xs font-medium">{route.label}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[9px] uppercase">
                        {route.category}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="text-slate-400 p-6 text-center text-xs">
                  No matching platform commands or entities for &quot;{search}&quot;.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-1 text-left text-xs">
              {/* Quick Actions */}
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 block px-1">
                  Instant Actions
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSyncSurveillance}
                    className="border-slate-800/80 hover:bg-slate-800/60 hover:border-sky-500/30 bg-slate-900/40 flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all"
                  >
                    <Activity className="size-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="text-slate-100 text-xs font-semibold">Sync Surveillance</div>
                      <div className="text-slate-400 text-[10px]">Trigger live Sentinel telemetry</div>
                    </div>
                  </button>
                  <button
                    onClick={handleNewDecision}
                    className="border-slate-800/80 hover:bg-slate-800/60 hover:border-sky-500/30 bg-slate-900/40 flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all"
                  >
                    <Workflow className="size-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-slate-100 text-xs font-semibold">New Decision Proposal</div>
                      <div className="text-slate-400 text-[10px]">Open scoped ledger tab</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Saved Workspace Views */}
              {views.length > 0 && (
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 block px-1">
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
                          className="border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/50 bg-slate-900/30 flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all"
                        >
                          <Icon className="text-sky-400 size-3.5 shrink-0" />
                          <span className="text-slate-200 truncate text-xs font-medium">
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
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Active Workspace Tabs ({tabs.length})
                    </span>
                    <button
                      onClick={() => {
                        closeTabs();
                        setOpen(false);
                      }}
                      className="text-slate-400 hover:text-rose-400 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors"
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
                            "hover:bg-slate-800/60 flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-2 text-left transition-all",
                            activeTabId === tab.id
                              ? "border-sky-500/40 bg-sky-500/10 text-sky-300"
                              : "border-slate-800/60 bg-slate-900/30 text-slate-300",
                          ].join(" ")}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <Icon className="size-3.5 shrink-0 text-sky-400" />
                            <span className="truncate font-medium text-xs">{tab.title}</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              closeTabs([tab.id]);
                            }}
                            className="text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 rounded p-1"
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
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 block px-1">
                  Platform Routes (16 Modules)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {ALL_PLATFORM_ROUTES.slice(0, 12).map((route) => {
                    const Icon = route.icon;
                    return (
                      <button
                        key={route.href}
                        onClick={() => handleSelect(route.href)}
                        className="border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/50 bg-slate-900/30 flex items-center gap-2 rounded-lg border p-2 text-left transition-all"
                      >
                        <Icon className="text-slate-400 size-3.5 shrink-0" />
                        <span className="text-slate-200 truncate text-xs font-medium">
                          {route.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-3">
                  <span><kbd className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">Ctrl+B</kbd> Toggle Sidebar</span>
                  <span><kbd className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">Alt+N</kbd> New Tab</span>
                  <span><kbd className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">⌘K</kbd> Search</span>
                </div>
                <span className="text-emerald-400 font-semibold">CONSECUENCIA BY AK</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
