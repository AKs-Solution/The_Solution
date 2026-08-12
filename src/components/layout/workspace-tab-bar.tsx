"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  GitBranch,
  Layers,
  Pin,
  PinOff,
  Plus,
  X,
  LayoutDashboard,
  FileText,
  Workflow,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Layers2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useWorkspaceTabs, type WorkspaceTabKind } from "./workspace-tabs";

const KIND_ICON_MAP: Record<WorkspaceTabKind, LucideIcon> = {
  ledger: LayoutDashboard,
  decision: GitBranch,
  sentinel: Activity,
  drawing: Layers,
  "failure-graph": Workflow,
};

export function WorkspaceTabBar() {
  const pathname = usePathname();
  const {
    tabs,
    activeTabId,
    activateTab,
    closeTab,
    closeTabs,
    togglePin,
    openTab,
  } = useWorkspaceTabs();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleTabClick = (tabId: string) => {
    activateTab(tabId);
  };

  const handleNewTab = () => {
    openTab({
      kind: "ledger",
      ref: "/dashboard",
      title: "Mission Console",
      href: "/dashboard",
    });
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const closeOthers = () => {
    const active = tabs.find((t) => t.id === activeTabId);
    if (!active) return;
    const others = tabs.filter((t) => t.id !== active.id && !t.pinned).map((t) => t.id);
    closeTabs(others);
    setShowMenu(false);
  };

  const closeUnpinned = () => {
    const unpinned = tabs.filter((t) => !t.pinned).map((t) => t.id);
    closeTabs(unpinned);
    setShowMenu(false);
  };

  return (
    <div className="border-slate-800/80 bg-[#080c14] shrink-0 flex h-8.5 w-full items-center border-b px-2 select-none gap-1">
      {/* Scroll Left */}
      <button
        type="button"
        onClick={scrollLeft}
        title="Scroll tabs left"
        className="hidden sm:flex size-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
      >
        <ChevronLeft className="size-3.5" />
      </button>

      {/* Tabs Container */}
      <div
        ref={scrollRef}
        className="flex flex-1 items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5"
        role="tablist"
      >
        {tabs.map((tab) => {
          const Icon = KIND_ICON_MAP[tab.kind] ?? FileText;
          const isActive = tab.id === activeTabId || pathname === tab.href || (tab.href !== "/" && pathname?.startsWith(`${tab.href}/`));

          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "group relative flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-all duration-150 cursor-pointer shrink-0",
                isActive
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-400 font-semibold shadow-[0_0_10px_-2px_rgba(14,165,233,0.25)]"
                  : "border-slate-800/80 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-200",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="active-tab-glow"
                  className="absolute inset-0 rounded-md border border-sky-400/40 pointer-events-none"
                  transition={{ duration: 0.15 }}
                />
              )}

              <Icon className={cn("size-3.5 shrink-0", isActive ? "text-sky-400" : "text-slate-400")} />
              <span className="max-w-[130px] truncate tracking-tight">{tab.title}</span>

              {tab.pinned && (
                <Pin className="size-2.5 shrink-0 text-sky-400/70" aria-label="Pinned Tab" />
              )}

              <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  title={tab.pinned ? "Unpin tab" : "Pin tab"}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(tab.id);
                  }}
                  className="rounded p-0.5 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {tab.pinned ? <PinOff className="size-2.5" /> : <Pin className="size-2.5" />}
                </button>

                {!tab.pinned && (
                  <button
                    type="button"
                    title="Close tab"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="rounded p-0.5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
                  >
                    <X className="size-2.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Tab Button */}
        <button
          type="button"
          onClick={handleNewTab}
          title="Open Mission Console tab"
          className="flex size-6.5 items-center justify-center rounded-md border border-slate-800 bg-slate-900/40 text-slate-400 hover:border-sky-500/40 hover:bg-slate-800 hover:text-sky-400 transition-all shrink-0 cursor-pointer shadow-xs"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* Scroll Right */}
      <button
        type="button"
        onClick={scrollRight}
        title="Scroll tabs right"
        className="hidden sm:flex size-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
      >
        <ChevronRight className="size-3.5" />
      </button>

      {/* Tab Context Actions Dropdown */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          title="Tab Management Options"
          className="flex size-6.5 items-center justify-center rounded-md border border-slate-800 bg-slate-900/40 text-slate-400 hover:border-sky-500/40 hover:bg-slate-800 hover:text-sky-400 transition-all cursor-pointer"
        >
          <MoreVertical className="size-3.5" />
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-7 z-50 w-44 rounded-lg border border-slate-800 bg-[#080c14] p-1 shadow-2xl text-xs"
            >
              <button
                type="button"
                onClick={closeOthers}
                className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <Layers2 className="size-3.5 text-sky-400" />
                <span>Close Other Tabs</span>
              </button>
              <button
                type="button"
                onClick={closeUnpinned}
                className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="size-3.5 text-rose-400" />
                <span>Close Unpinned Tabs</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


