"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  SIDEBAR_NAV,
  isGroup,
  type SidebarNavGroup,
  type SidebarNavItem,
} from "@/shared/constants";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/components/ui/tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GUEST_SIDEBAR_NAV, useGuestMode } from "@/features/auth/components";
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  GitBranch,
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
  ShieldCheck,
  HelpCircle,
  X,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  UploadCloud,
  GitBranch,
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
  ShieldCheck,
  HelpCircle,
};

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard" && pathname === "/dashboard") return true;
  if (href === "/dashboard" && pathname === "/") return true;
  if (href !== "/dashboard" && (pathname === href || pathname.startsWith(`${href}/`))) return true;
  return false;
}

function groupHasActiveChild(pathname: string, items: SidebarNavItem[]): boolean {
  return items.some((item) => isItemActive(pathname, item.href));
}

function NavItem({
  item,
  isActive,
  isCollapsed,
  onNavigate,
}: {
  item: SidebarNavItem;
  isActive: boolean;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = iconMap[item.icon] ?? FileText;

  if (isCollapsed) {
    return (
      <Tooltip content={item.label} side="right" delay={120}>
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "group relative mx-auto flex size-9 items-center justify-center rounded transition-colors select-none",
            isActive
              ? "bg-blue-600 text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <Icon
            className={cn(
              "size-4 shrink-0",
              isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900",
            )}
          />
          {item.badge && (
            <span className="absolute top-1 right-1 size-1.5 rounded-full bg-zinc-400" />
          )}
        </Link>
      </Tooltip>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded px-2.5 py-1.5 text-xs transition-colors select-none",
        isActive
          ? "bg-blue-600 font-medium text-white"
          : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900",
        )}
      />
      <span className="flex-1 truncate tracking-tight">{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            "ml-auto rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold",
            isActive
              ? "border-zinc-300 bg-zinc-50 text-zinc-900"
              : "border-zinc-200 bg-zinc-100 text-zinc-600",
          )}
        >
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
  autoExpandedGroups,
  isCollapsed,
  toggleGroup,
  onNavigate,
}: {
  group: SidebarNavGroup;
  pathname: string;
  expandedGroups: Set<string>;
  autoExpandedGroups?: Set<string>;
  isCollapsed?: boolean;
  toggleGroup: (label: string) => void;
  onNavigate?: () => void;
}) {
  const Icon = iconMap[group.icon] ?? FileText;
  const isExpanded =
    (expandedGroups.has(group.label) || autoExpandedGroups?.has(group.label)) ?? false;
  const hasActiveChild = groupHasActiveChild(pathname, group.items);

  if (isCollapsed) {
    const landing = group.items[0];
    if (!landing) return null;
    return (
      <Tooltip content={group.label} side="right" delay={120}>
        <Link
          href={landing.href}
          onClick={onNavigate}
          aria-label={group.label}
          aria-current={hasActiveChild ? "page" : undefined}
          className={cn(
            "group relative mx-auto flex size-9 items-center justify-center rounded transition-colors select-none",
            hasActiveChild
              ? "bg-blue-600 text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <Icon
            className={cn(
              "size-4 shrink-0",
              hasActiveChild ? "text-white" : "text-slate-500 group-hover:text-slate-900",
            )}
          />
        </Link>
      </Tooltip>
    );
  }

  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={() => toggleGroup(group.label)}
        aria-expanded={isExpanded}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium tracking-tight transition-colors select-none",
          hasActiveChild
            ? "font-semibold text-zinc-900"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
        )}
      >
        <Icon
          className={cn("size-4 shrink-0", hasActiveChild ? "text-zinc-900" : "text-zinc-500")}
        />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 text-zinc-400 transition-transform duration-200",
            isExpanded && "rotate-90 text-zinc-800",
          )}
        />
      </button>
      {isExpanded && (
        <nav
          className="my-0.5 mt-0.5 ml-3.5 flex flex-col gap-0.5 border-l border-zinc-200 pl-2.5"
          aria-label={group.label}
        >
          {group.items.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={isItemActive(pathname, item.href)}
              isCollapsed={false}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

export function Sidebar({
  onNavigate,
  mobileOpen = false,
}: {
  onNavigate?: () => void;
  forceExpanded?: boolean;
  mobileOpen?: boolean;
}) {
  const pathname = usePathname();
  const { isGuest } = useGuestMode();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const keyedNavRef = useRef(false);

  const isCollapsedEffective = mobileOpen ? false : true;

  // Groups with active children are auto-expanded during render
  const autoExpandedLabels = useMemo(
    () =>
      new Set(
        SIDEBAR_NAV.filter(
          (entry) => isGroup(entry) && groupHasActiveChild(pathname, entry.items),
        ).map((entry) => entry.label),
      ),
    [pathname],
  );

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

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onNavigate?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onNavigate]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const focusable = navRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button[aria-expanded]",
    );
    if (!focusable || focusable.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      keyedNavRef.current = true;
      setFocusedIndex((i) => Math.min(i + 1, focusable.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      keyedNavRef.current = true;
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      keyedNavRef.current = true;
      setFocusedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      keyedNavRef.current = true;
      setFocusedIndex(focusable.length - 1);
    }
  }, []);

  useEffect(() => {
    if (!keyedNavRef.current) return;
    const focusable = navRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button[aria-expanded]",
    );
    focusable?.[focusedIndex]?.focus();
  }, [focusedIndex]);

  return (
    <aside
      className={cn(
        "z-50 h-full w-14 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white p-2 text-slate-800 select-none",
        mobileOpen
          ? "fixed inset-y-0 left-0 flex w-72 shadow-xl md:relative md:inset-auto md:w-14 md:shadow-none"
          : "hidden md:flex",
      )}
    >
      <div className="flex h-full min-h-0 w-full flex-col justify-between overflow-y-auto">
        <div className={cn("flex flex-col gap-1", isCollapsedEffective && "items-center")}>
          {/* Top Collapse Button */}
          <div
            className={cn(
              "mb-2 flex items-center justify-between",
              isCollapsedEffective && "justify-center",
            )}
          >
            {!isCollapsedEffective && (
              <span className="px-1 font-mono text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                Navigation
              </span>
            )}
            <div className="flex items-center gap-1">
              {mobileOpen && (
                <button
                  type="button"
                  onClick={onNavigate}
                  title="Close navigation"
                  aria-label="Close navigation"
                  className="flex size-8 cursor-pointer items-center justify-center rounded border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 md:hidden"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div
            ref={navRef}
            onKeyDown={handleKeyDown}
            className={cn("flex flex-col gap-0.5", isCollapsedEffective && "items-center")}
          >
            {isGuest
              ? GUEST_SIDEBAR_NAV.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    isActive={isItemActive(pathname, item.href)}
                    isCollapsed={isCollapsedEffective}
                    onNavigate={onNavigate}
                  />
                ))
              : SIDEBAR_NAV.map((entry) =>
                  isGroup(entry) ? (
                    <NavGroup
                      key={entry.label}
                      group={entry}
                      pathname={pathname}
                      expandedGroups={expandedGroups}
                      autoExpandedGroups={autoExpandedLabels}
                      isCollapsed={isCollapsedEffective}
                      toggleGroup={toggleGroup}
                      onNavigate={onNavigate}
                    />
                  ) : (
                    <NavItem
                      key={entry.href}
                      item={entry}
                      isActive={isItemActive(pathname, entry.href)}
                      isCollapsed={isCollapsedEffective}
                      onNavigate={onNavigate}
                    />
                  ),
                )}
          </div>
        </div>

        {/* Status Footer */}
        <div className="mt-auto flex justify-center py-2">
          <span className="size-1.5 rounded-full bg-emerald-500" title="System ready" />
        </div>
      </div>
    </aside>
  );
}
