"use client";

import { useState } from "react";
import {
  FileText,
  ShieldCheck,
  BookCheck,
  Activity,
  GitBranch,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";

export type SubTabId =
  | "overview"
  | "evidence"
  | "precedents"
  | "sentinel"
  | "reasoning";

export interface SubTabOption {
  id: SubTabId;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const DEFAULT_SUB_TABS: SubTabOption[] = [
  { id: "overview", label: "Overview & Rationale", icon: FileText },
  { id: "evidence", label: "Evidence & Proofs", icon: ShieldCheck, badge: "SHA-256" },
  { id: "precedents", label: "Precedent Validity", icon: BookCheck, badge: "510+" },
  { id: "sentinel", label: "Sentinel Surveillance", icon: Activity, badge: "LIVE" },
  { id: "reasoning", label: "Reasoning Trace", icon: GitBranch },
];

interface SubTabInspectorProps {
  activeTab?: SubTabId;
  onTabChange?: (tab: SubTabId) => void;
  className?: string;
}

export function SubTabInspector({
  activeTab: externalActiveTab,
  onTabChange,
  className = "",
}: SubTabInspectorProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<SubTabId>("overview");
  const activeTab = externalActiveTab ?? internalActiveTab;

  const handleSelect = (tabId: SubTabId) => {
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className={cn("border-b border-border/80 bg-surface/40 px-4 py-1.5 backdrop-blur-md", className)}>
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {DEFAULT_SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelect(tab.id)}
              className={cn(
                "flex h-7.5 cursor-pointer items-center gap-2 rounded-md border px-3 text-xs font-semibold transition-all duration-150 shrink-0 select-none",
                isActive
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-400 shadow-[inset_0_1px_0_0_rgba(56,189,248,0.2),0_0_10px_-2px_rgba(14,165,233,0.3)]"
                  : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-surface-hover hover:text-foreground",
              )}
            >
              <Icon className={cn("size-3.5", isActive ? "text-sky-400" : "text-muted-foreground")} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.2 font-mono text-[9px] font-bold border",
                    isActive
                      ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                      : "bg-surface/80 text-muted-foreground/80 border-border/40",
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
