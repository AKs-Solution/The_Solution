"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  FolderOpen,
  GitBranch,
  Layers,
  Network,
  Pin,
  PinOff,
  Plus,
  X,
  LayoutDashboard,
  ShieldAlert,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Layers2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useWorkspaceTabs, type WorkspaceTabItem } from "@/store/use-workspace-tabs";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  GitBranch,
  Activity,
  Layers,
  Network,
  FolderOpen,
  ShieldAlert,
  FileCheck,
};

export function WorkspaceTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { tabs, openTab, closeTab, setActiveTab, pinTab } = useWorkspaceTabs();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync active route with open tabs
  useEffect(() => {
    if (!pathname) return;
    const currentTab = tabs.find((t) => t.path === pathname || (t.path !== "/" && pathname.startsWith(`${t.path}/`)));
    if (currentTab) {
      if (!currentTab.isActive) {
        setActiveTab(currentTab.id);
      }
    }
  }, [pathname, tabs, setActiveTab]);

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

  const handleTabClick = (tab: WorkspaceTabItem) => {
    setActiveTab(tab.id);
    router.push(tab.path);
  };

  const handleNewTab = () => {
    const newId = `new-tab-${Date.now()}`;
    openTab({
      id: newId,
      title: "Executive Console",
      path: "/dashboard",
      icon: "LayoutDashboard",
      isActive: true,
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
    const active = tabs.find((t) => t.isActive);
    if (!active) return;
    for (const t of tabs) {
      if (t.id !== active.id && !t.isPinned) {
        closeTab(t.id);
      }
    }
    setShowMenu(false);
  };

  const closeUnpinned = () => {
    for (const t of tabs) {
      if (!t.isPinned) {
        closeTab(t.id);
      }
    }
    setShowMenu(false);
  };

  return (
    <div className="border-border/80 bg-surface/90 sticky top-14 z-20 flex h-10 w-full items-center border-b px-2 backdrop-blur-md select-none gap-1">
      {/* Scroll Left */}
      <button
        type="button"
        onClick={scrollLeft}
        title="Scroll tabs left"
        className="hidden sm:flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer shrink-0"
      >
        <ChevronLeft className="size-3.5" />
      </button>

      {/* Tabs Container */}
      <div
        ref={scrollRef}
        className="flex flex-1 items-center gap-1.5 overflow-x-auto no-scrollbar py-1"
        role="tablist"
      >
        {tabs.map((tab) => {
          const Icon = (tab.icon && ICON_MAP[tab.icon]) || LayoutDashboard;
          const isActive = tab.isActive || pathname === tab.path || (tab.path !== "/" && pathname?.startsWith(`${tab.path}/`));

          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(tab)}
              className={cn(
                "group relative flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-all duration-150 cursor-pointer shrink-0",
                isActive
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-300 shadow-[inset_0_1px_0_0_rgba(56,189,248,0.3),0_0_15px_-4px_rgba(14,165,233,0.35)]"
                  : "border-border/50 bg-surface/50 text-muted-foreground hover:border-border/80 hover:bg-surface-hover hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="active-tab-glow"
                  className="absolute inset-0 rounded-lg border border-sky-400/50 pointer-events-none"
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
              )}

              <Icon className={cn("size-3.5 shrink-0", isActive ? "text-sky-400" : "text-muted-foreground")} />
              <span className="max-w-[140px] truncate tracking-tight">{tab.title}</span>

              {tab.isPinned && (
                <Pin className="size-3 shrink-0 text-sky-400/70" aria-label="Pinned Tab" />
              )}

              <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  title={tab.isPinned ? "Unpin tab" : "Pin tab"}
                  onClick={(e) => {
                    e.stopPropagation();
                    pinTab(tab.id);
                  }}
                  className="rounded p-0.5 hover:bg-surface text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tab.isPinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
                </button>

                {!tab.isPinned && (
                  <button
                    type="button"
                    title="Close tab"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="rounded p-0.5 hover:bg-rose-500/20 hover:text-rose-400 text-muted-foreground transition-colors"
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
          title="Open new workspace tab"
          className="flex size-7 items-center justify-center rounded-lg border border-border/50 bg-surface/40 text-muted-foreground hover:border-sky-500/40 hover:bg-surface-hover hover:text-sky-400 transition-all shrink-0 cursor-pointer shadow-xs"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* Scroll Right */}
      <button
        type="button"
        onClick={scrollRight}
        title="Scroll tabs right"
        className="hidden sm:flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer shrink-0"
      >
        <ChevronRight className="size-3.5" />
      </button>

      {/* Tab Context Actions Dropdown */}
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          title="Tab Management Options"
          className="flex size-7 items-center justify-center rounded-lg border border-border/50 bg-surface/40 text-muted-foreground hover:border-sky-500/40 hover:bg-surface-hover hover:text-sky-400 transition-all cursor-pointer"
        >
          <MoreVertical className="size-3.5" />
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-8 z-50 w-48 rounded-xl border border-slate-800 bg-[#06090e]/95 p-1.5 shadow-2xl backdrop-blur-xl text-xs"
            >
              <button
                type="button"
                onClick={closeOthers}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <Layers2 className="size-3.5 text-sky-400" />
                <span>Close Other Tabs</span>
              </button>
              <button
                type="button"
                onClick={closeUnpinned}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
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

