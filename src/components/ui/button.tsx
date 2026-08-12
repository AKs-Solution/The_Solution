"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-foreground text-background hover:bg-foreground/90 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-500 shadow-[0_0_15px_-3px_rgba(2,132,199,0.4)] hover:shadow-[0_0_20px_-2px_rgba(14,165,233,0.6)] border border-sky-400/30 active:scale-[0.98]",
  secondary:
    "border border-border/80 bg-surface/60 text-foreground hover:bg-surface-hover hover:border-sky-500/40 backdrop-blur-sm shadow-xs active:scale-[0.98]",
  ghost:
    "text-muted-foreground hover:text-foreground hover:bg-surface-hover active:scale-[0.98]",
  destructive:
    "bg-rose-600 text-white hover:bg-rose-500 shadow-[0_0_15px_-3px_rgba(244,63,94,0.4)] border border-rose-400/30 active:scale-[0.98]",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs tracking-tight rounded-md",
  md: "h-9.5 px-4 text-sm font-medium rounded-lg",
  lg: "h-11 px-5 text-base font-medium rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "focus-visible:ring-ring inline-flex cursor-pointer items-center justify-center font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 select-none",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

