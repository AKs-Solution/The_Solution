/* eslint-disable react-hooks/set-state-in-effect */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Layers, RefreshCw, Search, CheckCircle2, Copy, Star } from "lucide-react";
import { PageContainer, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider, Input } from "@/components/ui";

export default function DesignPatternLibraryPage() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPatterns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/intelligence/design-patterns?partType=${encodeURIComponent(searchQuery)}`,
      );
      if (res.ok) {
        const json = await res.json();
        setPatterns(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  const handleCopyPattern = async (patternId: string) => {
    try {
      const res = await fetch("/api/intelligence/design-patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patternId, targetProjectName: "New Part Assembly" }),
      });
      if (res.ok) {
        setCopiedId(patternId);
        setTimeout(() => setCopiedId(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer className="bg-white">
      <Stack gap={8}>
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-2">
              <Layers className="size-6 text-indigo-600" />
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Design Pattern Library & Reusability
              </h1>
              <Badge className="border-indigo-500/20 bg-indigo-500/10 text-[9px] text-indigo-600">
                PATTERN REUSE
              </Badge>
            </div>
            <p className="text-sm text-zinc-500">
              Discover proven, high-yielding design templates and apply lessons learned from past
              successful programs.
            </p>
          </div>

          <Button
            onClick={fetchPatterns}
            variant="secondary"
            size="sm"
            className="border-zinc-200 bg-zinc-100 hover:bg-zinc-100"
          >
            <RefreshCw className="mr-2 size-3.5" /> Search Patterns
          </Button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative max-w-xl text-left">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search geometry, material (e.g. Wing root bracket, aluminum)..."
            className="h-10 border-zinc-200 bg-zinc-100 pl-9 text-sm"
          />
        </div>

        {/* PATTERNS LIST */}
        <div className="flex flex-col gap-6 text-left">
          <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
            Proven Design Templates
          </span>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="size-6 animate-spin text-zinc-500" />
            </div>
          ) : (
            patterns.map((p) => (
              <Card key={p.id} className="border-zinc-200 bg-zinc-100 p-6">
                <CardContent className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-zinc-900">{p.partType}</h3>
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <Star className="size-3.5 fill-amber-400" />
                          <span className="font-bold">{p.rating} / 5.0</span>
                        </div>
                      </div>
                      <span className="mt-1 text-xs text-zinc-500">
                        Material: <span className="font-semibold text-zinc-700">{p.material}</span>{" "}
                        · Geometry: {p.geometryClass}
                      </span>
                    </div>

                    <Button
                      onClick={() => handleCopyPattern(p.id)}
                      className="h-9 bg-indigo-600 px-4 text-xs font-semibold text-zinc-900 hover:bg-indigo-700"
                    >
                      {copiedId === p.id ? (
                        <span className="flex items-center gap-1.5 text-emerald-300">
                          <CheckCircle2 className="size-4" /> Design Applied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Copy className="size-4" /> Copy Design Template
                        </span>
                      )}
                    </Button>
                  </div>

                  <Divider className="border-zinc-200" />

                  <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-4">
                    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">
                        Span Specs
                      </span>
                      <span className="font-semibold text-zinc-700">{p.spanDimensions}</span>
                    </div>

                    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">
                        Tolerances
                      </span>
                      <span className="font-semibold text-zinc-700">{p.toleranceClass}</span>
                    </div>

                    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">
                        Proven Supplier
                      </span>
                      <span className="font-semibold text-emerald-600">{p.supplierName}</span>
                    </div>

                    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">
                        Yield Rate & Cost
                      </span>
                      <span className="font-semibold text-indigo-600">
                        {p.yieldRate}% Yield (${p.costPerPart}/part)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs">
                    <span className="font-bold text-indigo-600">LESSONS LEARNED FROM HISTORY:</span>
                    <p className="leading-relaxed text-zinc-600">{p.lessonsLearned}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Stack>
    </PageContainer>
  );
}
