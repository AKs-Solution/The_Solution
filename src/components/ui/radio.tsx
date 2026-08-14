"use client";

import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/shared/utils";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className = "", label, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <label htmlFor={inputId} className="flex cursor-pointer items-center gap-2">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className={cn(
            "focus:ring-ring size-4 accent-black focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        {label && <span className="text-foreground text-sm">{label}</span>}
      </label>
    );
  },
);

Radio.displayName = "Radio";
