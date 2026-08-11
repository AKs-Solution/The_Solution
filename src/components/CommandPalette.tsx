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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useWorkspacePreferences, type WorkspaceViewIcon } from "@/components/layout/workspace-preferences";

const VIEW_ICONS: Record<WorkspaceViewIcon, LucideIcon> = {
  layout: LayoutDashboard,
  shield: ShieldCheck,
  gauge: Gauge,
  truck: Truck,
  brain: Brain,
};

const QUICK_LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Executive Dashboard", href: "/executive-dashboard", icon: Monitor },
  { label: "Decision Sentinel", href: "/sentinel", icon: Activity },
  { label: "Certification Readiness", href: "/certification", icon: ShieldCheck },
  { label: "Precedent Engine", href: "/precedents", icon: Layers },
  { label: "Drawing Intelligence", href: "/drawings", icon: FileText },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { views, applyView } = useWorkspacePreferences();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

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
    }, 200);

    return () => clearTimeout(timer);
  }, [search]);

  if (!open) return null;

  const handleSelect = (href: string) => {
    setOpen(false);
    setSearch("");
    router.push(href);
  };

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 backdrop-blur-sm">
      <div className="border-border bg-background animate-fade-in w-full max-w-xl overflow-hidden rounded-xl border shadow-xl">
        <div className="border-border relative flex items-center gap-3 border-b p-4">
          <Search className="text-muted-foreground size-5 shrink-0" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search everything... (drawings, decisions, suppliers, programs)"
            className="placeholder:text-muted-foreground/60 text-foreground w-full bg-transparent text-sm focus:outline-none"
            aria-label="Search"
          />
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground hover:bg-surface-hover rounded-lg p-1"
            aria-label="Close search"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {isLoading ? (
            <div className="text-muted-foreground p-4 text-center text-xs">
              Searching platform database...
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-1">
              {results.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleSelect(r.href)}
                  className="hover:bg-surface-hover text-foreground flex cursor-pointer items-center justify-between rounded-lg p-3 text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {r.type === "Drawing" && <Layers className="size-4 text-indigo-500" />}
                    {r.type === "Decision" && <FileText className="size-4 text-emerald-500" />}
                    {r.type === "Supplier" && <Truck className="size-4 text-amber-500" />}
                    {r.type === "Program" && <Activity className="size-4 text-rose-500" />}
                    <span className="text-foreground text-xs font-semibold">{r.title}</span>
                  </div>
                  <span className="text-muted-foreground text-[10px] font-bold uppercase">
                    {r.type}
                  </span>
                </div>
              ))}
            </div>
          ) : search.trim() ? (
            <div className="text-muted-foreground p-6 text-center text-xs">
              No matching entities found for &quot;{search}&quot;.
            </div>
          ) : (
            <div className="p-4 text-left text-xs">
              <span className="text-muted-foreground mb-2 block font-semibold">
                Saved workspace views
              </span>
              <div className="mb-3 grid grid-cols-2 gap-2">
                {views.map((view) => {
                  const Icon = VIEW_ICONS[view.icon] ?? LayoutDashboard;
                  return (
                    <button
                      key={view.id}
                      onClick={() => {
                        applyView(view.id);
                        setOpen(false);
                      }}
                      className="border-border hover:bg-surface-hover bg-background flex items-center gap-2 rounded-lg border p-2.5 text-left transition-colors"
                    >
                      <Icon className="text-muted-foreground size-3.5 shrink-0" />
                      <span className="text-foreground truncate text-xs font-medium">
                        {view.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              <span className="text-muted-foreground mb-2 block font-semibold">
                Quick navigation
              </span>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleSelect(link.href)}
                    className="border-border hover:bg-surface-hover bg-background flex items-center gap-2 rounded-lg border p-2.5 text-left transition-colors"
                  >
                    <link.icon className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="text-foreground text-xs font-medium">{link.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
