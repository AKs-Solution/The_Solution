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
  ChevronLeft,
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
  isCollapsed,
  onNavigate,
}: {
  item: SidebarNavItem;
  isActive: boolean;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = iconMap[item.icon];

  if (isCollapsed) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        title={item.label}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group relative flex size-10 items-center justify-center rounded-xl transition-all duration-150 select-none mx-auto mb-1",
          isActive
            ? "bg-sky-500/15 text-sky-400 border border-sky-500/40 shadow-[0_0_15px_-2px_rgba(14,165,233,0.4)]"
            : "text-muted-foreground/80 hover:bg-surface-hover hover:text-foreground border border-transparent",
        )}
      >
        {isActive && (
          <span className="absolute -left-1 top-2 bottom-2 w-1 rounded-r-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
        )}
        {Icon && (
          <Icon
            className={cn(
              "size-4.5 shrink-0 transition-transform group-hover:scale-110",
              isActive ? "text-sky-400" : "text-muted-foreground group-hover:text-foreground",
            )}
          />
        )}
        {item.badge && (
          <span className="absolute top-1 right-1 size-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
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
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 select-none",
        isActive
          ? "bg-sky-500/10 text-sky-400 border border-sky-500/25 shadow-[inset_0_1px_0_0_rgba(56,189,248,0.2),0_0_15px_-4px_rgba(14,165,233,0.3)] font-semibold"
          : "text-muted-foreground/90 hover:bg-surface-hover hover:text-foreground border border-transparent",
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
      )}
      {Icon && (
        <Icon
          className={cn(
            "size-4 shrink-0 transition-transform group-hover:scale-105",
            isActive ? "text-sky-400" : "text-muted-foreground group-hover:text-foreground",
          )}
        />
      )}
      <span className="flex-1 truncate tracking-tight">{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold border",
            isActive
              ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
              : "bg-surface/80 text-muted-foreground border-border/50",
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
  const Icon = iconMap[group.icon];
  const isExpanded = expandedGroups.has(group.label);
  const hasActiveChild = groupHasActiveChild(pathname, group.items);

  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-1 py-1 border-t border-border/30 first:border-t-0">
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
        onClick={() => toggleGroup(group.label)}
        aria-expanded={isExpanded}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-tight transition-colors cursor-pointer select-none",
          hasActiveChild
            ? "text-foreground font-semibold"
            : "text-muted-foreground/80 hover:bg-surface-hover hover:text-foreground",
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "size-4 shrink-0",
              hasActiveChild ? "text-sky-400" : "text-muted-foreground",
            )}
          />
        )}
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200",
            isExpanded && "rotate-90 text-foreground",
          )}
        />
      </button>
      {isExpanded && (
        <nav className="mt-0.5 flex flex-col gap-0.5 pl-3 border-l border-border/40 ml-4 my-1" aria-label={group.label}>
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  // Initialize and persist collapsed state
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
        "border-border/80 bg-sidebar/95 hidden shrink-0 flex-col border-r backdrop-blur-xl transition-all duration-200 ease-in-out lg:flex select-none z-30 h-screen max-h-screen overflow-hidden",
        isCollapsed ? "w-18" : "w-64",
      )}
    >
      <div className="flex h-full flex-col justify-between overflow-y-auto p-2.5 min-h-0">
        <div>
          {/* Aerospace Brand Header */}
          <div className="mb-3 flex items-center justify-between gap-1">
            <Link
              href="/"
              title="Consecuencia Aerospace Intelligence"
              className={cn(
                "group flex items-center gap-2.5 rounded-xl border border-border/50 bg-surface/50 p-2 transition-all hover:border-sky-500/30 hover:bg-surface/80 hover:shadow-[0_0_15px_-4px_rgba(14,165,233,0.2)]",
                isCollapsed ? "mx-auto justify-center" : "flex-1",
              )}
            >
              <div className="flex size-7.5 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 shadow-[0_0_12px_rgba(14,165,233,0.4)] shrink-0">
                <ShieldCheck className="size-4.5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold tracking-wider text-foreground uppercase truncate">
                    Consecuencia
                  </span>
                  <span className="text-[10px] font-medium tracking-tight text-muted-foreground truncate font-mono">
                    AEROSPACE TRUTH
                  </span>
                </div>
              )}
            </Link>

            {!isCollapsed && (
              <button
                type="button"
                onClick={toggleCollapse}
                title="Collapse sidebar (Ctrl+B)"
                className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-surface/40 text-muted-foreground hover:border-sky-500/40 hover:bg-surface-hover hover:text-sky-400 transition-all cursor-pointer shrink-0"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
          </div>

          {/* Quick Expand Button when collapsed */}
          {isCollapsed && (
            <div className="mb-2 flex justify-center">
              <button
                type="button"
                onClick={toggleCollapse}
                title="Expand sidebar (Ctrl+B)"
                className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-surface/40 text-muted-foreground hover:border-sky-500/40 hover:bg-surface-hover hover:text-sky-400 transition-all cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

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
            "mt-4 rounded-xl border border-border/40 bg-surface/40 p-2.5 text-[11px] text-muted-foreground",
            isCollapsed && "p-2 text-center",
          )}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-1.5 font-mono text-[9px]">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-pulse" />
              <span className="text-[8px] text-sky-400 font-semibold">FAR25</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-muted-foreground/70">VERIFICATION:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  DETERMINISTIC
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-[10px]">
                <span className="text-muted-foreground/70">COMPLIANCE:</span>
                <span className="text-sky-400 font-semibold">AS9100 / FAR 25</span>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}


