"use client";

import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/shared/utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <label htmlFor={inputId} className="flex cursor-pointer items-center gap-2">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            "border-border bg-background text-foreground focus:ring-ring size-4 rounded accent-black focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        {label && <span className="text-foreground text-sm">{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
