"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/shared/utils";

export type EpistemicStatus =
  "RECORDED" | "DERIVED" | "INFERRED" | "ASSERTED" | "UNKNOWN" | "GAP" | "CRITICAL";

export interface EpistemicBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: EpistemicStatus;
  label?: string;
  size?: "sm" | "md";
  showDot?: boolean;
}

const STATUS_STYLES: Record<EpistemicStatus, { badge: string; dot: string }> = {
  RECORDED: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-500",
  },
  DERIVED: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-600",
  },
  INFERRED: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  ASSERTED: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-600",
  },
  UNKNOWN: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  GAP: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  CRITICAL: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

const DEFAULT_LABELS: Record<EpistemicStatus, string> = {
  RECORDED: "RECORDED",
  DERIVED: "DERIVED",
  INFERRED: "INFERRED",
  ASSERTED: "ASSERTED",
  UNKNOWN: "UNKNOWN",
  GAP: "GAP",
  CRITICAL: "CRITICAL",
};

function normalizeStatus(value: string | null | undefined): EpistemicStatus {
  const v = (value ?? "").toUpperCase();
  if (v === "RECORDED" || v === "DERIVED" || v === "INFERRED" || v === "ASSERTED") return v;
  if (v === "UNKNOWN" || v === "GAP" || v === "CRITICAL") return v;
  return "UNKNOWN";
}

export const EpistemicBadge = forwardRef<HTMLSpanElement, EpistemicBadgeProps>(
  ({ className = "", status, label, size = "sm", showDot = true, ...props }, ref) => {
    const normalized = normalizeStatus(status);
    const styles = STATUS_STYLES[normalized];
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded border px-2.5 py-0.5 font-mono text-xs",
          styles.badge,
          size === "md" && "px-3 py-1",
          className,
        )}
        {...props}
      >
        {showDot && <span className={cn("size-1.5 rounded-full", styles.dot)} aria-hidden="true" />}
        {label ?? DEFAULT_LABELS[normalized]}
      </span>
    );
  },
);

EpistemicBadge.displayName = "EpistemicBadge";
