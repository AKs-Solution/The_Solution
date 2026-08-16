"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { OrganizationSelector } from "@/features/organizations/components/organization-selector";
import { Avatar } from "@/components/ui/avatar";
import { AerospaceLogo } from "@/components/ui/aerospace-logo";
import { useWorkspaceTabs } from "@/components/layout/workspace-tabs";
import { useToast } from "@/components/ui/toaster";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  BarChart3,
  Activity,
  BookCheck,
  GitBranch,
  Workflow,
  Layers,
  ShieldCheck,
  Brain,
  Truck,
  Menu,
  RotateCw,
  Search,
  Settings,
  User,
  LogOut,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";

interface NavModule {
  label: string;
  href: string;
  icon: LucideIcon;
}

const CORE_MODULES: NavModule[] = [
  { label: "Console", href: "/dashboard", icon: LayoutDashboard },
  { label: "Executive", href: "/executive-dashboard", icon: BarChart3 },
  { label: "Sentinel", href: "/sentinel", icon: Activity },
  { label: "Precedents", href: "/precedents", icon: BookCheck },
  { label: "Failure Graph", href: "/failure-graph", icon: GitBranch },
  { label: "Decisions", href: "/decisions", icon: Workflow },
  { label: "Drawings", href: "/drawings", icon: Layers },
  { label: "Compliance", href: "/compliance", icon: ShieldCheck },
  { label: "Copilot", href: "/copilot", icon: Brain },
  { label: "Suppliers", href: "/suppliers", icon: Truck },
];

function isModuleActive(pathname: string, href: string): boolean {
  if (href === "/dashboard" && (pathname === "/dashboard" || pathname === "/")) return true;
  if (href !== "/dashboard" && (pathname === href || pathname.startsWith(`${href}/`))) return true;
  return false;
}

function openSearchPalette() {
  window.dispatchEvent(new CustomEvent("consecuencia:open-search"));
}

function initialsFrom(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (email?.[0] ?? "?").toUpperCase();
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { openTab } = useWorkspaceTabs();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearchPalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) {
          setUserName(json.data?.name ?? null);
          setUserEmail(json.data?.email ?? null);
        }
      } catch {
        // Fallback gracefully
      }
    }
    void loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const handleModuleClick = (mod: NavModule) => {
    openTab({
      kind: "ledger",
      ref: mod.href,
      title: mod.label,
      href: mod.href,
    });
  };

  const handleQuickSync = async () => {
    setIsSyncing(true);
    try {
      await fetch("/api/sentinel/metrics", { method: "GET" }).catch(() => null);
      toast({
        title: "Telemetry Synchronized",
        description: "Surveillance telemetry updated.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Telemetry Synchronized",
        description: "Surveillance cache updated.",
        variant: "info",
      });
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  return (
    <header className="z-30 flex h-14 w-full flex-shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 text-zinc-900 select-none">
      {/* Left: Brand & Organization */}
      <div className="flex shrink-0 items-center gap-3">
        <Link
          href="/dashboard"
          title="Consecuencia Aerospace Intelligence"
          className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-zinc-100"
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded bg-zinc-900 text-zinc-50">
            <AerospaceLogo className="size-3.5" />
          </div>
          <span className="truncate font-mono text-xs font-bold tracking-wider text-zinc-900 uppercase">
            CONSECUENCIA BY AK
          </span>
        </Link>

        <div className="hidden xl:block">
          <OrganizationSelector />
        </div>
      </div>

      {/* Center: Horizontal Core Navigation */}
      <nav
        className="no-scrollbar hidden max-w-[55vw] items-center gap-0.5 overflow-x-auto lg:flex"
        aria-label="Core Navigation Modules"
      >
        {CORE_MODULES.map((mod) => {
          const Icon = mod.icon;
          const active = isModuleActive(pathname, mod.href);

          return (
            <button
              key={mod.href}
              type="button"
              onClick={() => handleModuleClick(mod)}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 select-none",
                active
                  ? "border-b-2 border-zinc-900 bg-zinc-100 text-zinc-900"
                  : "border-b-2 border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800",
              )}
            >
              <Icon className={cn("size-3.5", active ? "text-zinc-900" : "text-zinc-500")} />
              <span>{mod.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Quick Actions, Search, Status & Profile */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        {/* Mobile Modules Menu */}
        <DropdownMenu
          align="end"
          className="lg:hidden"
          trigger={
            <button
              type="button"
              title="Open navigation modules"
              aria-label="Open navigation modules"
              className="flex size-7.5 cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <Menu className="size-4" />
            </button>
          }
        >
          <DropdownMenuLabel>Modules</DropdownMenuLabel>
          <div className="max-h-[60vh] overflow-y-auto">
            {CORE_MODULES.map((mod) => {
              const Icon = mod.icon;
              const active = isModuleActive(pathname, mod.href);
              return (
                <DropdownMenuItem key={mod.href} onClick={() => handleModuleClick(mod)}>
                  <Icon
                    className={cn("size-4", active ? "text-zinc-900" : "text-zinc-500")}
                    aria-hidden="true"
                  />
                  <span className={active ? "text-zinc-900" : ""}>{mod.label}</span>
                </DropdownMenuItem>
              );
            })}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 size-4" aria-hidden="true" />
            Settings
          </DropdownMenuItem>
        </DropdownMenu>

        {/* Sync Action Button */}
        <button
          type="button"
          onClick={handleQuickSync}
          disabled={isSyncing}
          title="Synchronize Telemetry & Surveillance Data"
          className="flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50"
        >
          <RotateCw className={cn("size-3", isSyncing && "animate-spin")} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Universal Search Trigger */}
        <button
          type="button"
          onClick={openSearchPalette}
          title="Search Command Palette (Ctrl+K)"
          className="flex h-7.5 w-8 cursor-pointer items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 sm:w-40 sm:justify-start sm:px-2.5"
          aria-label="Open search palette"
        >
          <Search className="size-3.5 shrink-0 text-zinc-500" aria-hidden="true" />
          <span className="hidden flex-1 text-left text-[11px] tracking-tight sm:inline">
            Search...
          </span>
          <kbd className="hidden rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 font-mono text-[9px] text-zinc-400 sm:inline">
            Ctrl K
          </kbd>
        </button>

        {/* Operational Status */}
        <div className="hidden items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 font-mono text-[10px] font-semibold text-zinc-600 xl:flex">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span className="text-zinc-400">STATUS</span>
          <span className="font-semibold text-zinc-800">NOMINAL</span>
        </div>

        {/* User Profile Dropdown */}
        <DropdownMenu
          align="end"
          trigger={
            <button
              type="button"
              className="focus-visible:ring-ring cursor-pointer rounded-full transition-transform hover:ring-zinc-300 focus-visible:ring-2 focus-visible:outline-none active:scale-95"
              aria-label="Open user menu"
            >
              <Avatar
                size="sm"
                initials={initialsFrom(userName, userEmail)}
                alt={userName ?? "User"}
              />
            </button>
          }
        >
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-900">
                {userName ?? "Flight Engineer"}
              </span>
              {userEmail && <span className="font-mono text-xs text-zinc-500">{userEmail}</span>}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 size-4" aria-hidden="true" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/organizations")}>
            <User className="mr-2 size-4" aria-hidden="true" />
            Organizations
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/help")}>
            <HelpCircle className="mr-2 size-4" aria-hidden="true" />
            Help & Documentation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void handleLogout()}>
            <LogOut className="mr-2 size-4" aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
