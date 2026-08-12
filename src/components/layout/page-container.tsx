import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils";

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidths = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[1400px]",
  full: "max-w-full",
};

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className = "", maxWidth = "xl", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mx-auto w-full max-w-full overflow-x-auto px-3 py-3 md:px-5 md:py-4", maxWidths[maxWidth], className)}
        {...props}
      />
    );
  },
);

PageContainer.displayName = "PageContainer";
