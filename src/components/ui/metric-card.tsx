"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils";

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  hint?: React.ReactNode;
}

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className = "", label, value, trend, trendValue, icon, hint, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group border-border/80 bg-surface/70 relative overflow-hidden rounded-xl border p-5 backdrop-blur-md transition-all duration-200",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_4px_20px_-2px_rgba(0,0,0,0.3)]",
          "hover:border-sky-500/30 hover:shadow-[0_8px_30px_-4px_rgba(0,240,255,0.12)] hover:-translate-y-0.5",
          className,
        )}
        {...props}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase truncate">
              {label}
            </span>
            <span className="text-foreground text-2xl font-bold tracking-tight font-mono">
              {value}
            </span>
          </div>
          {icon && (
            <div className="text-muted-foreground/70 bg-surface/80 rounded-lg p-2 border border-border/40 shrink-0 group-hover:text-sky-400 group-hover:border-sky-500/30 transition-colors">
              {icon}
            </div>
          )}
        </div>
        {hint && (
          <span className="text-muted-foreground/80 mt-1.5 block text-[11px] leading-relaxed">
            {hint}
          </span>
        )}
        {trend && trendValue && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border",
                trend === "up" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                trend === "down" && "bg-rose-500/10 text-rose-400 border-rose-500/30",
                trend === "neutral" && "bg-muted/80 text-muted-foreground border-border/60",
              )}
            >
              {trendValue}
            </span>
          </div>
        )}
      </div>
    );
  },
);

MetricCard.displayName = "MetricCard";

