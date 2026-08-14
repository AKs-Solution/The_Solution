/* eslint-disable react-hooks/set-state-in-effect */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  ExternalLink,
  Network,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { PageContainer, Stack, useWorkspaceTabs, useScopedTabState } from "@/components/layout";
import { Badge, Button, Card, CardContent, DataTable, Input, Select } from "@/components/ui";
import { cn } from "@/shared/utils";

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function FailureGraph({
  precedents,
  onSelect,
}: {
  precedents: any[];
  onSelect: (precedent: any) => void;
}) {
  const W = 960;
  const H = 380;

  const systems = useMemo(() => {
    const set = new Set<string>();
    for (const p of precedents) for (const s of p.applicableSystems ?? []) set.add(s);
    return Array.from(set).slice(0, 8);
  }, [precedents]);

  const layout = useMemo(() => {
    const sysNodes = systems.map((s, i) => ({
      id: `sys:${s}`,
      label: s,
      x: (W * (i + 1)) / (systems.length + 1),
      y: 52,
      type: "system",
    }));
    const preNodes = precedents.slice(0, 10).map((p, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      return {
        id: `pre:${p.id}`,
        label: p.title ?? p.description ?? p.id,
        x: (W * (col + 1)) / 6,
        y: 168 + row * 104,
        type: "precedent",
        precedent: p,
      };
    });
    const edges: Array<{ from: string; to: string }> = [];
    for (const p of precedents.slice(0, 10)) {
      for (const s of p.applicableSystems ?? []) {
        if (sysNodes.some((n) => n.label === s))
          edges.push({ from: `pre:${p.id}`, to: `sys:${s}` });
      }
    }
    return { sysNodes, preNodes, edges };
  }, [systems, precedents]);

  const byId = useMemo(() => {
    const map = new Map<string, any>();
    [...layout.sysNodes, ...layout.preNodes].forEach((n) => map.set(n.id, n));
    return map;
  }, [layout]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Industry failure graph"
    >
      {layout.edges.map((e, i) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (!a || !b) return null;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
          />
        );
      })}
      {layout.sysNodes.map((n) => (
        <g key={n.id}>
          <rect
            x={n.x - 58}
            y={n.y - 15}
            width={116}
            height={30}
            rx={6}
            className="fill-indigo-500/10 stroke-indigo-500/40"
          />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fontSize="10"
            fontFamily="monospace"
            className="fill-indigo-600"
          >
            {truncate(n.label, 20)}
          </text>
        </g>
      ))}
      {layout.preNodes.map((n) => (
        <g key={n.id} className="cursor-pointer" onClick={() => onSelect(n.precedent)}>
          <circle cx={n.x} cy={n.y} r={17} className="fill-rose-500/10 stroke-rose-500/50" />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            fontSize="10"
            fontFamily="monospace"
            className="fill-rose-500"
          >
            ✕
          </text>
          <text
            x={n.x}
            y={n.y + 34}
            textAnchor="middle"
            fontSize="9"
            fontFamily="monospace"
            className="fill-foreground"
          >
            {truncate(n.label, 24)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function FailureGraphWorkspace() {
  const searchParams = useSearchParams();
  const { openTab } = useWorkspaceTabs();

  const urlSearch = searchParams.get("search") ?? "";
  const urlSystem = searchParams.get("system") ?? "ALL";
  const urlConfidence = Number(searchParams.get("confidence") ?? "0.6");

  const [searchQuery, setSearchQuery] = useScopedTabState("search", urlSearch);
  const [selectedSystem, setSelectedSystem] = useScopedTabState("system", urlSystem);
  const [minConfidence, setMinConfidence] = useScopedTabState("confidence", urlConfidence);

  const [systems, setSystems] = useState<string[]>([]);
  const [precedents, setPrecedents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  const loadSystems = useCallback(async () => {
    try {
      const res = await fetch("/api/precedents/systems");
      if (res.ok) {
        const json = await res.json();
        setSystems(json.data ?? []);
      }
    } catch {
      // System facet unavailable — graph continues without it.
    }
  }, []);

  const runQuery = useCallback(async (query: string, system: string, confidence: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", "FAILURE");
      if (query.trim()) params.set("search", query.trim());
      if (system && system !== "ALL") params.set("system", system);
      const res = await fetch(`/api/precedents?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const data = (json.data ?? []).filter(
          (p: any) => (p.confidence ?? p.confidenceScore ?? 0.6) >= confidence,
        );
        setPrecedents(data);
        setSelected(data[0] ?? null);
      }
    } catch {
      // Graph stays empty when the precedent engine is unavailable.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSystems();
    void runQuery(urlSearch, urlSystem, urlConfidence);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slug = useMemo(
    () =>
      slugify(
        [searchQuery, selectedSystem !== "ALL" ? selectedSystem : ""].filter(Boolean).join(" "),
      ) || "query",
    [searchQuery, selectedSystem],
  );

  const buildHref = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedSystem !== "ALL") params.set("system", selectedSystem);
    if (minConfidence !== 0.6) params.set("confidence", String(minConfidence));
    const qs = params.toString();
    return qs ? `/failure-graph?${qs}` : "/failure-graph";
  };

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    void runQuery(searchQuery, selectedSystem, minConfidence);
  };

  const handleOpenInTab = () => {
    const href = buildHref();
    openTab({
      kind: "failure-graph",
      ref: `q-${slug}`,
      title: `Failure Graph · ${truncate(slug.replace(/-/g, " "), 28)}`,
      subtitle: `${precedents.length} precedents`,
      href,
    });
  };

  const columns = [
    {
      key: "title",
      header: "Failure Precedent",
      accessor: (p: any) => (
        <span className="text-foreground text-xs font-semibold">{p.title ?? p.description}</span>
      ),
      sortValue: (p: any) => p.title ?? p.description ?? "",
    },
    {
      key: "systems",
      header: "Systems",
      accessor: (p: any) => (
        <span className="flex flex-wrap gap-1">
          {(p.applicableSystems ?? []).slice(0, 3).map((s: string) => (
            <span
              key={s}
              className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px]"
            >
              {s}
            </span>
          ))}
        </span>
      ),
    },
    {
      key: "confidence",
      header: "Confidence",
      align: "right" as const,
      accessor: (p: any) => (
        <span className="font-mono text-xs font-bold">
          {(p.confidence ?? p.confidenceScore ?? 0.6) * 100}%
        </span>
      ),
      sortValue: (p: any) => p.confidence ?? p.confidenceScore ?? 0.6,
    },
  ];

  return (
    <PageContainer>
      <Stack gap={4}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-500">
                <Network className="size-4.5" />
              </span>
              <h1 className="text-foreground text-2xl font-extrabold tracking-tight md:text-3xl">
                Industry Failure Graph
              </h1>
              <Badge className="hidden border-amber-500/20 bg-amber-500/10 text-[9px] text-amber-600 sm:inline-flex">
                GRAPH
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Query historical engineering failure precedents across systems, run the query as its
              own workspace tab, and inspect failure-mode propagation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleOpenInTab}>
              <ExternalLink className="mr-2 size-3.5" />
              Open query in tab
            </Button>
          </div>
        </div>

        <form onSubmit={handleRun} className="border-border bg-background rounded-lg border p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-5">
              <label className="text-muted-foreground mb-1 block text-[10px] font-semibold tracking-wider uppercase">
                <Search className="mr-1 inline size-3" aria-hidden="true" />
                Search failure modes
              </label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. thermal, fatigue, bore tolerance..."
                className="h-9 text-sm"
              />
            </div>
            <div className="md:col-span-4">
              <label className="text-muted-foreground mb-1 block text-[10px] font-semibold tracking-wider uppercase">
                System
              </label>
              <Select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
                options={[
                  { value: "ALL", label: "All systems" },
                  ...systems.map((s) => ({ value: s, label: s })),
                ]}
                className="h-9 text-sm"
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-muted-foreground mb-1 block text-[10px] font-semibold tracking-wider uppercase">
                <SlidersHorizontal className="mr-1 inline size-3" aria-hidden="true" />
                Min confidence · {(minConfidence * 100).toFixed(0)}%
              </label>
              <div className="flex h-9 items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  className="bg-border h-1.5 w-full cursor-pointer appearance-none rounded-full"
                  aria-label="Minimum confidence"
                />
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-[11px]">
              {isLoading
                ? "Running graph query..."
                : `${precedents.length} failure precedents in scope`}
            </p>
            <Button type="submit" size="sm" disabled={isLoading}>
              <RefreshCw className={cn("mr-2 size-3.5", isLoading && "animate-spin")} />
              Run query
            </Button>
          </div>
        </form>

        <Card>
          <CardContent className="density-p">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Failure-mode propagation
              </span>
              <span className="text-muted-foreground flex items-center gap-2 text-[10px]">
                <span className="size-2 rounded-sm bg-indigo-500" aria-hidden="true" />
                System
                <span className="size-2 rounded-full bg-rose-500" aria-hidden="true" />
                Precedent
              </span>
            </div>
            {isLoading ? (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-16 text-sm">
                <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                Building graph...
              </div>
            ) : precedents.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <Network className="text-muted-foreground/50 size-6" aria-hidden="true" />
                <p className="text-muted-foreground text-xs">
                  No failure precedents match this query.
                </p>
              </div>
            ) : (
              <FailureGraph precedents={precedents} onSelect={setSelected} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="density-p flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Activity className="text-muted-foreground size-4" aria-hidden="true" />
              <span className="text-foreground text-sm font-semibold">Matched precedents</span>
              <Badge variant="outline" className="font-mono">
                {precedents.length}
              </Badge>
            </div>
            <DataTable
              data={precedents}
              columns={columns}
              rowKey={(p: any) => p.id}
              initialSort={{ key: "confidence", dir: "desc" }}
              onRowClick={setSelected}
              maxHeight="320px"
            />
          </CardContent>
        </Card>

        {selected && (
          <Card>
            <CardContent className="density-p flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-foreground text-sm font-bold">
                  {selected.title ?? selected.description}
                </h3>
                <Badge
                  variant="outline"
                  className="border-rose-500/30 bg-rose-500/10 font-mono text-rose-600"
                >
                  {(selected.confidence ?? selected.confidenceScore ?? 0.6) * 100}% confidence
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {selected.summary ?? selected.description}
              </p>
              {selected.rootCause && (
                <div className="rounded-md border border-rose-500/20 bg-rose-500/5 p-2.5">
                  <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                    Root Cause
                  </span>
                  <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                    {selected.rootCause}
                  </p>
                </div>
              )}
              {selected.correctiveAction && (
                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                  <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                    Corrective Action
                  </span>
                  <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                    {selected.correctiveAction}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </Stack>
    </PageContainer>
  );
}

export default function FailureGraphPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="border-border bg-background text-muted-foreground flex items-center justify-center rounded-lg border py-24 text-sm">
            Preparing failure graph...
          </div>
        </PageContainer>
      }
    >
      <FailureGraphWorkspace />
    </Suspense>
  );
}
