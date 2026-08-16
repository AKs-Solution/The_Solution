"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "success" | "warning" | "outline";
  size?: "sm" | "md";
}

const variantStyles = {
  default: "bg-slate-100 text-slate-800 border border-slate-200",
  secondary: "bg-slate-50 text-slate-600 border border-slate-200",
  destructive: "bg-rose-50 text-rose-800 border border-rose-200",
  success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  warning: "bg-amber-50 text-amber-800 border border-amber-200",
  outline: "border border-slate-200 text-slate-900 bg-white",
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
