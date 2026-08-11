"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Gauge,
  Truck,
  Brain,
  ChevronsUpDown,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  MonitorUp,
  Rows3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/utils";
import {
  useWorkspacePreferences,
  DENSITY_LABELS,
  type WorkspaceDensity,
  type WorkspaceViewIcon,
} from "./workspace-preferences";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const VIEW_ICONS: Record<WorkspaceViewIcon, LucideIcon> = {
  layout: LayoutDashboard,
  shield: ShieldCheck,
  gauge: Gauge,
  truck: Truck,
  brain: Brain,
};

const DENSITY_ICONS: Record<WorkspaceDensity, LucideIcon> = {
  compact: MonitorUp,
  comfortable: Rows3,
  spacious: LayoutDashboard,
};

export function DensitySwitcher() {
  const { density, setDensity } = useWorkspacePreferences();

  return (
    <div
      role="radiogroup"
      aria-label="Layout density"
      className="border-border bg-background inline-flex items-center rounded-md border p-0.5"
    >
      {(Object.keys(DENSITY_LABELS) as WorkspaceDensity[]).map((d) => {
        const Icon = DENSITY_ICONS[d];
        const isActive = density === d;
        return (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={`${DENSITY_LABELS[d]} density`}
            aria-label={`${DENSITY_LABELS[d]} density`}
            onClick={() => setDensity(d)}
            className={cn(
              "text-muted-foreground hover:text-foreground flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
              isActive && "bg-foreground text-background hover:text-background",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            <span className="hidden lg:inline">{DENSITY_LABELS[d]}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ViewSwitcher() {
  const {
    views,
    activeViewId,
    activeView,
    applyView,
    saveCurrentView,
    deleteView,
    resetWorkspace,
  } = useWorkspacePreferences();
  const [name, setName] = useState("");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    saveCurrentView(name);
    setName("");
  }

  const ActiveIcon = activeView ? VIEW_ICONS[activeView.icon] : LayoutDashboard;

  return (
    <DropdownMenu
      align="end"
      trigger={
        <button
          type="button"
          className="border-border bg-background text-foreground hover:bg-surface-hover inline-flex h-8 max-w-48 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Workspace views"
        >
          <ActiveIcon className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{activeView?.name ?? "Workspace"}</span>
          <ChevronsUpDown className="text-muted-foreground size-3 shrink-0" aria-hidden="true" />
        </button>
      }
    >
      <DropdownMenuLabel>Saved views</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <div className="max-h-72 overflow-y-auto">
        {views.map((view) => {
          const Icon = VIEW_ICONS[view.icon] ?? LayoutDashboard;
          const isActive = view.id === activeViewId;
          return (
            <DropdownMenuItem
              key={view.id}
              type="button"
              onClick={() => applyView(view.id)}
              className={cn("flex items-center justify-between", isActive && "text-accent")}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{view.name}</span>
              </span>
              {isActive && <Check className="size-3.5 shrink-0" aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
      </div>
      <DropdownMenuSeparator />
      <form onSubmit={handleSave} className="flex items-center gap-1.5 px-2.5 py-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Save current as view..."
          aria-label="Name for new view"
          className="border-border bg-background text-foreground placeholder:text-muted-foreground/60 h-7 min-w-0 flex-1 rounded border px-2 text-xs outline-none focus-visible:ring-ring focus-visible:ring-2"
        />
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          disabled={!name.trim()}
          className="h-7 shrink-0 px-2 text-xs"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Save
        </Button>
      </form>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        type="button"
        disabled={!activeView || activeView.id.startsWith("custom-") === false}
        onClick={() => activeView && deleteView(activeView.id)}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        Delete current view
      </DropdownMenuItem>
      <DropdownMenuItem type="button" onClick={() => resetWorkspace()}>
        <RotateCcw className="size-4" aria-hidden="true" />
        Reset workspace defaults
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
