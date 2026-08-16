"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/layout";
import { Button, Input, StatusPill } from "@/components/ui";
import { GitBranch, Search, ShieldCheck } from "lucide-react";

interface PublicRecord {
  id: string;
  kind: string;
  title: string;
  identifier: string;
  summary: string;
  source: string;
  issuedAt: string;
  href: string;
}

interface SearchHit {
  id: string;
  label: string;
  subtitle: string;
  href: string;
}

interface ReasoningResult {
  explanation: string;
  matches: Array<{
    id: string;
    title: string;
    identifier: string;
    kind: string;
    epistemicStatus: string;
    why: string;
    href: string;
  }>;
}

interface EvidenceLink {
  relationType: string;
  node: { label: string; entityType?: string };
}

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("record");
  const [query, setQuery] = useState("CFM56 fan blade");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [reasoning, setReasoning] = useState<ReasoningResult | null>(null);
  const [chain, setChain] = useState<EvidenceLink[]>([]);
  const [featured, setFeatured] = useState<PublicRecord[]>([]);

  const activeRecord = useMemo(
    () => featured.find((record) => record.id === selectedId) ?? featured[0],
    [featured, selectedId],
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const res = await fetch("/api/search?q=NTSB&limit=20");
      if (!res.ok || cancelled) return;
      const json = await res.json();
      const records: PublicRecord[] = (json.data ?? []).map((hit: SearchHit) => ({
        id: hit.id,
        kind: hit.subtitle?.split(" · ")[0] ?? "RECORD",
        title: hit.label,
        identifier: hit.subtitle?.split(" · ")[1] ?? hit.id,
        summary: hit.subtitle ?? "",
        source: hit.subtitle?.split(" · ")[2] ?? "Public corpus",
        issuedAt: "",
        href: hit.href,
      }));
      if (!cancelled) setFeatured(records);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const [searchRes, reasonRes] = await Promise.all([
        fetch(`/api/search?q=${encodeURIComponent(query)}&limit=12`),
        fetch("/api/reasoning/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        }),
      ]);
      if (cancelled) return;
      if (searchRes.ok) {
        const json = await searchRes.json();
        setHits(json.data ?? []);
      }
      if (reasonRes.ok) {
        const json = await reasonRes.json();
        setReasoning(json.data ?? null);
      }
    }
    if (query.trim().length >= 2) void run();
    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    if (!activeRecord?.id) return;
    let cancelled = false;
    async function run() {
      const res = await fetch(`/api/evidence/chains?entityId=${activeRecord.id}`);
      if (!res.ok || cancelled) return;
      const json = await res.json();
      const first = Array.isArray(json.data) ? json.data[0] : json.data;
      setChain(first?.links ?? []);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [activeRecord?.id]);

  return (
    <PageContainer>
      <PageHeader
        title="Public aerospace explorer"
        subtitle="Deterministic search over public NTSB dockets, airworthiness directives, and service difficulty records. No generative citations."
        action={
          <Button as="a" href="/knowledge-graph" variant="secondary" className="h-9">
            <GitBranch className="mr-1.5 size-3.5" />
            Open graph
          </Button>
        }
      />

      <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4">
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-700">
          <Search className="size-3.5" />
          Deterministic query
        </label>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try CFM56, AD 2018, bird ingestion, MCAS"
        />
        <p className="mt-2 text-xs text-zinc-500">
          Matches recorded identifiers and docket text. Results do not invent sources.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-900">Search results</h2>
          <ul className="mt-3 space-y-2">
            {hits.length === 0 ? (
              <li className="text-sm text-zinc-500">Enter at least two characters.</li>
            ) : (
              hits.map((hit) => (
                <li key={hit.id}>
                  <Link
                    href={hit.href}
                    className="block rounded-md p-2 no-underline hover:bg-zinc-50"
                  >
                    <p className="text-sm font-medium text-zinc-900">{hit.label}</p>
                    <p className="text-xs text-zinc-500">{hit.subtitle}</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-900">Reasoning trace</h2>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            {reasoning?.explanation ?? "Run a query to see how matches are justified."}
          </p>
          <ul className="mt-3 space-y-2">
            {(reasoning?.matches ?? []).map((match) => (
              <li key={match.id} className="rounded-md border border-zinc-100 p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-900">{match.title}</p>
                  <StatusPill status={match.epistemicStatus} />
                </div>
                <p className="mt-1 text-xs text-zinc-500">{match.why}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="size-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Evidence chain</h2>
        </div>
        {activeRecord ? (
          <>
            <p className="text-sm font-medium text-zinc-900">{activeRecord.title}</p>
            <p className="mt-1 text-xs text-zinc-500">{activeRecord.summary}</p>
            {chain.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                No linked public evidence for this record.
              </p>
            ) : (
              <ol className="mt-3 space-y-2">
                {chain.map((link, index) => (
                  <li key={`${link.relationType}-${index}`} className="text-sm text-zinc-700">
                    <span className="font-mono text-[11px] text-zinc-500">{link.relationType}</span>
                    <span className="mx-2 text-zinc-300">→</span>
                    {link.node.label}
                  </li>
                ))}
              </ol>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-500">
            Select a public record to inspect its evidence chain.
          </p>
        )}
      </section>
    </PageContainer>
  );
}
