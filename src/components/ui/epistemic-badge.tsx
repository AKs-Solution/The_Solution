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
    badge: "bg-zinc-100 text-zinc-700 border-zinc-300",
    dot: "bg-zinc-400",
  },
  DERIVED: {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-600",
  },
  INFERRED: {
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-600",
  },
  UNKNOWN: {
    badge: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-600",
  },
  GAP: {
    badge: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-600",
  },
  CRITICAL: {
    badge: "bg-rose-50 text-rose-800 border-rose-300 font-semibold",
    dot: "bg-rose-600 animate-pulse",
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
  ({ className = "", status, label, size = "sm", showDot = true, ...props }, ref) => {
    const normalized = normalizeStatus(status);
    const styles = STATUS_STYLES[normalized];
    return (
      <Badge
        ref={ref}
        size={size}
        variant="outline"
        className={cn("rounded border px-2 py-0.5 font-mono text-xs", styles.badge, className)}
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
