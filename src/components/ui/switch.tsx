"use client";

import { type ButtonHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/shared/utils";

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className = "", checked = false, onCheckedChange, label, ...props }, ref) => {
    const generatedId = useId();
    return (
      <label htmlFor={generatedId} className="flex cursor-pointer items-center gap-2">
        <button
          ref={ref}
          id={generatedId}
          role="switch"
          aria-checked={checked}
          onClick={() => onCheckedChange?.(!checked)}
          className={cn(
            "focus-visible:ring-ring relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-black" : "bg-muted-foreground/30",
            className,
          )}
          {...props}
        >
          <span
            className={cn(
              "pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform",
              checked ? "translate-x-4" : "translate-x-0",
            )}
          />
        </button>
        {label && <span className="text-foreground text-sm">{label}</span>}
      </label>
    );
  },
);

Switch.displayName = "Switch";
