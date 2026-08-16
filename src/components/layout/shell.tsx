"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const showTabs = layoutMode !== "minimal-focus";
  const showSidebar = layoutMode !== "minimal-focus";
  const sidebarForcedExpanded = layoutMode === "sidebar-expanded";

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileNavOpen]);

  return (
    <div className="m-0 flex h-screen w-screen flex-col overflow-hidden bg-zinc-50 p-0 text-zinc-900 antialiased">
      <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
      {showTabs && <WorkspaceTabBar />}
      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
        {showSidebar && (
          <>
            {mobileNavOpen && (
              <button
                type="button"
                aria-label="Close navigation"
                className="fixed inset-0 z-40 bg-black/40 md:hidden"
                onClick={() => setMobileNavOpen(false)}
              />
            )}
            <Sidebar
              forceExpanded={sidebarForcedExpanded}
              mobileOpen={mobileNavOpen}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </>
        )}
        <main
          id="main-content"
          className={cn(
            "mx-auto min-h-0 w-full max-w-7xl flex-1 overflow-x-hidden overflow-y-auto bg-zinc-50 p-6 md:p-8",
          )}
        >
          {children}
        </main>
      </div>
      <SearchCommandPalette />
    </div>
  );
}
