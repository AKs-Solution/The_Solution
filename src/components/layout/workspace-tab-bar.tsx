"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Activity,
  Layers,
  Gauge,
  Monitor,
  Plus,
  Pin,
  PinOff,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Command,
  X,
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

function openSearchPalette() {
  window.dispatchEvent(new CustomEvent("consecuencia:open-search"));
}

export function WorkspaceTabBar() {
  const { tabs, activeTabId, activateTab, closeTab, closeTabs, togglePin } = useWorkspaceTabs();

  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLDivElement | null>>([]);
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
        openSearchPalette();
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
  }, [showMenu]);

  const handleTabClick = (tabId: string) => {
    activateTab(tabId);
  };

  const handleTabKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    tabId: string,
    index: number,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activateTab(tabId);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      if (tabs.length === 0) return;
      const direction = e.key === "ArrowRight" ? 1 : -1;
      const next = (index + direction + tabs.length) % tabs.length;
      tabRefs.current[next]?.focus();
      const nextTab = tabs[next];
      if (nextTab) activateTab(nextTab.id);
    }
  };

  const handleFocus = (index: number) => {
    if (scrollRef.current) {
      const el = tabRefs.current[index];
      if (el) {
        const target =
          el.offsetLeft -
          scrollRef.current.offsetLeft -
          scrollRef.current.clientWidth / 2 +
          el.clientWidth / 2;
        scrollRef.current.scrollTo({ left: target, behavior: "smooth" });
      }
    }
  };

  const handleNewTab = () => {
    openSearchPalette();
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
    <div className="z-20 flex h-10 w-full min-w-0 flex-shrink-0 items-center gap-1.5 overflow-hidden border-b border-slate-200 bg-slate-100/80 px-3 text-slate-500 select-none">
      {/* Scroll Left */}
      <button
        type="button"
        onClick={scrollLeft}
        title="Scroll tabs left"
        className="hidden size-6 shrink-0 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-900 sm:flex"
      >
        <ChevronLeft className="size-3.5" />
      </button>

      {/* Tabs Container */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-x-auto overflow-y-hidden py-0.5"
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const Icon = KIND_ICON_MAP[tab.kind] ?? FileText;
          const isActive = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              tabIndex={0}
              aria-selected={isActive}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, tab.id, index)}
              onFocus={() => handleFocus(index)}
              onMouseDown={(e) => {
                if (e.button === 1) {
                  e.preventDefault();
                  if (!tab.pinned) closeTab(tab.id);
                }
              }}
              title={`${tab.title} (Middle-click to close)`}
              className={cn(
                "group relative flex flex-shrink-0 cursor-pointer items-center gap-2 rounded-t px-3.5 py-1.5 text-xs transition-colors select-none focus-visible:ring-2 focus-visible:ring-slate-900/40 focus-visible:outline-none",
                isActive
                  ? "border-b-2 border-slate-900 bg-white font-medium text-slate-900 shadow-xs"
                  : "border-b-2 border-transparent text-slate-500 hover:bg-slate-200/60 hover:text-slate-900",
              )}
            >
              <Icon
                className={cn("size-3.5 shrink-0", isActive ? "text-slate-900" : "text-slate-500")}
              />
              <span className="max-w-[140px] truncate tracking-tight">{tab.title}</span>

              {tab.pinned && (
                <Pin className="ml-0.5 size-2.5 shrink-0 text-slate-400" aria-label="Pinned Tab" />
              )}

              <div className="ml-1 flex items-center gap-0.5">
                <button
                  type="button"
                  title={tab.pinned ? "Unpin tab" : "Pin tab"}
                  aria-label={tab.pinned ? `Unpin ${tab.title}` : `Pin ${tab.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(tab.id);
                  }}
                  className="rounded p-0.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-200 hover:text-slate-700"
                >
                  {tab.pinned ? <PinOff className="size-2.5" /> : <Pin className="size-2.5" />}
                </button>

                {!tab.pinned && (
                  <button
                    type="button"
                    title="Close tab"
                    aria-label={`Close ${tab.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="rounded p-0.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-200 hover:text-slate-700"
                  >
                    <X className="size-3" />
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
          title="Open Command Palette (Ctrl+K)"
          className="flex h-6 shrink-0 cursor-pointer items-center justify-center gap-1 rounded border border-slate-200 bg-white px-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Plus className="size-3" />
          <Command className="size-2.5" />
        </button>
      </div>

      {/* Scroll Right */}
      <button
        type="button"
        onClick={scrollRight}
        title="Scroll tabs right"
        className="hidden size-6 shrink-0 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-900 sm:flex"
      >
        <ChevronRight className="size-3.5" />
      </button>

      {/* Tab Overflow Menu */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowMenu((prev) => !prev)}
          title="Tab options"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-900"
        >
          <MoreVertical className="size-3.5" />
        </button>

        {showMenu && (
          <div className="absolute top-8 right-0 z-50 w-44 rounded-md border border-slate-200 bg-white p-1 text-xs shadow-sm">
            <button
              type="button"
              onClick={closeOthers}
              className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Close Other Tabs
            </button>
            <button
              type="button"
              onClick={closeUnpinned}
              className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Close Unpinned Tabs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
