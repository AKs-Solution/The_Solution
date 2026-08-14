"use client";

import type { ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { WorkspaceTabBar } from "./workspace-tab-bar";
import { SearchCommandPalette } from "@/features/search";
import { useWorkspacePreferences } from "./workspace-preferences";
import { cn } from "@/shared/utils";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const { layoutMode } = useWorkspacePreferences();

  const showTabs = layoutMode !== "minimal-focus";
  const showSidebar = layoutMode !== "minimal-focus";
  const sidebarForcedExpanded = layoutMode === "sidebar-expanded";
  const fullCanvas = layoutMode === "minimal-focus";

  return (
    <div className="m-0 flex h-screen w-screen flex-col overflow-hidden bg-zinc-50 p-0 text-zinc-900 antialiased">
      {/* Fixed Top Header */}
      <Header />
      {/* Fixed Sub-Header Workspace Tab Bar */}
      {showTabs && <WorkspaceTabBar />}
      {/* Workspace Middle Container */}
      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
        {/* Sidebar (collapsed rail, expanded hierarchy, or hidden) */}
        {showSidebar && <Sidebar forceExpanded={sidebarForcedExpanded} />}
        {/* Main Canvas */}
        <main
          className={cn(
            "mx-auto min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto bg-zinc-50",
            fullCanvas ? "max-w-full p-4 md:p-6" : "max-w-7xl p-6 md:p-8",
          )}
        >
          {children}
        </main>
      </div>
      <SearchCommandPalette />
    </div>
  );
}
