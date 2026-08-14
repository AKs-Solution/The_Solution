/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Award, RefreshCw, Layers, ShieldCheck, FileCheck2 } from "lucide-react";
import { PageContainer, Panel, Stack, SubTabInspector } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider } from "@/components/ui";

export default function CompliancePage() {
  const [entities, setEntities] = useState<any[]>([]);
  const [proofs, setProofs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [complianceCheck, setComplianceCheck] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCertifying, setIsCertifying] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const entRes = await fetch("/api/engineering/entities?pageSize=10");
      const proofRes = await fetch("/api/compliance/certify");
      if (entRes.ok && proofRes.ok) {
        const entJson = await entRes.json();
        const proofJson = await proofRes.json();
        setEntities(entJson.data || []);
        setProofs(proofJson.data || []);
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

  const handleVerify = async (entity: any) => {
    setSelectedEntity(entity);
    setIsVerifying(true);
    setComplianceCheck(null);
    try {
      const res = await fetch(`/api/compliance/certify?componentId=${entity.id}`);
      if (res.ok) {
        const json = await res.json();
        setComplianceCheck(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleIssueProof = async () => {
    if (!selectedEntity) return;
    setIsCertifying(true);
    try {
      const res = await fetch("/api/compliance/certify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ componentId: selectedEntity.id }),
      });
      if (res.ok) {
        await fetchData();
        setSelectedEntity(null);
        setComplianceCheck(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCertifying(false);
    }
  };

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="font-medium text-zinc-800">Compliance</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-emerald-600" />
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                Autonomous Certification Ledger
              </h1>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className="mr-2 size-4" />
              Sync Ledger
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Verify the digital thread of aircraft components and issue immutable airworthiness
            attestations linked to physical metrology assets.
          </p>
        </div>

        <SubTabInspector activeTab="evidence" className="rounded-xl border border-zinc-800" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* COMPONENT LEDGER VIEW */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Component Registry (Digital Thread Status)
            </span>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="size-6 animate-spin text-zinc-400" />
              </div>
            ) : entities.length > 0 ? (
              <div className="flex flex-col gap-3">
                {entities.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => handleVerify(e)}
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all ${
                      selectedEntity?.id === e.id
                        ? "border-emerald-600 bg-emerald-50/10"
                        : "border-zinc-200 bg-zinc-50/10 hover:bg-zinc-100/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-zinc-100 p-2.5 text-zinc-600">
                        <Layers className="size-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-900">{e.name}</span>
                        <span className="text-[10px] text-zinc-500">
                          ID: {e.identifier} · Type: {e.entityType}
                        </span>
                      </div>
                    </div>

                    <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-800">
                      Thread Ready
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Panel padding="lg" className="text-muted-foreground text-center text-sm">
                No components found.
              </Panel>
            )}

            {/* IMMUTABLE COMPLIANCE PROOFS LEDGER */}
            <span className="text-muted-foreground mt-4 text-xs font-medium tracking-wider uppercase">
              Cryptographic Compliance Certificates
            </span>
            {proofs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {proofs.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
                        <FileCheck2 className="size-4" />
                        <span>Airworthiness Certificate Approved</span>
                      </div>
                      <span className="text-[9px] text-zinc-400">
                        {new Date(p.verifiedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="rounded border border-zinc-100 bg-zinc-50 p-2 font-mono text-xs break-all text-zinc-600">
                      Proof: {p.proofToken}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-[10px] text-zinc-500">
                      <div>
                        G-Code Hash:{" "}
                        <span className="font-mono text-zinc-700">
                          {p.gcodeHash.slice(0, 10)}...
                        </span>
                      </div>
                      <div>
                        Metrology Hash:{" "}
                        <span className="font-mono text-zinc-700">
                          {p.metrologyHash.slice(0, 10)}...
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground rounded border border-dashed border-zinc-200 py-6 text-center text-xs">
                No compliance proofs issued on ledger yet.
              </div>
            )}
          </div>

          {/* VERIFICATION DETAIL SIDEBAR */}
          <div className="lg:col-span-1">
            {selectedEntity ? (
              <Card className="sticky top-4 border-zinc-200 shadow-sm">
                <CardContent className="p-6">
                  <Stack gap={4}>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                        Active Attestation Check
                      </span>
                      <h2 className="text-foreground text-base font-bold">{selectedEntity.name}</h2>
                    </div>

                    <Divider className="border-zinc-200" />

                    {isVerifying ? (
                      <div className="flex justify-center py-8">
                        <RefreshCw className="size-6 animate-spin text-zinc-400" />
                      </div>
                    ) : complianceCheck ? (
                      <Stack gap={4}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500">Digital Thread Integrity</span>
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
                            {complianceCheck.status}
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-3">
                          {Object.entries(complianceCheck.checks).map(([key, check]: any) => (
                            <div
                              key={key}
                              className="flex flex-col gap-1 rounded border border-zinc-100 bg-zinc-50 p-3"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-zinc-800 capitalize">
                                  {key.replace(/([A-Z])/g, " $1")}
                                </span>
                                <Badge
                                  variant={check.status === "PASS" ? "success" : "destructive"}
                                  size="sm"
                                >
                                  {check.status}
                                </Badge>
                              </div>
                              <p className="mt-1 text-[10px] leading-normal text-zinc-500">
                                {check.detail}
                              </p>
                            </div>
                          ))}
                        </div>

                        <Button
                          onClick={handleIssueProof}
                          disabled={complianceCheck.status !== "VERIFIED" || isCertifying}
                          className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {isCertifying ? "Registering Proof..." : "Attest & Issue Proof"}
                        </Button>
                      </Stack>
                    ) : (
                      <div className="text-center text-xs text-zinc-500">
                        Failed to pull compliance check.
                      </div>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-4 border-dashed border-zinc-200 bg-zinc-50/10">
                <CardContent className="p-6 py-20 text-center">
                  <Award className="mx-auto mb-3 size-8 text-zinc-400" />
                  <p className="text-sm font-medium text-zinc-500">
                    Select a component from the registry to run an airworthiness attestation scan.
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
