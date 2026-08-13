import type { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { WorkspaceTabBar } from "./workspace-tab-bar";
import { SearchCommandPalette } from "@/features/search";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#090D14] text-slate-100 m-0 p-0 antialiased">
      {/* Fixed Top Avionics Glass Header */}
      <Header />
      {/* Integrated Sub-Header Workspace Tab Bar */}
      <WorkspaceTabBar />
      {/* Main Content Workspace Canvas */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative w-full">
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 bg-[#090D14] text-slate-100 flex flex-col justify-between max-w-full">
          <div className="flex-1 min-w-0 w-full max-w-7xl mx-auto">
            {children}
          </div>
          <Footer />
        </main>
      </div>
      <SearchCommandPalette />
    </div>
  );
}
