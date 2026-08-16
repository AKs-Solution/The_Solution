/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Handshake, RefreshCw, ShieldCheck, Building } from "lucide-react";
import { PageContainer, Panel, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider, Input } from "@/components/ui";

export default function SupplierAttestationPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [engineerName, setEngineerName] = useState("");
  const [signingId, setSigningId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/negotiate/enclave");
      if (res.ok) {
        const json = await res.json();
        setSessions(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleAttestCapability = async (id: string) => {
    if (!engineerName) return;
    setSigningId(id);
    try {
      const res = await fetch("/api/negotiate/enclave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id }),
      });
      if (res.ok) {
        setEngineerName("");
        await fetchSessions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSigningId(null);
    }
  };

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="font-medium text-slate-800">Supplier Attestation</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Handshake className="size-6 text-emerald-600" />
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                Supplier Capability Attestations
              </h1>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchSessions} disabled={isLoading}>
              <RefreshCw className="mr-2 size-4" />
              Sync Directory
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Review and manually attest supplier capability claims against past audits. The system
            proposes capabilities, but they require named engineering validation before sourcing
            routing.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Pending Sourcing Link Proposals
            </span>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="size-6 animate-spin text-slate-400" />
              </div>
            ) : sessions.length > 0 ? (
              <div className="flex flex-col gap-4">
                {sessions.map((s) => {
                  const isAttested = s.status === "SETTLED";

                  return (
                    <div
                      key={s.id}
                      className={`flex flex-col gap-3 rounded-xl border p-5 transition-all ${
                        isAttested
                          ? "border-emerald-200 bg-emerald-50/5"
                          : "border-slate-200 bg-slate-50/10"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Building className="size-5 text-indigo-600" />
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-bold text-slate-900">
                              {s.componentId}
                            </span>
                            <span className="text-[10px] text-slate-400">Proposal ID: {s.id}</span>
                          </div>
                        </div>

                        {isAttested ? (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
                            Capability Attested
                          </Badge>
                        ) : (
                          <Badge className="border-slate-200 bg-slate-100 text-slate-800">
                            Proposed Match
                          </Badge>
                        )}
                      </div>

                      <Divider className="border-slate-100" />

                      <div className="grid grid-cols-2 gap-4 text-left text-xs">
                        <div>
                          <span className="mb-0.5 block text-slate-400">OEM Target Cost Limit</span>
                          <span className="font-semibold text-slate-800">
                            ${s.oemTargetCost.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="mb-0.5 block text-slate-400">
                            Supplier Estimated Price
                          </span>
                          <span className="font-semibold text-slate-800">
                            ${s.supplierPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {!isAttested && (
                        <div className="mt-1 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 text-left text-xs">
                          <span className="text-slate-500">
                            Verify this supplier's capability matching based on AS9100 tooling
                            certifications.
                          </span>
                          <div className="flex gap-2">
                            <Input
                              value={engineerName}
                              onChange={(e) => setEngineerName(e.target.value)}
                              placeholder="Your Name (Lead Sourcing Engineer)"
                              className="bg-background h-8 max-w-xs text-xs"
                            />
                            <Button
                              onClick={() => handleAttestCapability(s.id)}
                              disabled={!engineerName || signingId === s.id}
                              className="h-8 bg-indigo-600 py-1 text-xs text-white hover:bg-indigo-700"
                            >
                              {signingId === s.id
                                ? "Attesting..."
                                : "Approve & Attest Supplier Link"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {isAttested && (
                        <div className="mt-1 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-700">
                          <ShieldCheck className="size-4 shrink-0" />
                          <span>
                            Supplier link successfully verified and attested by lead engineer.
                            Sourcing path verified.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <Panel padding="lg" className="text-muted-foreground text-center text-sm">
                No pending supplier links.
              </Panel>
            )}
          </div>

          {/* SOURCING COMPLIANCE */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <Stack gap={4}>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      Sourcing Governance
                    </span>
                    <h2 className="text-foreground text-base font-bold">Policy Guide</h2>
                  </div>

                  <Divider className="border-slate-200" />

                  <div className="rounded border border-slate-200 bg-slate-50 p-3 text-left text-xs">
                    <span className="mb-1 block font-semibold text-slate-800">
                      Manual Provenance Rule:
                    </span>
                    <p className="text-[11px] leading-normal text-slate-500">
                      Sourcing links remain in a non-certified draft state until verified against
                      physical supplier capability logs by a named engineering authority.
                    </p>
                  </div>
                </Stack>
              </CardContent>
            </Card>
          </div>
        </div>
      </Stack>
    </PageContainer>
  );
}
