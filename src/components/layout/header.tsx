"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OrganizationSelector } from "@/features/organizations/components/organization-selector";
import { Avatar } from "@/components/ui/avatar";
import { AerospaceLogo } from "@/components/ui/aerospace-logo";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, Search, Settings, User, LogOut, HelpCircle } from "lucide-react";

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

export function Header({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const router = useRouter();
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

  return (
    <header className="z-30 flex h-14 w-full flex-shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 text-zinc-900">
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          title="Open navigation"
          aria-label="Open navigation"
          className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
        >
          <Menu className="size-4" />
        </button>
        <Link
          href="/dashboard"
          title="Consecuencia Aerospace Intelligence"
          className="flex items-center gap-2 rounded-md px-1 py-1 no-underline transition-colors hover:bg-zinc-100 sm:px-2"
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded bg-zinc-900 text-zinc-50">
            <AerospaceLogo className="size-3.5" />
          </div>
          <span className="truncate font-mono text-xs font-bold tracking-wider text-zinc-900 uppercase">
            CONSECUENCIA BY AK
          </span>
        </Link>
        <div className="hidden md:block">
          <OrganizationSelector />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={openSearchPalette}
          title="Search Command Palette (Ctrl+K)"
          className="flex h-8 w-8 cursor-pointer items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 sm:w-44 sm:justify-start sm:px-2.5"
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
              <span className="text-sm font-medium text-zinc-900">{userName ?? "Engineer"}</span>
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
