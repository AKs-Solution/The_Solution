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
          "group relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-200",
          "hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md",
          className,
        )}
        {...props}
      >
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-zinc-300 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-muted-foreground truncate text-[11px] font-semibold tracking-wider uppercase">
              {label}
            </span>
            <span className="text-foreground font-mono text-2xl font-bold tracking-tight">
              {value}
            </span>
          </div>
          {icon && (
            <div className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-zinc-400 transition-colors group-hover:text-zinc-700">
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
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
                trend === "up" && "border-emerald-200 bg-emerald-50 text-emerald-800",
                trend === "down" && "border-rose-200 bg-rose-50 text-rose-800",
                trend === "neutral" && "border-zinc-200 bg-zinc-100 text-zinc-600",
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
