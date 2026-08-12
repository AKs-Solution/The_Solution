"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/shared/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className = "", items, separator, ...props }, ref) => {
    if (items.length === 0) return null;
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn("flex items-center gap-1.5 text-xs font-medium", className)}
        {...props}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 &&
                (separator ?? <ChevronRight className="text-muted-foreground/50 size-3 shrink-0" />)}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-sky-400 transition-colors tracking-tight"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn("tracking-tight", isLast ? "text-foreground font-semibold" : "text-muted-foreground")}>
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    );
  },
);

Breadcrumb.displayName = "Breadcrumb";
