"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Org {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export function OrganizationSelector() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/organizations");
        if (res.ok) {
          const { data, activeOrganizationId } = await res.json();
          if (!cancelled) {
            setOrgs(Array.isArray(data) ? data : []);
            setActiveOrgId(activeOrganizationId ?? null);
          }
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSwitch(orgId: string) {
    try {
      const res = await fetch(`/api/organizations/${orgId}/switch`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently fail
    }
  }

  async function handleCreate() {
    const name = prompt("Organization name:");
    if (!name || !name.trim()) return;

    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setOrgs((prev) => [
          ...prev,
          { id: data.id, name: data.name, slug: data.slug, role: data.role },
        ]);
        router.refresh();
      }
    } catch {
      // silently fail
    }
  }

  if (isLoading) {
    return (
      <div className="border-border bg-background text-muted-foreground flex h-8 w-44 items-center rounded-md border px-3 text-xs">
        Loading...
      </div>
    );
  }

  if (orgs.length === 0) {
    return (
      <button
        onClick={handleCreate}
        className="border-border text-muted-foreground hover:text-foreground flex h-8 items-center gap-1.5 rounded-md border border-dashed px-3 text-xs"
      >
        <Plus className="size-3.5" />
        Create org
      </button>
    );
  }

  const activeOrg = orgs.find((org) => org.id === activeOrgId) ?? orgs[0];

  return (
    <DropdownMenu
      trigger={
        <button className="border-border bg-background text-foreground hover:bg-surface-hover flex h-8 max-w-48 items-center gap-2 rounded-md border px-3 text-xs font-medium">
          <Building2 className="text-muted-foreground size-3.5 shrink-0" />
          <span className="truncate">{activeOrg.name}</span>
          <ChevronDown className="text-muted-foreground size-3 shrink-0" />
        </button>
      }
    >
      {orgs.map((org) => (
        <DropdownMenuItem key={org.id} onClick={() => handleSwitch(org.id)}>
          <Building2 className="text-muted-foreground size-3.5" />
          <span className="truncate">{org.name}</span>
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleCreate}>
        <Plus className="size-3.5" />
        Create organization
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
