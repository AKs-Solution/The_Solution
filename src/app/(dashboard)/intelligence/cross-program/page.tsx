/* eslint-disable react-hooks/set-state-in-effect */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, RefreshCw } from "lucide-react";
import { PageContainer, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider } from "@/components/ui";

export default function CrossProgramInsightsPage() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCrossProgram = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/intelligence/cross-program-patterns");
      if (res.ok) {
        const json = await res.json();
        setPatterns(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCrossProgram();
  }, [fetchCrossProgram]);

  return (
    <PageContainer className="bg-white">
      <Stack gap={8}>
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-6 text-emerald-600" />
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Cross-Program Intelligence & Pattern Discovery
              </h1>
              <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[9px] text-emerald-700">
                MACRO REASONING
              </Badge>
            </div>
            <p className="text-sm text-zinc-500">
              Discover non-obvious engineering patterns and systemic risk factors aggregated across
              all organization programs.
            </p>
          </div>

          <Button
            onClick={fetchCrossProgram}
            variant="secondary"
            size="sm"
            className="border-zinc-200 bg-zinc-100 hover:bg-zinc-100"
          >
            <RefreshCw className="mr-2 size-3.5" /> Refresh Pattern Miner
          </Button>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-4">
          <Card className="border-zinc-200 bg-zinc-100">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">
                Programs Analyzed
              </span>
              <span className="text-3xl font-extrabold text-zinc-900">23 Programs</span>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 bg-zinc-100">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">
                Decisions Traced
              </span>
              <span className="text-3xl font-extrabold text-indigo-600">147 Decisions</span>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 bg-zinc-100">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">
                Outcomes Measured
              </span>
              <span className="text-3xl font-extrabold text-emerald-600">450 Outcomes</span>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 bg-zinc-100">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">
                Estimated Cost Savings
              </span>
              <span className="text-3xl font-extrabold text-rose-600">$2.5M - $5M</span>
            </CardContent>
          </Card>
        </div>

        {/* PATTERN FINDINGS LIST */}
        <div className="flex flex-col gap-6 text-left">
          <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
            Systemic Pattern Discoveries
          </span>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="size-6 animate-spin text-zinc-500" />
            </div>
          ) : (
            patterns.map((p, idx) => (
              <Card key={idx} className="border-zinc-200 bg-zinc-100 p-6">
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-700">
                        <TrendingUp className="size-5" />
                      </div>
                      <h3 className="text-base font-bold text-zinc-900">{p.title}</h3>
                    </div>
                    <Badge className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-700">
                      {Math.round(p.confidence * 100)}% CONFIDENCE ({p.observations} Observations)
                    </Badge>
                  </div>

                  <Divider className="border-zinc-200" />

                  <p className="text-xs leading-relaxed text-zinc-600">{p.description}</p>

                  <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs">
                    <span className="font-bold text-zinc-500">Historical Impact:</span>
                    <span className="font-semibold text-amber-600">{p.timeframeOrImpact}</span>
                  </div>

                  <div className="flex flex-col gap-1 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs">
                    <span className="font-bold text-emerald-600">
                      ORGANIZATION POLICY RECOMMENDATION:
                    </span>
                    <p className="font-medium text-zinc-700">{p.recommendation}</p>
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
