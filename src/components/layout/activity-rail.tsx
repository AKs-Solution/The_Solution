"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bookmark,
  GitCommit,
  LayoutDashboard,
  Layers,
  Network,
  ScrollText,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useWorkspacePreferences } from "./workspace-preferences";
import { Tooltip } from "@/components/ui/tooltip";

interface RailItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const RAIL_ITEMS: RailItem[] = [
  { href: "/executive-dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
  { href: "/decisions", label: "Decision Audit Trail", icon: GitCommit },
  { href: "/sentinel", label: "Decision Sentinel", icon: Activity },
  { href: "/drawings", label: "Drawing Intelligence", icon: Layers },
  { href: "/precedents", label: "Precedent Engine", icon: Bookmark },
  { href: "/failure-graph", label: "Failure Graph", icon: Network },
  { href: "/certification", label: "Certification Readiness", icon: ShieldCheck },
  { href: "/audit", label: "Audit Log", icon: ScrollText },
];

function isRailActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Slim IDE-style activity dock rendered on the far left in the Engineering
 * Studio layout. Mirrors the module map of the sidebar as icon shortcuts.
 */
export function ActivityRail() {
  const pathname = usePathname();
  const { layout } = useWorkspacePreferences();

  if (layout !== "studio") return null;

  return (
    <nav
      aria-label="Primary modules"
      className="border-border bg-sidebar hidden w-12 shrink-0 flex-col items-center gap-1 border-r py-2 md:flex"
    >
      {RAIL_ITEMS.map((item) => {
        const isActive = isRailActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Tooltip key={item.href} content={item.label} side="right">
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                isActive
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground",
              )}
            >
              {isActive && (
                <span className="bg-foreground absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full" />
              )}
              <Icon className="size-4" aria-hidden="true" />
            </Link>
          </Tooltip>
        );
      })}
      <div className="mt-auto flex flex-col items-center gap-1">
        <Tooltip content="Settings" side="right">
          <Link
            href="/settings"
            aria-current={pathname === "/settings" ? "page" : undefined}
            aria-label="Settings"
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-sidebar-hover flex h-9 w-9 items-center justify-center rounded-md transition-colors",
              pathname === "/settings" && "bg-surface text-foreground",
            )}
          >
            <Settings className="size-4" aria-hidden="true" />
          </Link>
        </Tooltip>
      </div>
    </nav>
  );
}
