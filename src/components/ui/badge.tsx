"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "success" | "warning" | "outline";
  size?: "sm" | "md";
}

const variantStyles = {
  default: "bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-[0_0_10px_-3px_rgba(14,165,233,0.3)]",
  secondary: "bg-muted/80 text-muted-foreground border border-border/60",
  destructive: "bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_-3px_rgba(244,63,94,0.3)]",
  success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]",
  warning: "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_-3px_rgba(245,158,11,0.3)]",
  outline: "border border-border/80 text-foreground bg-surface/40 backdrop-blur-xs",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
  md: "px-2.5 py-0.5 text-xs font-medium tracking-tight",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";

