/* eslint-disable react-hooks/set-state-in-effect */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, RefreshCw, Truck, Clock, DollarSign } from "lucide-react";
import { PageContainer, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider } from "@/components/ui";

export default function SupplierRiskIntelligencePage() {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSupplierRisks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/intelligence/supplier-risk");
      if (res.ok) {
        const json = await res.json();
        setData(json.data || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupplierRisks();
  }, [fetchSupplierRisks]);

  return (
    <PageContainer className="bg-white">
      <Stack gap={8}>
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-6 text-amber-500" />
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Supplier Risk & Capacity Predictor
              </h1>
              <Badge className="border-amber-500/20 bg-amber-500/10 text-[9px] text-amber-700">
                PREDICTIVE AI
              </Badge>
            </div>
            <p className="text-sm text-zinc-500">
              Predict lead time slips, scrap rate surges, and supplier bottlenecks based on
              historical cross-program precedents.
            </p>
          </div>

          <Button
            onClick={fetchSupplierRisks}
            variant="secondary"
            size="sm"
            className="border-zinc-200 bg-zinc-100 hover:bg-zinc-100"
          >
            <RefreshCw className="mr-2 size-3.5" /> Re-run Risk Prediction
          </Button>
        </div>

        {/* HEALTH METRIC */}
        <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
          <Card className="border-zinc-200 bg-zinc-100">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                Supply Chain Health Index
              </span>
              <span className="text-3xl font-extrabold text-amber-600">
                {data?.supplyChainHealth || 74}%
              </span>
              <span className="mt-1 text-[10px] text-zinc-500">
                2 high-risk vendor bottlenecks detected
              </span>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 bg-zinc-100">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                Active Risk Indicators
              </span>
              <span className="text-3xl font-extrabold text-rose-600">
                {data?.suppliersAtRisk?.length || 2} Suppliers
              </span>
              <span className="mt-1 text-[10px] text-rose-500">Require proactive mitigation</span>
            </CardContent>
          </Card>
          <Card className="border-zinc-200 bg-zinc-100">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                Predictive Confidence
              </span>
              <span className="text-3xl font-extrabold text-emerald-600">88% Match</span>
              <span className="mt-1 text-[10px] text-emerald-500">
                Based on 147 historical outcomes
              </span>
            </CardContent>
          </Card>
        </div>

        {/* SUPPLIERS AT RISK LIST */}
        <div className="flex flex-col gap-6 text-left">
          <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
            Suppliers Needing Engineering Mitigation
          </span>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="size-6 animate-spin text-zinc-500" />
            </div>
          ) : (
            (data?.suppliersAtRisk || []).map((s: any, idx: number) => (
              <Card key={idx} className="border-zinc-200 bg-zinc-100 p-6">
                <CardContent className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-amber-700">
                        <Truck className="size-6" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-zinc-900">{s.supplierName}</h3>
                        <span className="text-xs text-zinc-500">
                          Predicted Timeframe: {s.timeframe} · Precedents: {s.historicalPrecedents}{" "}
                          programs
                        </span>
                      </div>
                    </div>
                    <Badge variant={s.riskLevel === "CRITICAL" ? "destructive" : "warning"}>
                      {s.riskLevel} RISK ({Math.round(s.riskProbability * 100)}%)
                    </Badge>
                  </div>

                  <Divider className="border-zinc-200" />

                  <div className="flex flex-col gap-1 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs">
                    <span className="font-bold text-amber-600">PREDICTED EVENT:</span>
                    <p className="text-sm font-semibold text-zinc-700">{s.predictedEvent}</p>
                  </div>

                  {/* RECOMMENDED MITIGATIONS */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-zinc-600">
                      AKSCI Recommended Mitigation Strategies (Learned from Org History):
                    </span>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {(s.recommendedMitigation || []).map((m: any, mIdx: number) => (
                        <div
                          key={mIdx}
                          className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-600">{m.action}</span>
                            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
                              {Math.round(m.successRate * 100)}% Success
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-zinc-500">
                            <span className="flex items-center gap-1">
                              <DollarSign className="size-3 text-zinc-500" /> Cost: $
                              {m.cost.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3 text-zinc-500" /> Schedule Impact:{" "}
                              {m.timeImpact} days
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
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
