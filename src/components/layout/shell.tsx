import type { ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { WorkspaceTabBar } from "./workspace-tab-bar";
import { SearchCommandPalette } from "@/features/search";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="m-0 flex h-screen w-screen flex-col overflow-hidden bg-zinc-50 p-0 text-zinc-900 antialiased">
      {/* Fixed Top Header */}
      <Header />
      {/* Fixed Sub-Header Workspace Tab Bar */}
      <WorkspaceTabBar />
      {/* Workspace Middle Container */}
      <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
        {/* Slim Collapsed Sidebar */}
        <Sidebar />
        {/* Main Canvas */}
        <main className="mx-auto min-h-0 w-full max-w-7xl flex-1 overflow-x-hidden overflow-y-auto bg-zinc-50 p-6 md:p-8">
          {children}
        </main>
      </div>
      <SearchCommandPalette />
    </div>
  );
}
