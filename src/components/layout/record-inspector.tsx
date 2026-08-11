"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { cn } from "@/shared/utils";
import { PageContainer } from "./page-container";
import { RecordTabs, type RecordTabItem } from "./record-tabs";
import { useWorkspaceTabs, tabIdFor, type WorkspaceTabKind } from "./workspace-tabs";
import { IconButton } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";

export interface RecordInspectorProps {
  kind: WorkspaceTabKind;
  refId: string;
  title: string;
  subtitle?: ReactNode;
  badges?: ReactNode;
  backHref: string;
  backLabel: string;
  tabs: RecordTabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Shared shell for high-density record inspector pages. Renders the record
 * header, an "Open in workspace tab" affordance, and the animated
 * RecordTabs bar. Each detail page supplies its own tab panels.
 */
export function RecordInspector({
  kind,
  refId,
  title,
  subtitle,
  badges,
  backHref,
  backLabel,
  tabs,
  activeTab,
  onTabChange,
  actions,
  children,
  className = "",
}: RecordInspectorProps) {
  const { openTab, tabs: openTabs } = useWorkspaceTabs();
  const id = tabIdFor(kind, refId);
  const isTabOpen = openTabs.some((t) => t.id === id);

  return (
    <PageContainer className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href={backHref} className="hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="size-3" aria-hidden="true" />
                {backLabel}
              </Link>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-foreground text-xl font-bold tracking-tight md:text-2xl">
                {title}
              </h1>
              {badges}
            </div>
            {subtitle && <div className="text-muted-foreground text-sm leading-relaxed">{subtitle}</div>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <Tooltip content={isTabOpen ? "Open record in workspace tab" : "Open record in workspace tab"}>
              <IconButton
                type="button"
                variant="secondary"
                size="sm"
                label={`Open ${title} in workspace tab`}
                onClick={() =>
                  openTab({ kind, ref: refId, title, subtitle: typeof subtitle === "string" ? subtitle : refId, href: `${backHref}/${refId}` })
                }
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>

      <RecordTabs items={tabs} value={activeTab} onValueChange={onTabChange} />

      <div className="density-gap flex min-w-0 flex-1 flex-col">{children}</div>
    </PageContainer>
  );
}
