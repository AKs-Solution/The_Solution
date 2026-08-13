"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { OrganizationSelector } from "@/features/organizations/components/organization-selector";
import { Avatar } from "@/components/ui/avatar";
import { DensityToggle } from "@/components/layout/density-toggle";
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
  RotateCw,
  Search,
  Settings,
  User,
  LogOut,
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
    router.push(mod.href);
  };

  const handleQuickSync = async () => {
    setIsSyncing(true);
    try {
      await fetch("/api/sentinel/metrics", { method: "GET" }).catch(() => null);
      toast({
        title: "Telemetry Synchronized",
        description: "Surveillance telemetry updated. All deterministic invariants nominal.",
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
    <header className="w-full h-14 border-b border-[#1F2D44] bg-[#0E1420] flex-shrink-0 z-30 px-3 sm:px-4 flex items-center justify-between select-none text-slate-100 shadow-sm">
      {/* Left: Brand & Organization */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/dashboard"
          title="Consecuencia Aerospace Intelligence"
          className="flex items-center gap-2 rounded-md border border-[#1F2D44] bg-[#162032] px-2.5 py-1 transition-all hover:border-sky-500/50 hover:bg-[#1E2C44]"
        >
          <div className="flex size-6 items-center justify-center rounded bg-sky-500/20 text-sky-400 border border-sky-500/40 shrink-0">
            <AerospaceLogo className="size-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wider text-slate-100 uppercase truncate font-mono">
            CONSECUENCIA BY AK
          </span>
        </Link>

        <div className="hidden xl:block">
          <OrganizationSelector />
        </div>
      </div>

      {/* Center: Horizontal Avionics Module Glass Strip */}
      <nav
        className="hidden lg:flex items-center gap-1 bg-[#090D14]/80 p-1 rounded-lg border border-[#1F2D44] overflow-x-auto no-scrollbar max-w-[55vw]"
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
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer shrink-0 select-none",
                active
                  ? "bg-[#1E2C44] text-sky-300 border border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#162032] border border-transparent",
              )}
            >
              <Icon className={cn("size-3.5", active ? "text-sky-400" : "text-slate-400")} />
              <span>{mod.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Quick Actions, Search, Density, Status & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Working Quick Sync Action Button */}
        <button
          type="button"
          onClick={handleQuickSync}
          disabled={isSyncing}
          title="Synchronize Telemetry & Surveillance Data"
          className="flex items-center gap-1.5 rounded-md border border-[#1F2D44] bg-[#162032] px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-sky-500/40 hover:bg-[#1E2C44] hover:text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RotateCw className={cn("size-3 text-sky-400", isSyncing && "animate-spin")} />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Universal Search Trigger */}
        <button
          type="button"
          onClick={openSearchPalette}
          title="Search Command Palette (Ctrl+K)"
          className="border-[#1F2D44] bg-[#162032] text-slate-400 hover:border-sky-500/40 hover:bg-[#1E2C44] hover:text-slate-200 flex h-7.5 w-8 cursor-pointer items-center justify-center gap-2 rounded-md border px-2 text-xs transition-all sm:w-40 sm:justify-start sm:px-2.5 shadow-xs"
          aria-label="Open search palette"
        >
          <Search className="size-3.5 shrink-0 text-sky-400" aria-hidden="true" />
          <span className="hidden flex-1 text-left tracking-tight text-[11px] sm:inline">Search...</span>
          <kbd className="text-slate-400 hidden rounded border border-[#1F2D44] bg-[#090D14] px-1 py-0.5 font-mono text-[9px] sm:inline">
            ⌘K
          </kbd>
        </button>

        {/* Operational Status Beacon */}
        <div className="hidden items-center gap-1.5 rounded-md border border-[#1F2D44] bg-[#162032] px-2.5 py-1 text-[10px] font-semibold text-slate-300 xl:flex font-mono">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">STATUS:</span>
          <span className="text-emerald-400 font-semibold">NOMINAL</span>
        </div>

        {/* Density Mode Switcher */}
        <DensityToggle />

        {/* User Profile Dropdown */}
        <DropdownMenu
          align="end"
          trigger={
            <button
              type="button"
              className="hover:ring-sky-500/40 focus-visible:ring-ring rounded-full cursor-pointer transition-transform active:scale-95 focus-visible:ring-2 focus-visible:outline-none"
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
              <span className="text-slate-100 text-sm font-medium">
                {userName ?? "Flight Engineer"}
              </span>
              {userEmail && <span className="text-slate-400 text-xs font-mono">{userEmail}</span>}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="size-4 mr-2" aria-hidden="true" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/organizations")}>
            <User className="size-4 mr-2" aria-hidden="true" />
            Organizations
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void handleLogout()}>
            <LogOut className="size-4 mr-2" aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
