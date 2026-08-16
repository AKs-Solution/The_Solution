"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { SIDEBAR_NAV, isNavItem, type SidebarNavItem } from "@/shared/constants";
import { cn } from "@/shared/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GUEST_SIDEBAR_NAV, useGuestMode } from "@/features/auth/components";
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Search,
  Settings,
  Layers,
  Workflow,
  Activity,
  ShieldCheck,
  HelpCircle,
  Brain,
  X,
  PanelLeft,
  PanelLeftClose,
  type LucideIcon,
} from "lucide-react";
import { useWorkspacePreferences } from "./workspace-preferences";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  GitBranch,
  Search,
  Settings,
  Layers,
  Workflow,
  Activity,
  ShieldCheck,
  HelpCircle,
  Brain,
};

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
  if (href === "/explore") return pathname === "/explore";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function RailTooltip({
  visible,
  anchor,
  label,
  shortcut,
}: {
  visible: boolean;
  anchor: DOMRect | null;
  label: string;
  shortcut?: string;
}) {
  if (!visible || !anchor || typeof document === "undefined") return null;
  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[80] flex items-center gap-2 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow-lg"
      style={{
        top: anchor.top + anchor.height / 2,
        left: anchor.right + 10,
        transform: "translateY(-50%)",
      }}
    >
      {label}
      {shortcut ? (
        <kbd className="rounded border border-slate-700 bg-slate-800 px-1 font-mono text-[10px] text-slate-300">
          {shortcut}
        </kbd>
      ) : null}
    </div>,
    document.body,
  );
}

function NavItem({
  item,
  isActive,
  collapsed,
  onNavigate,
}: {
  item: SidebarNavItem;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = iconMap[item.icon] ?? FileText;
  const [tooltip, setTooltip] = useState<{ visible: boolean; anchor: DOMRect | null }>({
    visible: false,
    anchor: null,
  });
  const itemRef = useRef<HTMLAnchorElement>(null);

  function showTip() {
    const rect = itemRef.current?.getBoundingClientRect() ?? null;
    setTooltip({ visible: true, anchor: rect });
  }

  function hideTip() {
    setTooltip({ visible: false, anchor: null });
  }

  if (collapsed) {
    return (
      <>
        <Link
          ref={itemRef}
          href={item.href}
          onClick={onNavigate}
          onMouseEnter={showTip}
          onMouseLeave={hideTip}
          onFocus={showTip}
          onBlur={hideTip}
          aria-current={isActive ? "page" : undefined}
          aria-label={item.label}
          className={cn(
            "relative flex size-9 items-center justify-center rounded-lg transition-colors",
            isActive
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          {isActive && (
            <span className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-blue-500" />
          )}
          <Icon className="size-4 shrink-0" />
        </Link>
        <RailTooltip
          visible={tooltip.visible}
          anchor={tooltip.anchor}
          label={item.label}
          shortcut={item.shortcut}
        />
      </>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-slate-900 text-white shadow-xs"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1 truncate tracking-tight">{item.label}</span>
      {item.shortcut ? (
        <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[10px] text-slate-400">
          {item.shortcut}
        </kbd>
      ) : null}
    </Link>
  );
}

function NavCluster({
  items,
  pathname,
  collapsed,
  onNavigate,
}: {
  items: SidebarNavItem[];
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav
      className={cn("flex flex-col", collapsed ? "items-center gap-1" : "gap-0.5")}
      aria-label="Primary"
    >
      {items.map((item) => (
        <NavItem
          key={item.href}
          item={item}
          isActive={isItemActive(pathname, item.href)}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

function CollapseToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [tooltip, setTooltip] = useState<{ visible: boolean; anchor: DOMRect | null }>({
    visible: false,
    anchor: null,
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const label = collapsed ? "Expand navigation" : "Collapse navigation";

  function showTip() {
    const rect = btnRef.current?.getBoundingClientRect() ?? null;
    setTooltip({ visible: true, anchor: rect });
  }

  function hideTip() {
    setTooltip({ visible: false, anchor: null });
  }

  const Icon = collapsed ? PanelLeft : PanelLeftClose;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={onToggle}
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
        onFocus={showTip}
        onBlur={hideTip}
        aria-expanded={!collapsed}
        aria-controls="workspace-sidebar-nav"
        aria-label={label}
        title={label}
        className="flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <Icon className="size-4" />
      </button>
      <RailTooltip visible={tooltip.visible} anchor={tooltip.anchor} label={label} />
    </>
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
  const router = useRouter();
  const { isGuest } = useGuestMode();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useWorkspacePreferences();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const keyedNavRef = useRef(false);

  const collapsed = mobileOpen ? false : sidebarCollapsed;

  const primaryItems: SidebarNavItem[] = useMemo(
    () =>
      isGuest
        ? GUEST_SIDEBAR_NAV.filter((item) => item.href !== "/help").map((item) => ({ ...item }))
        : SIDEBAR_NAV.filter(isNavItem),
    [isGuest],
  );

  const utilityItems: SidebarNavItem[] = useMemo(
    () => [
      ...(!isGuest
        ? [{ label: "Settings", href: "/settings", icon: "Settings", shortcut: "," }]
        : []),
      { label: "Help", href: "/help", icon: "HelpCircle", shortcut: "?" },
    ],
    [isGuest],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const index = Number(e.key) - 1;
      const dest = primaryItems[index];
      if (!dest?.href || Number.isNaN(index)) return;
      e.preventDefault();
      router.push(dest.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [primaryItems, router]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onNavigate?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onNavigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const focusable = navRef.current?.querySelectorAll<HTMLElement>("a[href]");
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
    const focusable = navRef.current?.querySelectorAll<HTMLElement>("a[href]");
    focusable?.[focusedIndex]?.focus();
  }, [focusedIndex]);

  const brand = (
    <div
      className={cn(
        "mb-3 flex shrink-0",
        collapsed ? "flex-col items-center gap-1" : "items-center justify-between gap-2 px-1",
      )}
    >
      {!collapsed && (
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-900">CONSECUENCIA</p>
          <p className="font-mono text-[10px] tracking-wider text-slate-400">WORKSPACE</p>
        </div>
      )}
      <div className="flex items-center gap-1">
        <div className="hidden md:flex">
          <CollapseToggle collapsed={sidebarCollapsed} onToggle={toggleSidebarCollapsed} />
        </div>
        {mobileOpen && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="flex size-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 md:hidden"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <aside
      className={cn(
        "z-50 h-full shrink-0 overflow-visible border-r border-slate-200 bg-white text-slate-800",
        mobileOpen
          ? cn(
              "fixed inset-y-0 left-0 flex w-72 flex-col shadow-xl md:relative md:inset-auto md:shadow-none",
              collapsed ? "md:w-14" : "md:w-60",
            )
          : cn("hidden md:flex md:flex-col", collapsed ? "w-14" : "w-60"),
      )}
    >
      <div
        id="workspace-sidebar-nav"
        ref={navRef}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-full min-h-0 flex-col py-3",
          collapsed ? "items-center px-2" : "px-3",
        )}
      >
        {brand}
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <NavCluster
            items={primaryItems}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        </div>
        <div
          className={cn(
            "mt-2 flex flex-col border-t border-slate-200 pt-2",
            collapsed ? "items-center gap-1" : "gap-0.5",
          )}
        >
          {utilityItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={isItemActive(pathname, item.href)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
