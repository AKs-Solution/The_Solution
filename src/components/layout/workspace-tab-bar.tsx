"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion } from "motion/react";
import {
  Activity,
  FolderOpen,
  GitCommit,
  Layers,
  Network,
  Pin,
  PinOff,
  Plus,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/utils";
import { useWorkspaceTabs, type WorkspaceTab, type WorkspaceTabKind, isWorkspaceRoute } from "./workspace-tabs";
import { useWorkspacePreferences } from "./workspace-preferences";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const KIND_META: Record<WorkspaceTabKind, { icon: LucideIcon; dot: string }> = {
  decision: { icon: GitCommit, dot: "bg-emerald-500" },
  sentinel: { icon: Activity, dot: "bg-rose-500" },
  drawing: { icon: Layers, dot: "bg-indigo-500" },
  "failure-graph": { icon: Network, dot: "bg-amber-500" },
  ledger: { icon: FolderOpen, dot: "bg-zinc-400" },
};

function WorkspaceTabItem({ tab, isActive }: { tab: WorkspaceTab; isActive: boolean }) {
  const { activateTab, closeTab, togglePin } = useWorkspaceTabs();
  const meta = KIND_META[tab.kind];

  return (
    <div
      role="tab"
      tabIndex={0}
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => activateTab(tab.id)}
      onAuxClick={(e) => {
        if (e.button === 1) closeTab(tab.id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activateTab(tab.id);
        }
      }}
      className={cn(
        "group border-border relative flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-t-lg border border-b-0 px-2.5 select-none",
        isActive
          ? "bg-background text-foreground"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} aria-hidden="true" />
      <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden="true">
        <meta.icon className="size-3.5" />
      </span>
      <span className="flex max-w-[160px] flex-col leading-none">
        <span className="truncate text-xs font-semibold">{tab.title}</span>
        {tab.subtitle && (
          <span className="text-muted-foreground/80 mt-0.5 truncate font-mono text-[9px]">
            {tab.subtitle}
          </span>
        )}
      </span>
      {tab.pinned && (
        <span className="text-muted-foreground/70 flex size-3.5 shrink-0 items-center justify-center" title="Pinned">
          <Pin className="size-3" aria-hidden="true" />
        </span>
      )}
      <span className="flex shrink-0 items-center">
        <button
          type="button"
          aria-label={tab.pinned ? `Unpin ${tab.title}` : `Pin ${tab.title}`}
          className="text-muted-foreground/50 hover:text-foreground flex size-4 items-center justify-center rounded opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            togglePin(tab.id);
          }}
        >
          {tab.pinned ? <PinOff className="size-3" aria-hidden="true" /> : <Pin className="size-3" aria-hidden="true" />}
        </button>
        <button
          type="button"
          aria-label={`Close ${tab.title}`}
          className="text-muted-foreground/60 hover:bg-surface-hover hover:text-foreground flex size-4 items-center justify-center rounded transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            closeTab(tab.id);
          }}
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      </span>
      {isActive && (
        <motion.span
          layoutId="workspace-tab-indicator"
          className="bg-foreground absolute inset-x-1.5 bottom-0 h-0.5 rounded-full"
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </div>
  );
}

export function WorkspaceTabBar() {
  const { layout } = useWorkspacePreferences();
  const pathname = usePathname();
  const { tabs, activeTabId, openTab, togglePin, closeTabs } = useWorkspaceTabs();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (layout === "classic") return null;
  if (layout === "records" && !isWorkspaceRoute(pathname)) return null;

  const pinned = tabs.filter((t) => t.pinned);
  const unpinned = tabs.filter((t) => !t.pinned);
  const ordered = [...pinned, ...unpinned];

  return (
    <div className="border-border bg-surface sticky top-14 z-20 border-b">
      <div className="flex h-9 items-end gap-1.5 px-2 sm:px-3">
        <div
          ref={scrollRef}
          role="tablist"
          aria-label="Open workspace tabs"
          className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <LayoutGroup id="workspace-tab-bar">
            {ordered.length === 0 ? (
              <div className="text-muted-foreground/70 flex h-9 items-center gap-2 px-1 text-[11px]">
                <span className="size-1.5 rounded-full bg-zinc-400/60" aria-hidden="true" />
                Open decisions, drawing inspections, sentinel alerts, or failure graph queries here.
              </div>
            ) : (
              ordered.map((tab) => (
                <WorkspaceTabItem key={tab.id} tab={tab} isActive={tab.id === activeTabId} />
              ))
            )}
          </LayoutGroup>
        </div>

        <div className="mb-px flex shrink-0 items-center gap-0.5">
          <DropdownMenu
            align="end"
            trigger={
              <button
                type="button"
                aria-label="New workspace tab"
                className="border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover focus-visible:ring-ring inline-flex size-6 items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <Plus className="size-3.5" aria-hidden="true" />
              </button>
            }
          >
            <DropdownMenuItem
              onSelect={() =>
                openTab({
                  kind: "failure-graph",
                  ref: `query:${Date.now().toString(36)}`,
                  title: "Failure Graph Query",
                  href: "/failure-graph",
                })
              }
            >
              <Network className="size-4 text-amber-500" aria-hidden="true" />
              New Failure Graph Query
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openTab({ kind: "ledger", ref: "/decisions", title: "Decision Audit Trail", href: "/decisions" })}>
              <GitCommit className="size-4 text-emerald-500" aria-hidden="true" />
              Open Decision Log
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openTab({ kind: "ledger", ref: "/drawings", title: "Drawing Intelligence", href: "/drawings" })}>
              <Layers className="size-4 text-indigo-500" aria-hidden="true" />
              Open Drawing Inspections
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openTab({ kind: "ledger", ref: "/sentinel", title: "Decision Sentinel", href: "/sentinel" })}>
              <Activity className="size-4 text-rose-500" aria-hidden="true" />
              Open Sentinel Alerts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                tabs.forEach((t) => {
                  if (!t.pinned) togglePin(t.id);
                });
              }}
            >
              <Pin className="size-4" aria-hidden="true" />
              Pin all open tabs
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                closeTabs(unpinned.map((t) => t.id));
              }}
            >
              <X className="size-4" aria-hidden="true" />
              Close unpinned tabs
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => closeTabs()}>
              <X className="size-4" aria-hidden="true" />
              Close all tabs
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
