"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  shimmer?: boolean;
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = "", shimmer = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded bg-slate-200/70",
          !shimmer && "animate-pulse",
          className,
        )}
        aria-hidden="true"
        {...props}
      >
        {shimmer && <span className="absolute inset-0 animate-pulse bg-slate-100/40" />}
      </div>
    );
  },
);

Skeleton.displayName = "Skeleton";

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
      <div className="border-b border-slate-200 bg-slate-50 p-3.5">
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-3.5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="ml-auto h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricTileSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-16" />
    </div>
  );
}
