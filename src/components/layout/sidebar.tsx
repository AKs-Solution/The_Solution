"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  ChevronLeft,
  Workflow,
  ScanEye,
  ScrollText,
  Activity,
  ShieldCheck,
  HelpCircle,
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
      <Link
        href={item.href}
        onClick={onNavigate}
        title={item.label}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group relative mx-auto flex size-9 items-center justify-center rounded transition-colors select-none",
          isActive
            ? "bg-zinc-900 text-zinc-50"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0",
            isActive ? "text-zinc-50" : "text-zinc-500 group-hover:text-zinc-900",
          )}
        />
        {item.badge && (
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-zinc-400" />
        )}
      </Link>
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
          ? "bg-zinc-900 font-medium text-zinc-50"
          : "font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          isActive ? "text-zinc-50" : "text-zinc-500 group-hover:text-zinc-900",
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
    return (
      <div className="flex flex-col items-center gap-1">
        {group.items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={isItemActive(pathname, item.href)}
            isCollapsed={true}
            onNavigate={onNavigate}
          />
        ))}
      </div>
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
  forceExpanded = false,
}: {
  onNavigate?: () => void;
  forceExpanded?: boolean;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  const isCollapsedEffective = forceExpanded ? false : isCollapsed;

  // Initialize and persist collapsed state (default: collapsed)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const saved = localStorage.getItem("consecuencia.sidebar.collapsed");
        if (saved !== null) {
          setIsCollapsed(saved === "true");
        }
      } catch {
        // Ignore
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("consecuencia.sidebar.collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Listen for global toggle events and keyboard shortcuts
  useEffect(() => {
    const handleToggle = () => toggleCollapse();
    window.addEventListener("consecuencia:toggle-sidebar", handleToggle);

    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDownGlobal);

    return () => {
      window.removeEventListener("consecuencia:toggle-sidebar", handleToggle);
      window.removeEventListener("keydown", handleKeyDownGlobal);
    };
  }, [toggleCollapse]);

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

  // Keyboard navigation
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

  useEffect(() => {
    const focusable = navRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button[aria-expanded]",
    );
    focusable?.[focusedIndex]?.focus();
  }, [focusedIndex]);

  return (
    <aside
      className={cn(
        "z-10 hidden h-full shrink-0 flex-col items-center justify-between overflow-y-auto border-r border-zinc-200 bg-white p-2 text-zinc-800 transition-all duration-200 ease-in-out select-none md:flex",
        isCollapsedEffective ? "w-14" : "w-64",
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
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsedEffective ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
              className={cn(
                "flex size-6 cursor-pointer items-center justify-center rounded border border-zinc-200 bg-white text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-900",
                isCollapsedEffective && "mx-auto size-8",
              )}
            >
              {isCollapsedEffective ? (
                <ChevronRight className="size-3.5" />
              ) : (
                <ChevronLeft className="size-3.5" />
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <div
            ref={navRef}
            onKeyDown={handleKeyDown}
            className={cn("flex flex-col gap-0.5", isCollapsedEffective && "items-center")}
          >
            {SIDEBAR_NAV.map((entry) =>
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
        <div
          className={cn(
            "mt-3 rounded border border-zinc-200 bg-white p-2 font-mono text-[10px] text-zinc-500",
            isCollapsedEffective && "border-0 bg-transparent p-1.5 text-center",
          )}
        >
          {isCollapsedEffective ? (
            <div className="flex flex-col items-center gap-1 font-mono text-[8px]">
              <span className="size-1.5 rounded-full bg-zinc-400" />
              <span className="text-[8px] font-medium text-zinc-700">OK</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">STATUS</span>
                <span className="flex items-center gap-1 font-medium text-zinc-800">
                  <span className="size-1 rounded-full bg-emerald-600" />
                  DETERMINISTIC
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-zinc-400">COMPLIANCE</span>
                <span className="font-medium text-zinc-700">AS9100 / FAR 25</span>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
