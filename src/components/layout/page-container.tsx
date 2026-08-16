import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils";

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidths = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  full: "max-w-full",
};

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className = "", maxWidth = "xl", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("mx-auto w-full", maxWidths[maxWidth], className)} {...props} />
    );
  },
);

PageContainer.displayName = "PageContainer";
