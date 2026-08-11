"use client";

import { useRef } from "react";
import { LayoutGroup, motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/utils";

export interface RecordTabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

export interface RecordTabsProps {
  id?: string;
  items: RecordTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

/**
 * High-density tab bar used inside record inspectors (decisions, sentinel
 * alerts, drawing inspections). Renders an animated active indicator via
 * Framer Motion `layoutId` and optional badge counts per tab.
 */
export function RecordTabs({ id = "record-tabs", items, value, onValueChange, className = "" }: RecordTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const groupId = `${id}-slider`;

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Record inspector tabs"
      className={cn(
        "border-border flex items-center gap-0.5 overflow-x-auto border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <LayoutGroup id={groupId}>
        {items.map((item) => {
          const isActive = item.value === value;
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-state={isActive ? "active" : "inactive"}
              onClick={() => onValueChange(item.value)}
              className={cn(
                "text-muted-foreground hover:text-foreground relative flex h-9 shrink-0 items-center gap-1.5 rounded-t-md px-2.5 text-xs font-medium transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                isActive && "text-foreground",
              )}
            >
              {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
              <span className="whitespace-nowrap">{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px font-mono text-[10px] font-semibold",
                    isActive ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.count}
                </span>
              )}
              {isActive && (
                <motion.span
                  layoutId={groupId}
                  className="bg-foreground absolute inset-x-1.5 bottom-0 h-0.5 rounded-full"
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </button>
          );
        })}
      </LayoutGroup>
    </div>
  );
}
