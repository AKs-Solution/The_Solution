"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className = "", icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-6 py-16 text-center shadow-xs",
          className,
        )}
        {...props}
      >
        {icon && (
          <div className="flex size-12 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500">
            {icon}
          </div>
        )}
        <div className="max-w-md">
          <p className="text-sm font-semibold text-zinc-900">{title}</p>
          {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
        </div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    );
  },
);

EmptyState.displayName = "EmptyState";
