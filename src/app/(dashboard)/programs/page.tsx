/* eslint-disable react-hooks/set-state-in-effect */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  Layers,
} from "lucide-react";
import { PageContainer, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider } from "@/components/ui";

export default function ProgramHealthDashboard() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/programs");
      if (res.ok) {
        const json = await res.json();
        setPrograms(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return (
    <PageContainer className="bg-white">
      <Stack gap={8}>
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-2">
              <Activity className="size-6 text-rose-500" />
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Program Health & Risk Aggregation
              </h1>
              <Badge className="border-rose-500/20 bg-rose-500/10 text-[9px] text-rose-600">
                LIVE TELEMETRY
              </Badge>
            </div>
            <p className="text-sm text-zinc-500">
              Real-time engineering risk drivers, budget vs actuals, and schedule performance across
              active programs.
            </p>
          </div>

          <Button
            onClick={fetchPrograms}
            variant="secondary"
            size="sm"
            className="border-zinc-200 bg-zinc-100 hover:bg-zinc-100"
          >
            <RefreshCw className="mr-2 size-3.5 animate-spin" /> Refresh Health Metrics
          </Button>
        </div>

        {/* OVERALL HEALTH SUMMARY MATRIX */}
        <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-4">
          <Card className="border-zinc-200 bg-zinc-100">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                Overall Fleet Health
              </span>
              <span className="text-3xl font-extrabold text-emerald-600">78% Nominal</span>
              <span className="mt-1 text-[10px] text-emerald-500">↑ +5% vs previous quarter</span>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 bg-zinc-100">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                Budget Variance
              </span>
              <span className="text-3xl font-extrabold text-zinc-900">97% Budgeted</span>
              <span className="mt-1 text-[10px] text-indigo-600">+$5M favorable variance</span>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 bg-zinc-100">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                Schedule Slip Risk
              </span>
              <span className="text-3xl font-extrabold text-amber-600">1.8 Weeks</span>
              <span className="mt-1 text-[10px] text-amber-500">Material sub on critical path</span>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 bg-zinc-100">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                NCR Quality Rate
              </span>
              <span className="text-3xl font-extrabold text-indigo-600">1.8% Scrap</span>
              <span className="mt-1 text-[10px] text-zinc-500">Ahead of 2.5% target limit</span>
            </CardContent>
          </Card>
        </div>

        {/* PROGRAM MATRIX LIST */}
        <div className="flex flex-col gap-6 text-left">
          <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
            Active Aircraft Programs
          </span>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="size-6 animate-spin text-zinc-500" />
            </div>
          ) : programs.length === 0 ? (
            /* DEFAULT SAMPLE PROGRAM VIEW WHEN DB EMPTY */
            <Card className="border-zinc-200 bg-zinc-100 p-6">
              <CardContent className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-rose-600">
                      <Layers className="size-6" />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-lg font-bold text-zinc-900">Boeing 787-MAX Program</h2>
                      <span className="text-xs text-zinc-500">
                        Aircraft: B787 · Target Schedule: 18 Months
                      </span>
                    </div>
                  </div>
                  <Badge className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-600">
                    73% HEALTHY
                  </Badge>
                </div>

                <Divider className="border-zinc-200" />

                <div className="grid grid-cols-1 gap-6 text-xs md:grid-cols-3">
                  <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <span className="flex items-center gap-1.5 font-bold text-zinc-600">
                      <DollarSign className="size-4 text-emerald-600" /> COST STATUS
                    </span>
                    <p className="text-zinc-500">Budget: $500M | Actual: $487M (97%)</p>
                    <p className="font-semibold text-emerald-600">
                      Trend: Favorable (+$5M vs last month)
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <span className="flex items-center gap-1.5 font-bold text-zinc-600">
                      <Calendar className="size-4 text-amber-600" /> SCHEDULE STATUS
                    </span>
                    <p className="text-zinc-500">Plan: 18 months | Actual: 17.2 months</p>
                    <p className="font-semibold text-amber-600">
                      Critical path: Material sub risk (+2 wks)
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <span className="flex items-center gap-1.5 font-bold text-zinc-600">
                      <CheckCircle2 className="size-4 text-indigo-600" /> QUALITY STATUS
                    </span>
                    <p className="text-zinc-500">NCRs: 23 (Target: 30) | Scrap: 1.8%</p>
                    <p className="font-semibold text-indigo-600">
                      Bore tolerance: 3 NCRs (all reworked)
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-rose-600">
                    <AlertTriangle className="size-4" /> PREDICTIVE RISK ALERTS
                  </span>
                  <ul className="flex list-inside list-disc flex-col gap-1 text-zinc-600">
                    <li>
                      Material substitution on fuselage will likely delay schedule by 1-2 weeks
                      (Historical precedent: 5 changes, avg 1.3w delay).
                    </li>
                    <li>
                      TechMach capacity at 95% — quality historical data shows defect rates increase
                      above 90% utilization.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            programs.map((p) => (
              <Card key={p.id} className="border-zinc-200 bg-zinc-100 p-6">
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-zinc-900">{p.name}</h3>
                    <Badge variant="secondary">{p.aircraft}</Badge>
                  </div>
                  <p className="text-xs text-zinc-500">Health Score: {p.healthScore}%</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Stack>
    </PageContainer>
  );
}
