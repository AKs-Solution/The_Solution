"use client";

import { Activity, CircleCheck, CircleDot, GitCommit, Network } from "lucide-react";
import { APP_NAME } from "@/shared/constants";
import {
  useWorkspacePreferences,
  DENSITY_LABELS,
  LAYOUT_OPTIONS,
} from "./workspace-preferences";
import { useWorkspaceTabs } from "./workspace-tabs";

const KIND_ICONS = {
  decision: GitCommit,
  sentinel: Activity,
  drawing: GitCommit,
  "failure-graph": Network,
  ledger: CircleDot,
} as const;

/**
 * The application footer. In software-style layouts (studio / tabs) it renders
 * an IDE-style status bar with the active workspace context; the classic layout
 * keeps the original static copyright bar.
 */
export function Footer() {
  const { layout, density } = useWorkspacePreferences();
  const { activeTab } = useWorkspaceTabs();

  if (layout === "classic") {
    return (
      <footer className="border-border text-muted-foreground flex items-center justify-between border-t px-6 py-4 text-xs">
        <span>&copy; {new Date().getFullYear()} AKSCI. All rights reserved.</span>
        <span>{APP_NAME}</span>
      </footer>
    );
  }

  const layoutLabel = LAYOUT_OPTIONS.find((o) => o.id === layout)?.name ?? layout;
  const ActiveIcon = activeTab ? KIND_ICONS[activeTab.kind] : CircleCheck;

  return (
    <footer
      role="status"
      aria-label="Workspace status"
      className="border-border bg-background text-muted-foreground flex h-6 shrink-0 items-center justify-between gap-3 border-t px-3 text-[11px]"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="bg-emerald-500/80 size-1.5 shrink-0 animate-pulse rounded-full" aria-hidden="true" />
        {activeTab ? (
          <>
            <ActiveIcon className="size-3 shrink-0" aria-hidden="true" />
            <span className="text-foreground/90 max-w-56 truncate font-medium">{activeTab.title}</span>
            {activeTab.subtitle && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate font-mono text-[10px]">{activeTab.subtitle}</span>
              </>
            )}
          </>
        ) : (
          <span>Ready</span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="font-mono">{layoutLabel}</span>
        <span aria-hidden="true">·</span>
        <span>{DENSITY_LABELS[density]}</span>
        <span aria-hidden="true">·</span>
        <span className="font-mono">{APP_NAME}</span>
      </div>
    </footer>
  );
}
