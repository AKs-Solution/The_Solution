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
          "group relative flex size-9 items-center justify-center rounded transition-all duration-150 select-none mx-auto mb-1",
          isActive
            ? "bg-slate-200 text-slate-900 border-r-2 border-slate-900 font-semibold"
            : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 border border-transparent",
        )}
      >
        <Icon className={cn("size-4 shrink-0", isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-800")} />
        {item.badge && (
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-slate-700" />
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
        "group relative flex items-center gap-2.5 rounded px-2.5 py-1.5 text-xs transition-all duration-150 select-none",
        isActive
          ? "bg-slate-200/80 text-slate-900 border-r-2 border-slate-900 font-semibold"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors border border-transparent font-medium",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-800",
        )}
      />
      <span className="flex-1 truncate tracking-tight">{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            "ml-auto rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold border",
            isActive
              ? "bg-white text-slate-900 border-slate-300"
              : "bg-slate-100 text-slate-600 border-slate-200",
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
  isCollapsed,
  toggleGroup,
  onNavigate,
}: {
  group: SidebarNavGroup;
  pathname: string;
  expandedGroups: Set<string>;
  isCollapsed?: boolean;
  toggleGroup: (label: string) => void;
  onNavigate?: () => void;
}) {
  const Icon = iconMap[group.icon] ?? FileText;
  const isExpanded = expandedGroups.has(group.label);
  const hasActiveChild = groupHasActiveChild(pathname, group.items);

  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-0.5 my-0.5">
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
          "flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium tracking-tight transition-colors cursor-pointer select-none",
          hasActiveChild
            ? "text-slate-900 font-semibold"
            : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900",
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0",
            hasActiveChild ? "text-slate-900" : "text-slate-500",
          )}
        />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 text-slate-400 transition-transform duration-200",
            isExpanded && "rotate-90 text-slate-800",
          )}
        />
      </button>
      {isExpanded && (
        <nav className="mt-0.5 flex flex-col gap-0.5 pl-2.5 border-l border-slate-200 ml-3.5 my-0.5" aria-label={group.label}>
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

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  // Initialize and persist collapsed state (default: collapsed)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("consecuencia.sidebar.collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore
    }
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

  // Auto-expand groups with active children on mount and path change
  useEffect(() => {
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
        "h-full border-r border-slate-200 bg-slate-100/70 shrink-0 overflow-y-auto hidden lg:flex flex-col justify-between select-none z-10 transition-all duration-200 ease-in-out p-2 text-slate-800",
        isCollapsed ? "w-14" : "w-64",
      )}
    >
      <div className="flex h-full flex-col justify-between overflow-y-auto min-h-0">
        <div>
          {/* Top Collapse Button */}
          <div className="mb-2 flex items-center justify-between">
            <span className={cn("text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 px-1", isCollapsed && "hidden")}>
              Navigation
            </span>
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
              className={cn(
                "flex size-6 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer",
                isCollapsed && "mx-auto size-8",
              )}
            >
              {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
            </button>
          </div>

          {/* Navigation Items */}
          <div ref={navRef} onKeyDown={handleKeyDown} className="flex flex-col gap-0.5">
            {SIDEBAR_NAV.map((entry) =>
              isGroup(entry) ? (
                <NavGroup
                  key={entry.label}
                  group={entry}
                  pathname={pathname}
                  expandedGroups={expandedGroups}
                  isCollapsed={isCollapsed}
                  toggleGroup={toggleGroup}
                  onNavigate={onNavigate}
                />
              ) : (
                <NavItem
                  key={entry.href}
                  item={entry}
                  isActive={isItemActive(pathname, entry.href)}
                  isCollapsed={isCollapsed}
                  onNavigate={onNavigate}
                />
              ),
            )}
          </div>
        </div>

        {/* Telemetry Footer */}
        <div
          className={cn(
            "mt-3 rounded border border-slate-200 bg-white p-2 text-[10px] text-slate-600 font-mono shadow-xs",
            isCollapsed && "p-1.5 text-center",
          )}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-1 font-mono text-[8px]">
              <span className="size-1.5 rounded-full bg-slate-700" />
              <span className="text-[8px] text-slate-800 font-medium">FAR25</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">VERIFICATION:</span>
                <span className="text-slate-800 font-medium flex items-center gap-1">
                  <span className="size-1 rounded-full bg-emerald-600" />
                  DETERMINISTIC
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-slate-500">COMPLIANCE:</span>
                <span className="text-slate-800 font-medium">AS9100 / FAR 25</span>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
