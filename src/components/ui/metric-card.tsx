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

const trendStyles = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-muted-foreground",
};

export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className = "", label, value, trend, trendValue, icon, hint, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("border-border bg-background rounded-lg border p-5", className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs font-medium">{label}</span>
            <span className="text-foreground text-2xl font-semibold">{value}</span>
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        {hint && <span className="text-muted-foreground mt-1 block text-[11px]">{hint}</span>}
        {trend && trendValue && (
          <span
            className={cn(
              "mt-2 inline-flex items-center gap-1 text-xs font-medium",
              trendStyles[trend],
            )}
          >
            {trendValue}
          </span>
        )}
      </div>
    );
  },
);

MetricCard.displayName = "MetricCard";
