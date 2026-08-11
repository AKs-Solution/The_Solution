"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp, GripVertical, Minus, Settings2, EyeOff, Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/utils";
import { useWorkspacePreferences } from "./workspace-preferences";
import { DropdownMenu, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Tooltip } from "@/components/ui/tooltip";

export interface WidgetConfig {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  span?: string;
}

export interface WidgetProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    | "onDrag"
    | "onDragStart"
    | "onDragEnd"
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
  > {
  config: WidgetConfig;
  actions?: ReactNode;
  children: ReactNode;
}

export const Widget = forwardRef<HTMLDivElement, WidgetProps>(
  ({ className = "", config, actions, children, ...props }, ref) => {
    const { widgetPrefs, setWidgetMinimized, setWidgetVisible } = useWorkspacePreferences();
    const prefs = widgetPrefs[config.id] ?? { visible: true, minimized: false };
    const minimized = prefs.minimized;
    const Icon = config.icon;

    return (
      <motion.section
        layout
        transition={{ layout: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
        ref={ref}
        className={cn(
          "border-border bg-background density-radius flex flex-col overflow-hidden rounded-lg border shadow-sm",
          className,
        )}
        {...props}
      >
        <header className="border-border flex items-center gap-2 border-b px-3 py-2.5">
          <GripVertical
            className="text-muted-foreground/40 -ml-1 hidden size-4 shrink-0 sm:block"
            aria-hidden="true"
          />
          {Icon && (
            <span className="text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground/5">
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="text-foreground truncate text-sm leading-tight font-semibold">
              {config.title}
            </h3>
            {config.description && (
              <p className="text-muted-foreground truncate text-xs leading-tight">
                {config.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {actions}
            <Tooltip content={minimized ? "Expand widget" : "Collapse widget"}>
              <IconButton
                type="button"
                size="sm"
                variant="ghost"
                label={minimized ? `Expand ${config.title}` : `Collapse ${config.title}`}
                onClick={() => setWidgetMinimized(config.id, !minimized)}
                aria-expanded={!minimized}
              >
                {minimized ? (
                  <ChevronUp className="size-3.5" aria-hidden="true" />
                ) : (
                  <Minus className="size-3.5" aria-hidden="true" />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip content="Hide widget">
              <IconButton
                type="button"
                size="sm"
                variant="ghost"
                label={`Hide ${config.title}`}
                onClick={() => setWidgetVisible(config.id, false)}
              >
                <EyeOff className="size-3.5" aria-hidden="true" />
              </IconButton>
            </Tooltip>
          </div>
        </header>
        <AnimatePresence initial={false}>
          {!minimized && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="density-p-sm">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    );
  },
);

Widget.displayName = "Widget";

export interface WidgetGridProps extends HTMLAttributes<HTMLDivElement> {
  widgets: WidgetConfig[];
  render: (config: WidgetConfig) => ReactNode;
  columns?: string;
}

export function WidgetGrid({
  className = "",
  widgets,
  render,
  columns = "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
  ...props
}: WidgetGridProps) {
  const { widgetPrefs, widgetOrder } = useWorkspacePreferences();
  const ordered = [...widgets].sort((a, b) => {
    const ai = widgetOrder.indexOf(a.id);
    const bi = widgetOrder.indexOf(b.id);
    return (ai === -1 ? widgets.length : ai) - (bi === -1 ? widgets.length : bi);
  });
  const visible = ordered.filter((w) => widgetPrefs[w.id]?.visible !== false);
  return (
    <div className={cn("grid density-gap", columns, className)} {...props}>
      {visible.map((w) => render(w))}
    </div>
  );
}

export interface WidgetCustomizeMenuProps {
  widgets: WidgetConfig[];
}

export function WidgetCustomizeMenu({ widgets }: WidgetCustomizeMenuProps) {
  const { widgetPrefs, widgetOrder, setWidgetVisible, moveWidget } = useWorkspacePreferences();
  const visibleCount = widgets.filter((w) => widgetPrefs[w.id]?.visible !== false).length;
  const hiddenCount = widgets.length - visibleCount;

  const sorted = [...widgets].sort((a, b) => {
    const ai = widgetOrder.indexOf(a.id);
    const bi = widgetOrder.indexOf(b.id);
    return (ai === -1 ? widgets.length : ai) - (bi === -1 ? widgets.length : bi);
  });

  return (
    <DropdownMenu
      align="end"
      trigger={
        <button
          type="button"
          className="border-border bg-background text-muted-foreground hover:text-foreground hover:bg-surface-hover relative inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Customize dashboard widgets"
        >
          <Settings2 className="size-3.5" aria-hidden="true" />
          Customize
          {hiddenCount > 0 && (
            <span className="bg-foreground text-background ml-0.5 rounded-full px-1.5 text-[10px] font-bold">
              {hiddenCount}
            </span>
          )}
        </button>
      }
    >
      <DropdownMenuLabel>Dashboard widgets</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto">
        {sorted.map((w) => {
          const visible = widgetPrefs[w.id]?.visible !== false;
          const index = widgetOrder.indexOf(w.id);
          return (
            <div
              key={w.id}
              className="hover:bg-surface-hover flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm"
            >
              <button
                type="button"
                role="switch"
                aria-checked={visible}
                aria-label={`${visible ? "Hide" : "Show"} ${w.title}`}
                onClick={() => setWidgetVisible(w.id, !visible)}
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                  visible
                    ? "border-border bg-background text-foreground"
                    : "text-muted-foreground border-dashed",
                )}
              >
                {visible ? <Eye className="size-3.5" aria-hidden="true" /> : <EyeOff className="size-3.5" aria-hidden="true" />}
              </button>
              <span className="text-foreground flex-1 truncate text-xs font-medium">{w.title}</span>
              <span className="flex shrink-0 items-center gap-0.5">
                <IconButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  label={`Move ${w.title} up`}
                  disabled={index <= 0}
                  onClick={() => moveWidget(w.id, "up")}
                >
                  <ChevronUp className="size-3.5" aria-hidden="true" />
                </IconButton>
                <IconButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  label={`Move ${w.title} down`}
                  disabled={index === -1 || index >= widgetOrder.length - 1}
                  onClick={() => moveWidget(w.id, "down")}
                >
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                </IconButton>
              </span>
            </div>
          );
        })}
      </div>
    </DropdownMenu>
  );
}
