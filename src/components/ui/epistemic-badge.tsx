"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/shared/utils";
import { Badge } from "./badge";

export type EpistemicStatus = "RECORDED" | "DERIVED" | "INFERRED" | "UNKNOWN" | "GAP";

export interface EpistemicBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: EpistemicStatus;
  label?: string;
  size?: "sm" | "md";
  showDot?: boolean;
}

const STATUS_STYLES: Record<EpistemicStatus, { badge: string; dot: string }> = {
  RECORDED: {
    badge: "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    dot: "bg-cyan-500",
  },
  DERIVED: {
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  INFERRED: {
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  UNKNOWN: {
    badge: "border-crimson-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500/70",
  },
  GAP: {
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500/70",
  },
};

const DEFAULT_LABELS: Record<EpistemicStatus, string> = {
  RECORDED: "Recorded",
  DERIVED: "Derived",
  INFERRED: "Inferred",
  UNKNOWN: "Unknown",
  GAP: "Gap",
};

function normalizeStatus(value: string | null | undefined): EpistemicStatus {
  const v = (value ?? "").toUpperCase();
  if (v === "RECORDED" || v === "DERIVED" || v === "INFERRED") return v;
  if (v === "UNKNOWN" || v === "GAP") return v;
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
        className={cn("border font-mono", styles.badge, className)}
        {...props}
      >
        {showDot && <span className={cn("size-1.5 rounded-full", styles.dot)} aria-hidden="true" />}
        {label ?? DEFAULT_LABELS[normalized]}
      </Badge>
    );
  },
);

EpistemicBadge.displayName = "EpistemicBadge";
