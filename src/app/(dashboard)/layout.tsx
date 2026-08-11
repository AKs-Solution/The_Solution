import { Shell, WorkspacePreferencesProvider } from "@/components/layout";
import { CommandPalette } from "@/components/CommandPalette";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspacePreferencesProvider>
      <Shell>
        <CommandPalette />
        {children}
      </Shell>
      <Toaster />
    </WorkspacePreferencesProvider>
  );
}
