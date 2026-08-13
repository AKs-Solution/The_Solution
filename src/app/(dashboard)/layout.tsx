import { Shell, WorkspacePreferencesProvider, WorkspaceTabsProvider } from "@/components/layout";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspacePreferencesProvider>
      <WorkspaceTabsProvider>
        <Shell>{children}</Shell>
      </WorkspaceTabsProvider>
      <Toaster />
    </WorkspacePreferencesProvider>
  );
}
