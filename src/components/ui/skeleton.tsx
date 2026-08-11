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
          "bg-muted relative overflow-hidden rounded-md",
          !shimmer && "animate-pulse",
          className,
        )}
        aria-hidden="true"
        {...props}
      >
        {shimmer && (
          <span className="animate-shimmer bg-gradient-to-r from-transparent via-foreground/10 to-transparent absolute inset-0" />
        )}
      </div>
    );
  },
);

Skeleton.displayName = "Skeleton";
