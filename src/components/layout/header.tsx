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
import { Menu, Search, Settings, LogOut, HelpCircle } from "lucide-react";
import { useGuestMode } from "@/features/auth/components";
import { NotificationMenu } from "./notification-menu";

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
  const { isGuest, requestUpgrade } = useGuestMode();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [modKey] = useState(() =>
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl",
  );

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
    <header className="z-30 flex h-14 w-full flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 text-slate-900">
      <div className="flex min-w-0 flex-1 shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          title="Open navigation"
          aria-label="Open navigation"
          className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
        >
          <Menu className="size-4" />
        </button>
        <Link
          href={isGuest ? "/explore" : "/dashboard"}
          title="Consecuencia Aerospace Intelligence"
          className="flex items-center gap-2 rounded-md px-1 py-1 no-underline transition-colors hover:bg-slate-100 sm:px-2"
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded bg-slate-900 text-white">
            <AerospaceLogo className="size-3.5" />
          </div>
          <span className="truncate text-xs font-semibold tracking-tight text-slate-900">
            CONSECUENCIA
          </span>
        </Link>
        {!isGuest && (
          <div className="hidden md:block">
            <OrganizationSelector />
          </div>
        )}
        {isGuest && (
          <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide text-slate-600 uppercase sm:inline">
            Guest Mode
          </span>
        )}
      </div>

      <div className="hidden flex-1 justify-center px-4 md:flex">
        <button
          type="button"
          onClick={openSearchPalette}
          className="flex h-9 w-full max-w-md cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Open search"
        >
          <Search className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="flex-1 truncate">Search workspace</span>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
            {modKey === "⌘" ? "⌘K" : "Ctrl+K"}
          </kbd>
        </button>
      </div>

      <div className="flex flex-1 shrink-0 items-center justify-end gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={openSearchPalette}
          title="Search (Ctrl+K)"
          className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-label="Open search"
        >
          <Search className="size-3.5" aria-hidden="true" />
        </button>
        <span className="hidden rounded border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] tracking-wide text-slate-500 uppercase lg:inline-flex">
          STATUS · NOMINAL
        </span>
        <NotificationMenu />
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
                initials={isGuest ? "G" : initialsFrom(userName, userEmail)}
                alt={isGuest ? "Guest" : (userName ?? "User")}
              />
            </button>
          }
        >
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-900">
                {isGuest ? "Guest Mode" : (userName ?? "Engineer")}
              </span>
              {isGuest ? (
                <span className="text-xs text-zinc-500">Public aerospace corpus</span>
              ) : (
                userEmail && <span className="font-mono text-xs text-zinc-500">{userEmail}</span>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!isGuest && (
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 size-4" aria-hidden="true" />
              Settings
            </DropdownMenuItem>
          )}
          {isGuest && <DropdownMenuItem onClick={requestUpgrade}>Create account</DropdownMenuItem>}
          <DropdownMenuItem onClick={() => router.push("/help")}>
            <HelpCircle className="mr-2 size-4" aria-hidden="true" />
            Help
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
