/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageContainer, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider, Input } from "@/components/ui";

export default function CertificationRiskPage() {
  const [changeType, setChangeType] = useState("Fatigue Allowable Change");
  const [allowableChangePercent, setAllowableChangePercent] = useState(15);
  const [materialChange, setMaterialChange] = useState(false);
  const [loadCaseChange, setLoadCaseChange] = useState(false);
  const [aircraft, setAircraft] = useState("B787");

  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/intelligence/certification-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changeType,
          allowableChangePercent,
          materialChange,
          loadCaseChange,
          aircraft,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setResult(json.data || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer className="bg-white">
      <Stack gap={8}>
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-6 text-indigo-600" />
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                Deterministic FAA Certification Risk Predictor
              </h1>
              <Badge className="border-indigo-500/20 bg-indigo-500/10 text-[9px] text-indigo-600">
                DETERMINISTIC
              </Badge>
            </div>
            <p className="text-sm text-zinc-500">
              Predict whether design modifications require FAA ACO re-review based on precedent
              analysis of structural allowable changes.
            </p>
          </div>
        </div>

        {/* WORKSPACE LAYOUT */}
        <div className="grid grid-cols-1 gap-8 text-left lg:grid-cols-3">
          {/* LEFT FORM */}
          <div className="lg:col-span-1">
            <Card className="border-zinc-200 bg-zinc-100">
              <CardContent className="p-6">
                <form onSubmit={handleAnalyze}>
                  <Stack gap={4}>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                        Change Parameters
                      </span>
                      <h3 className="text-sm font-extrabold text-zinc-900">
                        Input Modification Details
                      </h3>
                    </div>

                    <Divider className="border-zinc-200" />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-500">
                        Change Classification
                      </label>
                      <Input
                        required
                        value={changeType}
                        onChange={(e) => setChangeType(e.target.value)}
                        className="h-10 border-zinc-200 bg-zinc-50 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-500">
                        Allowable Change (% Increase)
                      </label>
                      <Input
                        type="number"
                        required
                        value={allowableChangePercent}
                        onChange={(e) => setAllowableChangePercent(Number(e.target.value))}
                        className="h-10 border-zinc-200 bg-zinc-50 text-sm"
                      />
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="matChange"
                        checked={materialChange}
                        onChange={(e) => setMaterialChange(e.target.checked)}
                        className="size-4 rounded border-zinc-200 bg-zinc-50 accent-indigo-600"
                      />
                      <label htmlFor="matChange" className="text-xs text-zinc-600">
                        Material Grade Swap (e.g. 6061 → 7075)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="loadChange"
                        checked={loadCaseChange}
                        onChange={(e) => setLoadCaseChange(e.target.checked)}
                        className="size-4 rounded border-zinc-200 bg-zinc-50 accent-indigo-600"
                      />
                      <label htmlFor="loadChange" className="text-xs text-zinc-600">
                        Primary Load Path Modified
                      </label>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-500">
                        Aircraft Program
                      </label>
                      <select
                        value={aircraft}
                        onChange={(e) => setAircraft(e.target.value)}
                        className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700"
                      >
                        <option value="B787">Boeing 787-MAX</option>
                        <option value="A350">Airbus A350</option>
                        <option value="B777">Boeing 777X</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-10 w-full bg-indigo-600 text-xs font-semibold tracking-wider text-white uppercase hover:bg-indigo-700"
                    >
                      {isLoading ? "Running Precedent Analysis..." : "Predict Certification Risk"}
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT ANALYSIS OUTPUT */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
              Certification Assessment Result
            </span>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <RefreshCw className="size-6 animate-spin text-zinc-500" />
              </div>
            ) : result ? (
              <Card className="border-zinc-200 bg-zinc-100 p-6">
                <CardContent className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-xl border p-3 ${result.prediction === "REQUIRED" ? "border-rose-500/20 bg-rose-500/10 text-rose-700" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"}`}
                      >
                        {result.prediction === "REQUIRED" ? (
                          <AlertTriangle className="size-6" />
                        ) : (
                          <CheckCircle2 className="size-6" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-zinc-900">
                          Prediction:{" "}
                          {result.prediction === "REQUIRED"
                            ? "FAA ACO RE-REVIEW REQUIRED"
                            : "NO FAA ACO AUDIT REQUIRED"}
                        </h3>
                        <span className="text-xs text-zinc-500">
                          Confidence: {Math.round(result.confidence * 100)}% (
                          {result.historicalPrecedents} precedents)
                        </span>
                      </div>
                    </div>
                    <Badge variant={result.prediction === "REQUIRED" ? "destructive" : "success"}>
                      {result.expectedTimeline}
                    </Badge>
                  </div>

                  <Divider className="border-zinc-200" />

                  <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs">
                    <span className="font-bold text-zinc-500">DISTINGUISHING REASONING:</span>
                    <p className="leading-relaxed font-medium text-zinc-700">
                      {result.primaryReason}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs">
                    <span className="font-bold text-indigo-600">
                      RECOMMENDED ENGINEERING ACTION:
                    </span>
                    <p className="text-zinc-700">{result.recommendedAction}</p>
                  </div>

                  {/* HISTORICAL PRECEDENT DETAILS */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-zinc-600">
                      Matching Historical Precedents:
                    </span>
                    {(result.precedentDetails || []).map((prec: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs"
                      >
                        <span className="font-bold text-zinc-900">{prec.program}</span>
                        <p className="text-zinc-500">
                          Outcome:{" "}
                          <span className="font-semibold text-zinc-700">{prec.faaOutcome}</span> (
                          {prec.duration})
                        </p>
                        <p className="text-zinc-500">Impact: {prec.costImpact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-zinc-200 bg-zinc-100 py-20 text-center">
                <CardContent className="p-6">
                  <ShieldCheck className="mx-auto mb-3 size-8 text-zinc-700" />
                  <p className="text-sm font-semibold text-zinc-500">No calculation run yet</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Configure your structural modification parameters and click &quot;Predict
                    Certification Risk&quot;.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Stack>
    </PageContainer>
  );
}
