"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
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

  const handleTabClick = (tab: WorkspaceTabItem) => {
    setActiveTab(tab.id);
    router.push(tab.path);
  };

  const handleNewTab = () => {
    const newId = `new-tab-${Date.now()}`;
    openTab({
      id: newId,
      title: "Explore Console",
      path: "/dashboard",
      icon: "LayoutDashboard",
      isActive: true,
    });
    router.push("/dashboard");
  };

  return (
    <div className="border-border/80 bg-surface/90 sticky top-14 z-20 flex h-10 w-full items-center border-b px-3 backdrop-blur-md select-none">
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

        <button
          type="button"
          onClick={handleNewTab}
          title="Open new workspace tab"
          className="flex size-7 items-center justify-center rounded-lg border border-border/50 bg-surface/40 text-muted-foreground hover:border-sky-500/40 hover:bg-surface-hover hover:text-sky-400 transition-all shrink-0 cursor-pointer shadow-xs"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
