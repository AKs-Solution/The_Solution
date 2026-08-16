"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/shared/utils";
import { Badge } from "./badge";

export type EpistemicStatus = "RECORDED" | "DERIVED" | "INFERRED" | "UNKNOWN" | "GAP" | "CRITICAL";

export interface EpistemicBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: EpistemicStatus;
  label?: string;
  size?: "sm" | "md";
  showDot?: boolean;
}

const STATUS_STYLES: Record<EpistemicStatus, { badge: string; dot: string }> = {
  RECORDED: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  DERIVED: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-600",
  },
  INFERRED: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-600",
  },
  UNKNOWN: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-600",
  },
  GAP: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-600",
  },
  CRITICAL: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-600",
  },
};

const DEFAULT_LABELS: Record<EpistemicStatus, string> = {
  RECORDED: "Recorded",
  DERIVED: "Derived",
  INFERRED: "Inferred",
  UNKNOWN: "Unknown",
  GAP: "Gap",
  CRITICAL: "Critical",
};

function normalizeStatus(value: string | null | undefined): EpistemicStatus {
  const v = (value ?? "").toUpperCase();
  if (v === "RECORDED" || v === "DERIVED" || v === "INFERRED") return v;
  if (v === "UNKNOWN" || v === "GAP" || v === "CRITICAL") return v;
  return "UNKNOWN";
}

export const EpistemicBadge = forwardRef<HTMLSpanElement, EpistemicBadgeProps>(
  ({ className = "", status, label, size = "sm", showDot = false, ...props }, ref) => {
    const normalized = normalizeStatus(status);
    const styles = STATUS_STYLES[normalized];
    return (
      <Badge
        ref={ref}
        size={size}
        variant="outline"
        className={cn("rounded border px-2.5 py-0.5 font-mono text-xs", styles.badge, className)}
        {...props}
      >
        {showDot && (
          <span className={cn("mr-1.5 size-1.5 rounded-full", styles.dot)} aria-hidden="true" />
        )}
        {label ?? DEFAULT_LABELS[normalized]}
      </Badge>
    );
  },
);

EpistemicBadge.displayName = "EpistemicBadge";
