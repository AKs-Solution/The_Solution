"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "border border-[#1F2D44] bg-[#0E1420] rounded-lg transition-colors text-slate-100 shadow-sm",
        className,
      )}
      {...props}
    />
  );
});

Card.displayName = "Card";

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", ...props }, ref) => {
    return <div ref={ref} className={cn("flex flex-col gap-1.5 p-5 pb-0", className)} {...props} />;
  },
);

CardHeader.displayName = "CardHeader";

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("text-slate-100 text-sm font-semibold tracking-tight", className)}
        {...props}
      />
    );
  },
);

CardTitle.displayName = "CardTitle";

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = "", ...props }, ref) => {
    return <p ref={ref} className={cn("text-slate-400 text-xs", className)} {...props} />;
  },
);

CardDescription.displayName = "CardDescription";

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = "", ...props }, ref) => {
    return <div ref={ref} className={cn("p-5", className)} {...props} />;
  },
);

CardContent.displayName = "CardContent";

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center gap-2 p-5 pt-0", className)} {...props} />
    );
  },
);

CardFooter.displayName = "CardFooter";
