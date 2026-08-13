"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FileText,
  FileCheck,
  BookCheck,
  Activity,
  GitBranch,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useWorkspaceTabs } from "./workspace-tabs";

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
  href: string;
}

const DEFAULT_SUB_TABS: SubTabOption[] = [
  { id: "overview", label: "Executive Mission", icon: FileText, href: "/executive-dashboard" },
  { id: "evidence", label: "Evidence & Proofs", icon: FileCheck, badge: "SHA-256", href: "/evidence" },
  { id: "precedents", label: "Precedent Validity", icon: BookCheck, badge: "510+", href: "/precedents" },
  { id: "sentinel", label: "Sentinel Surveillance", icon: Activity, badge: "LIVE", href: "/sentinel" },
  { id: "reasoning", label: "Reasoning Trace", icon: GitBranch, href: "/decisions" },
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
  const router = useRouter();
  const pathname = usePathname();
  const { openTab } = useWorkspaceTabs();
  const [internalActiveTab, setInternalActiveTab] = useState<SubTabId>("overview");

  // Derive active tab from pathname if not explicitly passed
  let derivedActiveTab: SubTabId = externalActiveTab ?? internalActiveTab;
  if (!externalActiveTab) {
    if (pathname.startsWith("/evidence")) derivedActiveTab = "evidence";
    else if (pathname.startsWith("/precedents")) derivedActiveTab = "precedents";
    else if (pathname.startsWith("/sentinel")) derivedActiveTab = "sentinel";
    else if (pathname.startsWith("/decisions") || pathname.startsWith("/reasoning")) derivedActiveTab = "reasoning";
    else if (pathname.startsWith("/executive-dashboard") || pathname.startsWith("/dashboard")) derivedActiveTab = "overview";
  }

  const handleSelect = (tab: SubTabOption) => {
    setInternalActiveTab(tab.id);
    if (onTabChange) {
      onTabChange(tab.id);
    } else {
      openTab({
        kind: "ledger",
        ref: tab.href,
        title: tab.label,
        href: tab.href,
      });
      router.push(tab.href);
    }
  };

  return (
    <div className={cn("border-b border-slate-800/80 bg-[#080c14] px-3 py-1 select-none", className)}>
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {DEFAULT_SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = derivedActiveTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelect(tab)}
              className={cn(
                "flex h-7.5 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-all duration-150 shrink-0 select-none",
                isActive
                  ? "border-sky-400 bg-sky-500 text-white font-semibold shadow-[0_0_12px_rgba(14,165,233,0.35)]"
                  : "border-slate-700/50 bg-slate-800/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon className={cn("size-3.5", isActive ? "text-white" : "text-slate-400")} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.2 font-mono text-[9px] font-semibold border",
                    isActive
                      ? "bg-white/20 text-white border-white/30"
                      : "bg-slate-900/80 text-slate-400 border-slate-700/60",
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


