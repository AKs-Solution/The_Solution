import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Footer } from "./footer";
import { ActivityRail } from "./activity-rail";
import { WorkspaceTabBar } from "./workspace-tab-bar";
import { SearchCommandPalette } from "@/features/search";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <ActivityRail />
      <div className="flex flex-1 flex-col">
        <Header />
        <WorkspaceTabBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <SearchCommandPalette />
    </div>
  );
}
