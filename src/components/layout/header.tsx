"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { OrganizationSelector } from "@/features/organizations/components/organization-selector";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogOut, Search, Settings, User } from "lucide-react";
import { DensitySwitcher, ViewSwitcher } from "@/components/layout/workspace-controls";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  documents: "Documents",
  ingestion: "Ingestion",
  "knowledge-graph": "Knowledge Graph",
  evidence: "Evidence",
  entities: "Entities",
  rules: "Rules",
  contradictions: "Contradictions",
  simulation: "Simulation",
  suppliers: "Suppliers",
  ai: "AI Workspace",
  search: "Search",
  reports: "Reports",
  notifications: "Notifications",
  organizations: "Organizations",
  settings: "Settings",
  audit: "Audit Log",
  orchestrator: "Orchestrator",
  reality: "Reality Engine",
};

function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ label: "Dashboard" }];

  const items: BreadcrumbItem[] = [{ label: "Dashboard", href: "/dashboard" }];
  let path = "";
  for (const segment of segments) {
    path += `/${segment}`;
    const label = ROUTE_LABELS[segment] ?? segment;
    const isLast = segment === segments[segments.length - 1];
    items.push({ label, ...(isLast ? {} : { href: path }) });
  }
  return items;
}

function openSearchPalette() {
  window.dispatchEvent(new CustomEvent("morningstar:open-search"));
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
  const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname]);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
        // Avatar remains a neutral fallback when profile load fails.
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

  return (
    <header className="border-border bg-background sticky top-0 z-30 flex h-14 flex-col justify-center gap-0 border-b px-4 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <OrganizationSelector />
          <div className="border-border hidden items-center md:flex">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 xl:flex">
            <DensitySwitcher />
            <ViewSwitcher />
          </div>
          <button
            type="button"
            onClick={openSearchPalette}
            className="border-border bg-background text-muted-foreground hover:bg-surface-hover flex h-8 w-10 items-center justify-center gap-2 rounded-md border px-2 text-xs transition-colors sm:w-48 sm:justify-start sm:px-3 lg:w-56"
            aria-label="Open search (Control or Command K)"
          >
            <Search className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden flex-1 text-left sm:inline">Search...</span>
            <kbd className="text-muted-foreground/70 hidden rounded border border-current/20 px-1 text-[10px] sm:inline">
              ⌘K
            </kbd>
          </button>
          <DropdownMenu
            align="end"
            trigger={
              <button
                type="button"
                className="hover:ring-border focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none"
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
                <span className="text-foreground text-sm font-medium">
                  {userName ?? "Signed in"}
                </span>
                {userEmail && <span className="text-muted-foreground text-xs">{userEmail}</span>}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/organizations")}>
              <User className="size-4" aria-hidden="true" />
              Organizations
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void handleLogout()}>
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
