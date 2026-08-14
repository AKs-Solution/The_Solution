"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  label: string;
}

const variantStyles = {
  primary: "bg-black text-white hover:bg-black/80",
  secondary: "border border-border bg-white hover:bg-surface-hover",
  ghost: "hover:bg-surface-hover",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
};

const sizeStyles = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = "", variant = "ghost", size = "md", label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={cn(
          "focus-visible:ring-ring inline-flex items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

IconButton.displayName = "IconButton";
