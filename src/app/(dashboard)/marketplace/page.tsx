/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Coins, BookOpen, ShieldCheck, RefreshCw, EyeOff } from "lucide-react";
import { PageContainer, Panel, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider, Input } from "@/components/ui";

export default function MarketplacePage() {
  const [axioms, setAxioms] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [clearances, setClearances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"marketplace" | "zk-sourcing">("marketplace");

  // Publish Axiom Form state
  const [pubTitle, setPubTitle] = useState("");
  const [pubDesc, setPubDesc] = useState("");
  const [pubType, setPubType] = useState("LPBF_PARAMETER");
  const [isPublishing, setIsPublishing] = useState(false);

  // ZK Export state
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [clearanceType, setClearanceType] = useState("ITAR");
  const [isClearing, setIsClearing] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const axRes = await fetch("/api/marketplace/axioms");
      const entRes = await fetch("/api/engineering/entities?pageSize=10");
      const clRes = await fetch("/api/marketplace/axioms?action=clearance");

      if (axRes.ok && entRes.ok && clRes.ok) {
        const axJson = await axRes.json();
        const entJson = await entRes.json();
        const clJson = await clRes.json();

        setAxioms(axJson.data || []);
        setEntities(entJson.data || []);
        setClearances(clJson.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle || !pubDesc) return;
    setIsPublishing(true);
    try {
      const res = await fetch("/api/marketplace/axioms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          title: pubTitle,
          description: pubDesc,
          axiomType: pubType,
          rulesApplied: { customParam: true },
        }),
      });
      if (res.ok) {
        setPubTitle("");
        setPubDesc("");
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClearance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntityId) return;
    setIsClearing(true);
    try {
      const res = await fetch("/api/marketplace/axioms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clearance",
          componentId: selectedEntityId,
          clearanceType,
        }),
      });
      if (res.ok) {
        await fetchData();
        setSelectedEntityId("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="font-medium text-slate-800">Marketplace & Sourcing</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              IP Marketplace & ZK Export Router
            </h1>
            <div className="flex gap-1 rounded-lg border border-slate-200 p-0.5">
              <Button
                variant={activeTab === "marketplace" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("marketplace")}
              >
                <BookOpen className="mr-2 size-4" />
                IP Marketplace
              </Button>
              <Button
                variant={activeTab === "zk-sourcing" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("zk-sourcing")}
              >
                <EyeOff className="mr-2 size-4" />
                ZK ITAR Sourcing
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Monetize proprietary engineering axioms anonymously, or router exports using
            Zero-Knowledge proofs to redact geometric files for compliance.
          </p>
        </div>

        {activeTab === "marketplace" ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* IP MARKETPLACE MAIN LIST */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Knowledge Axiom Assets (KAA)
              </span>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="size-6 animate-spin text-slate-400" />
                </div>
              ) : axioms.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {axioms.map((a) => (
                    <div
                      key={a.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/10 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col">
                          <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                          <span className="mt-0.5 text-[10px] text-slate-400">
                            Asset ID: {a.id}
                          </span>
                        </div>
                        <Badge variant="secondary" size="sm">
                          {a.axiomType}
                        </Badge>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600">{a.description}</p>

                      <Divider className="border-slate-100" />

                      <div className="flex items-center justify-between text-xs">
                        <div className="text-slate-550 flex items-center gap-1">
                          <Coins className="size-4 text-amber-500" />
                          <span>
                            Earning rate: <span className="font-semibold">$0.15/use</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                            Total Royalties
                          </span>
                          <span className="text-sm font-bold text-indigo-600">
                            ${a.royaltiesEarned.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Panel padding="lg" className="text-muted-foreground text-center text-sm">
                  No knowledge assets listed.
                </Panel>
              )}
            </div>

            {/* PUBLISH AXIOM FORM */}
            <div className="lg:col-span-1">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <form onSubmit={handlePublish}>
                    <Stack gap={4}>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          Publish New KAA
                        </span>
                        <h2 className="text-foreground text-base font-bold">
                          Monetize Design Axiom
                        </h2>
                      </div>

                      <Divider className="border-slate-200" />

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-500">Axiom Title</label>
                        <Input
                          required
                          value={pubTitle}
                          onChange={(e) => setPubTitle(e.target.value)}
                          placeholder="e.g., Titanium Feed Rate Thresholds"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-500">
                          Axiom Description
                        </label>
                        <textarea
                          required
                          value={pubDesc}
                          onChange={(e) => setPubDesc(e.target.value)}
                          className="bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Provide details on mechanical constraints or ratios..."
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-500">Axiom Type</label>
                        <select
                          value={pubType}
                          onChange={(e) => setPubType(e.target.value)}
                          className="bg-background flex h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus-visible:ring-2"
                        >
                          <option value="LPBF_PARAMETER">LPBF Additive Param</option>
                          <option value="CNC_PARAMETER">5-Axis CNC Milling Param</option>
                          <option value="THERMAL_GUIDELINE">Heat Treatment Guidelines</option>
                        </select>
                      </div>

                      <Button
                        type="submit"
                        disabled={isPublishing}
                        className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        {isPublishing ? "Registering Asset..." : "List KAA in Marketplace"}
                      </Button>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* ZK SOURCING PANEL */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Zero-Knowledge Export Clearances
              </span>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="size-6 animate-spin text-slate-400" />
                </div>
              ) : clearances.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {clearances.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/10 p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="size-5 text-emerald-600" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">
                              Export Proof Verified
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Clearance: {c.clearanceType}
                            </span>
                          </div>
                        </div>

                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
                          {c.zkProofStatus}
                        </Badge>
                      </div>

                      <div className="rounded border border-slate-200 bg-slate-100 p-3 font-mono text-xs">
                        <div className="mb-1 text-[10px] font-semibold text-slate-400 uppercase">
                          Redacted Sourcing Geometry Specs (Safe for Export)
                        </div>
                        <pre className="overflow-x-auto leading-normal whitespace-pre-wrap text-slate-800">
                          {JSON.stringify(c.redactedGeoSpecs, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Panel padding="lg" className="text-muted-foreground text-center text-sm">
                  No ZK clearances processed yet.
                </Panel>
              )}
            </div>

            {/* ZK EXPORT DISPATCHER */}
            <div className="lg:col-span-1">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <form onSubmit={handleClearance}>
                    <Stack gap={4}>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          ZK Sourcing Enclave
                        </span>
                        <h2 className="text-foreground text-base font-bold">
                          Process Export Attestation
                        </h2>
                      </div>

                      <Divider className="border-slate-200" />

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-500">
                          Select Component
                        </label>
                        <select
                          required
                          value={selectedEntityId}
                          onChange={(e) => setSelectedEntityId(e.target.value)}
                          className="bg-background flex h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus-visible:ring-2"
                        >
                          <option value="">Choose part...</option>
                          {entities.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.name} ({e.identifier})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-slate-500">
                          Sovereign Clearance Regime
                        </label>
                        <select
                          value={clearanceType}
                          onChange={(e) => setClearanceType(e.target.value)}
                          className="bg-background flex h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus-visible:ring-2"
                        >
                          <option value="ITAR">ITAR (USML Restricted)</option>
                          <option value="EAR99">EAR99 (Dual-Use Commercial)</option>
                          <option value="MIL_SPEC">Military Classification</option>
                        </select>
                      </div>

                      <Button
                        type="submit"
                        disabled={isClearing || !selectedEntityId}
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        {isClearing ? "Generating ZK Proof..." : "Generate ZK Export Envelope"}
                      </Button>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </Stack>
    </PageContainer>
  );
}
