"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2, FileText, Hash, Search, Tags } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryError } from "@/components/ui/query-error";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";

export interface WorkspaceSearchResult {
  id: string;
  type: "entity" | "document" | "organization" | "user";
  label: string;
  subtitle: string;
  href: string;
  icon: "Tags" | "FileText" | "Building2" | "Hash";
}

const ICONS = { Tags, FileText, Building2, Hash } as const;
const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "entity", label: "Entities" },
  { value: "document", label: "Documents" },
  { value: "organization", label: "Organizations" },
  { value: "user", label: "Users" },
];

function iconFor(type: WorkspaceSearchResult["icon"]) {
  return ICONS[type] ?? Hash;
}

export function SearchExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const initialType = searchParams.get("type") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [results, setResults] = useState<WorkspaceSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (typeFilter) params.set("type", typeFilter);
    const next = params.toString();
    router.replace(next ? `/search?${next}` : "/search", { scroll: false });
  }, [debouncedQuery, typeFilter, router]);

  const load = useCallback(async () => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        q: debouncedQuery,
        limit: "50",
      });
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/search?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? `Search failed (${res.status})`);
      }
      setResults(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, typeFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const grouped = results.reduce<Record<string, WorkspaceSearchResult[]>>((acc, item) => {
    (acc[item.type] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-9 left-3 size-4"
            aria-hidden="true"
          />
          <Input
            label="Search workspace"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entities, documents, organizations, users..."
            className="pl-9"
            aria-label="Search workspace"
            autoFocus
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={TYPE_OPTIONS}
          />
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        Tip: press <kbd className="rounded border border-current/20 px-1">⌘</kbd>
        <kbd className="ml-0.5 rounded border border-current/20 px-1">K</kbd> anywhere for the
        command palette.
      </p>

      {error && <QueryError message={error} onRetry={() => void load()} />}

      {!error && isLoading && <Skeleton className="h-64 w-full" />}

      {!error && !isLoading && debouncedQuery.length < 2 && (
        <EmptyState
          icon={<Search className="size-10" aria-hidden="true" />}
          title="Search the engineering workspace"
          description="Enter at least 2 characters to find entities, documents, organizations, and people."
          action={
            <Button
              variant="secondary"
              onClick={() => window.dispatchEvent(new CustomEvent("consecuencia:open-search"))}
            >
              Open command palette
            </Button>
          }
        />
      )}

      {!error && !isLoading && debouncedQuery.length >= 2 && results.length === 0 && (
        <EmptyState
          icon={<Search className="size-10" aria-hidden="true" />}
          title="No results"
          description={`Nothing matched “${debouncedQuery}”. Try a different query or type filter.`}
        />
      )}

      {!error && !isLoading && results.length > 0 && (
        <div className="flex flex-col gap-6" role="list" aria-label="Search results">
          {Object.entries(grouped).map(([type, items]) => (
            <section key={type} aria-labelledby={`search-group-${type}`}>
              <div className="mb-2 flex items-center gap-2">
                <h2
                  id={`search-group-${type}`}
                  className="text-foreground text-sm font-semibold tracking-wide uppercase"
                >
                  {type}
                </h2>
                <Badge variant="outline" size="sm">
                  {items.length}
                </Badge>
              </div>
              <ul className="border-border divide-border divide-y rounded-lg border">
                {items.map((result) => {
                  const Icon = iconFor(result.icon);
                  return (
                    <li key={`${result.type}-${result.id}`} role="listitem">
                      <Link
                        href={result.href}
                        className={cn(
                          "hover:bg-surface-hover flex items-center gap-3 px-4 py-3 transition-colors",
                        )}
                      >
                        <Icon
                          className="text-muted-foreground size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground truncate text-sm font-medium">
                            {result.label}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {result.subtitle}
                          </p>
                        </div>
                        <Badge variant="secondary" size="sm">
                          {result.type}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
