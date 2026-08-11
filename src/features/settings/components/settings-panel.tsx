"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {   Building2, KeyRound, LayoutDashboard, LogOut, Moon, RotateCcw, Sun, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/query-error";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DensitySwitcher } from "@/components/layout/workspace-controls";
import { useWorkspacePreferences } from "@/components/layout/workspace-preferences";

interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  status?: string;
}

type ThemePreference = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "morningstar-theme";

function readTheme(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const useDark = theme === "dark" || (theme === "system" && prefersDark);
  root.classList.toggle("dark", useDark);
}

function WorkspaceSettingsCard() {
  const { density, views, activeViewId, applyView, deleteView, resetWorkspace } =
    useWorkspacePreferences();

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutDashboard className="size-4" aria-hidden="true" />
          Workspace layout
        </CardTitle>
        <CardDescription>
          Density, saved views, and widget preferences persist across devices via your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm font-medium">Layout density</span>
          <DensitySwitcher />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-sm font-medium">
            Saved views ({views.length})
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {views.map((view) => (
              <div
                key={view.id}
                className="border-border hover:bg-surface-hover flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => applyView(view.id)}
                  className="text-foreground flex-1 text-left text-sm font-medium"
                >
                  {view.name}
                </button>
                {view.id === activeViewId && (
                  <Badge variant="secondary" size="sm">
                    Active
                  </Badge>
                )}
                {view.id.startsWith("custom-") && (
                  <button
                    type="button"
                    onClick={() => deleteView(view.id)}
                    className="text-muted-foreground hover:text-destructive rounded p-1 transition-colors"
                    aria-label={`Delete view ${view.name}`}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">
              Current density: <span className="text-foreground font-medium">{density}</span>
            </span>
            <Button variant="secondary" size="sm" onClick={() => resetWorkspace()}>
              <RotateCcw className="mr-1.5 size-3.5" aria-hidden="true" />
              Reset workspace defaults
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsPanel() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to load profile");
      }
      setUser(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const current = readTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current);
    applyTheme(current);
    void load();
  }, [load]);

  function updateTheme(next: ThemePreference) {
    setTheme(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (error) {
    return <QueryError message={error} onRetry={() => void load()} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4" aria-hidden="true" />
            Account
          </CardTitle>
          <CardDescription>Your authenticated profile for this session.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input label="Display name" value={user?.name ?? ""} readOnly />
          <Input label="Email" value={user?.email ?? ""} readOnly />
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Status</span>
            <Badge variant="secondary" size="sm">
              {user?.status ?? "active"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/forgot-password">
              <Button variant="secondary">
                <KeyRound className="mr-1.5 size-4" aria-hidden="true" />
                Reset password
              </Button>
            </Link>
            <Button variant="secondary" onClick={() => void handleLogout()} disabled={isLoggingOut}>
              <LogOut className="mr-1.5 size-4" aria-hidden="true" />
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="size-4" aria-hidden="true" />
            Organization &amp; access
          </CardTitle>
          <CardDescription>
            Manage memberships, roles, and organization profile settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            Organization name, members, invitations, and role assignments are managed in the
            Organizations workspace.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/organizations">
              <Button>Open organizations</Button>
            </Link>
            <Link href="/audit">
              <Button variant="secondary">View audit log</Button>
            </Link>
            <Link href="/notifications">
              <Button variant="secondary">Notifications</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {theme === "dark" ? (
              <Moon className="size-4" aria-hidden="true" />
            ) : (
              <Sun className="size-4" aria-hidden="true" />
            )}
            Appearance
          </CardTitle>
          <CardDescription>Theme preference is stored locally on this device.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["light", "dark", "system"] as const).map((option) => (
              <Button
                key={option}
                variant={theme === option ? "primary" : "secondary"}
                onClick={() => updateTheme(option)}
                aria-pressed={theme === option}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => updateTheme(checked ? "dark" : "light")}
              aria-label="Toggle dark mode"
            />
            <span className="text-muted-foreground text-sm">Dark mode</span>
          </div>
        </CardContent>
      </Card>

      <WorkspaceSettingsCard />
    </div>
  );
}
