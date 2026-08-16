import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { NavHeader } from "./nav-header";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      <NavHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
