"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Activity,
  Layers,
  Gauge,
  Monitor,
  Plus,
  X,
  Pin,
  PinOff,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useWorkspaceTabs, type WorkspaceTabKind } from "./workspace-tabs";

const KIND_ICON_MAP: Record<WorkspaceTabKind, LucideIcon> = {
  decision: FileText,
  sentinel: Activity,
  drawing: Layers,
  "failure-graph": Gauge,
  ledger: Monitor,
};

export function WorkspaceTabBar() {
  const router = useRouter();
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

  // Click outside to close menu & Alt+N shortcut
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        openTab({
          kind: "ledger",
          ref: "/dashboard",
          title: "Mission Console",
          href: "/dashboard",
        });
        router.push("/dashboard");
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMenu, openTab, router]);

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
    router.push("/dashboard");
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
    <div className="w-full h-10 border-b border-[#1F2D44] bg-[#0E1420]/95 backdrop-blur-md flex-shrink-0 z-20 px-2 sm:px-4 flex items-center select-none gap-2 overflow-x-auto text-slate-200">
      {/* Scroll Left */}
      <button
        type="button"
        onClick={scrollLeft}
        title="Scroll tabs left"
        className="hidden sm:flex size-6 items-center justify-center rounded text-slate-400 hover:bg-[#162032] hover:text-slate-200 transition-colors cursor-pointer shrink-0"
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
              onMouseDown={(e) => {
                if (e.button === 1) {
                  e.preventDefault();
                  if (!tab.pinned) closeTab(tab.id);
                }
              }}
              title={`${tab.title} (Middle-click to close)`}
              className={cn(
                "group relative px-3.5 py-1.5 text-xs rounded-t-md flex items-center gap-2 flex-shrink-0 cursor-pointer select-none transition-all duration-150 border-t border-x",
                isActive
                  ? "bg-[#162032] text-sky-300 border-[#1F2D44] border-b-2 border-b-sky-400 font-semibold shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                  : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-[#162032]/60 border-transparent border-b-2",
              )}
            >
              <Icon className={cn("size-3.5 shrink-0", isActive ? "text-sky-400" : "text-slate-400")} />
              <span className="max-w-[140px] truncate tracking-tight">{tab.title}</span>

              {tab.pinned && (
                <Pin className="size-2.5 shrink-0 text-sky-400/80 ml-0.5" aria-label="Pinned Tab" />
              )}

              <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  title={tab.pinned ? "Unpin tab" : "Pin tab"}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(tab.id);
                  }}
                  className="rounded p-0.5 hover:bg-[#1E2C44] text-slate-400 hover:text-slate-200 transition-colors"
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
          title="New Workspace Tab (Alt+N)"
          className="flex h-7 items-center justify-center rounded border border-[#1F2D44] bg-[#162032] px-2.5 text-xs text-slate-300 hover:border-sky-500/40 hover:bg-[#1E2C44] hover:text-white transition-all cursor-pointer shrink-0 gap-1 font-medium shadow-xs"
        >
          <Plus className="size-3 text-sky-400" />
          <span className="text-[11px] font-mono">NEW TAB</span>
        </button>
      </div>

      {/* Scroll Right */}
      <button
        type="button"
        onClick={scrollRight}
        title="Scroll tabs right"
        className="hidden sm:flex size-6 items-center justify-center rounded text-slate-400 hover:bg-[#162032] hover:text-slate-200 transition-colors cursor-pointer shrink-0"
      >
        <ChevronRight className="size-3.5" />
      </button>

      {/* Tab Overflow Menu */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowMenu((prev) => !prev)}
          title="Tab options"
          className="flex size-7 items-center justify-center rounded text-slate-400 hover:bg-[#162032] hover:text-slate-200 transition-colors cursor-pointer shrink-0"
        >
          <MoreVertical className="size-3.5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-8 z-50 w-44 rounded-md border border-[#1F2D44] bg-[#0E1420] p-1 shadow-xl text-xs">
            <button
              type="button"
              onClick={closeOthers}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-slate-300 hover:bg-[#162032] hover:text-white transition-colors cursor-pointer"
            >
              Close Other Tabs
            </button>
            <button
              type="button"
              onClick={closeUnpinned}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-slate-300 hover:bg-[#162032] hover:text-white transition-colors cursor-pointer"
            >
              Close Unpinned Tabs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
