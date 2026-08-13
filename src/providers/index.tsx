import type { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { ErrorBoundary } from "./error-boundary";
import { ToastProvider } from "@/components/ui/toaster";

export { ThemeProvider, useTheme } from "./theme-provider";
export { ErrorBoundary } from "./error-boundary";

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
