import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Footer } from "./footer";
import { WorkspaceTabBar } from "./workspace-tab-bar";
import { SearchCommandPalette } from "@/features/search";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#06090e] text-slate-100 antialiased">
      <Sidebar />
      <div className="flex flex-1 flex-col h-screen min-w-0 overflow-hidden">
        <Header />
        <WorkspaceTabBar />
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[#06090e] text-slate-100 flex flex-col justify-between">
          <div className="flex-1 min-w-0">
            {children}
          </div>
          <Footer />
        </main>
      </div>
      <SearchCommandPalette />
    </div>
  );
}

