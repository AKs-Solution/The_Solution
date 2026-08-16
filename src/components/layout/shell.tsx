"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { WorkspaceTabBar } from "./workspace-tab-bar";
import { SearchCommandPalette } from "@/features/search";
import { useWorkspacePreferences } from "./workspace-preferences";
import { cn } from "@/shared/utils";
import { useGuestMode } from "@/features/auth/components";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const { layoutMode } = useWorkspacePreferences();
  const { isGuest } = useGuestMode();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const showSidebar = layoutMode !== "minimal-focus";

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
    <div className="m-0 flex h-screen w-screen flex-col overflow-hidden bg-slate-50 p-0 text-slate-900 antialiased">
      <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
      {isGuest && (
        <div className="flex-shrink-0 border-b border-slate-200 bg-slate-50 px-6 py-2 text-center text-xs leading-relaxed text-slate-600">
          You&apos;re exploring Consecuencia with public aerospace data. Create an account to upload
          your organization&apos;s knowledge, validate engineering decisions, and enable Decision
          Sentinel.
        </div>
      )}
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
            <Sidebar mobileOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
          </>
        )}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <WorkspaceTabBar />
          <main
            id="main-content"
            className={cn(
              "mx-auto min-h-0 w-full max-w-6xl flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 md:p-8",
            )}
          >
            {children}
          </main>
        </div>
      </div>
      <SearchCommandPalette />
    </div>
  );
}
