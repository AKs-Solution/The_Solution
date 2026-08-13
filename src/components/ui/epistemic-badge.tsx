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
    badge: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    dot: "bg-cyan-400",
  },
  DERIVED: {
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  INFERRED: {
    badge: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
  },
  UNKNOWN: {
    badge: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-400",
  },
  GAP: {
    badge: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    dot: "bg-rose-400",
  },
  CRITICAL: {
    badge: "border-rose-500/60 bg-rose-500/20 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.3)] font-semibold",
    dot: "bg-rose-400 animate-pulse",
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
        className={cn("border font-mono text-xs px-2 py-0.5 rounded", styles.badge, className)}
        {...props}
      >
        {showDot && <span className={cn("size-1.5 rounded-full mr-1.5", styles.dot)} aria-hidden="true" />}
        {label ?? DEFAULT_LABELS[normalized]}
      </Badge>
    );
  },
);

EpistemicBadge.displayName = "EpistemicBadge";
