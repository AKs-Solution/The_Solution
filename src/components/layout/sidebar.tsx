"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  SIDEBAR_NAV,
  isGroup,
  type SidebarNavGroup,
  type SidebarNavItem,
} from "@/shared/constants";
import { cn } from "@/shared/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  GitBranch,
  ShieldCheck,
  Tags,
  BookCheck,
  AlertTriangle,
  FlaskConical,
  Truck,
  Brain,
  Search,
  BarChart3,
  Bell,
  Building2,
  Settings,
  Layers,
  Cog,
  ChevronRight,
  Workflow,
  ScanEye,
  ScrollText,
  Activity,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  UploadCloud,
  GitBranch,
  ShieldCheck,
  Tags,
  BookCheck,
  AlertTriangle,
  FlaskConical,
  Truck,
  Brain,
  Search,
  BarChart3,
  Bell,
  Building2,
  Settings,
  Layers,
  Cog,
  Workflow,
  ScanEye,
  ScrollText,
  Activity,
};

function isItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupHasActiveChild(pathname: string, items: SidebarNavItem[]): boolean {
  return items.some((item) => isItemActive(pathname, item.href));
}

function NavItem({
  item,
  isActive,
  onNavigate,
}: {
  item: SidebarNavItem;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const Icon = iconMap[item.icon];
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-sidebar-active text-foreground font-medium"
          : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground",
      )}
    >
      {Icon && <Icon className="size-4 shrink-0" />}
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className="bg-foreground/10 ml-auto rounded-full px-2 py-0.5 text-xs">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function NavGroup({
  group,
  pathname,
  expandedGroups,
  toggleGroup,
  onNavigate,
}: {
  group: SidebarNavGroup;
  pathname: string;
  expandedGroups: Set<string>;
  toggleGroup: (label: string) => void;
  onNavigate?: () => void;
}) {
  const Icon = iconMap[group.icon];
  const isExpanded = expandedGroups.has(group.label);
  const hasActiveChild = groupHasActiveChild(pathname, group.items);

  return (
    <div>
      <button
        onClick={() => toggleGroup(group.label)}
        aria-expanded={isExpanded}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          hasActiveChild
            ? "text-foreground font-medium"
            : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground",
        )}
      >
        {Icon && <Icon className="size-4 shrink-0" />}
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronRight
          className={cn("size-4 shrink-0 transition-transform", isExpanded && "rotate-90")}
        />
      </button>
      {isExpanded && (
        <nav className="mt-0.5 flex flex-col gap-0.5 pl-4" aria-label={group.label}>
          {group.items.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={isItemActive(pathname, item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  // Auto-expand groups with active children on mount and path change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      for (const entry of SIDEBAR_NAV) {
        if (isGroup(entry) && groupHasActiveChild(pathname, entry.items)) {
          next.add(entry.label);
        }
      }
      return next;
    });
  }, [pathname]);

  const toggleGroup = useCallback((label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }, []);

  // Keyboard navigation: Arrow Up/Down to move focus, Enter/Space to activate
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const focusable = navRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button[aria-expanded]",
    );
    if (!focusable || focusable.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, focusable.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusedIndex(focusable.length - 1);
    }
  }, []);

  // Apply focus when focusedIndex changes
  useEffect(() => {
    const focusable = navRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button[aria-expanded]",
    );
    focusable?.[focusedIndex]?.focus();
  }, [focusedIndex]);

  return (
    <aside className="border-border bg-sidebar hidden w-64 shrink-0 border-r lg:block">
      <div className="flex h-full flex-col gap-1 overflow-y-auto p-4">
        <Link
          href="/"
          className="text-foreground mb-4 flex items-center gap-2 px-2 text-sm font-semibold"
        >
          <span className="bg-foreground size-6 rounded" />
          Morningstar
        </Link>
        <div ref={navRef} onKeyDown={handleKeyDown} className="flex flex-col gap-1">
          {SIDEBAR_NAV.map((entry) =>
            isGroup(entry) ? (
              <NavGroup
                key={entry.label}
                group={entry}
                pathname={pathname}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
                onNavigate={onNavigate}
              />
            ) : (
              <NavItem
                key={entry.href}
                item={entry}
                isActive={isItemActive(pathname, entry.href)}
                onNavigate={onNavigate}
              />
            ),
          )}
        </div>
      </div>
    </aside>
  );
}
