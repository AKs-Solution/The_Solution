import { Shell, WorkspacePreferencesProvider, WorkspaceTabsProvider } from "@/components/layout";
import { CommandPalette } from "@/components/CommandPalette";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspacePreferencesProvider>
      <WorkspaceTabsProvider>
        <Shell>
          <CommandPalette />
          {children}
        </Shell>
      </WorkspaceTabsProvider>
      <Toaster />
    </WorkspacePreferencesProvider>
  );
}
