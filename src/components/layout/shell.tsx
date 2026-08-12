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
    <div className="flex min-h-screen bg-[#06090e] text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <WorkspaceTabBar />
        <main className="flex-1 bg-[#06090e] text-slate-100 overflow-y-auto">{children}</main>
        <Footer />
      </div>
      <SearchCommandPalette />
    </div>
  );
}
