/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Mic, User, RefreshCw, MessageSquare, Award } from "lucide-react";
import { PageContainer, Panel, Stack } from "@/components/layout";
import { Button, Badge, Card, CardContent, Divider, Input } from "@/components/ui";

export default function TribalPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  // Form State
  const [operatorName, setOperatorName] = useState("");
  const [transcription, setTranscription] = useState("");
  const [cert, setCert] = useState("");
  const [offset, setOffset] = useState("");

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tribal/capture");
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorName || !transcription) return;
    setIsCapturing(true);
    try {
      const res = await fetch("/api/tribal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorName,
          transcription,
          associatedCert: cert,
          gcodeOffset: offset,
        }),
      });
      if (res.ok) {
        setOperatorName("");
        setTranscription("");
        setCert("");
        setOffset("");
        await fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <PageContainer>
      <Stack gap={6}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="font-medium text-zinc-800">Expertise Ledger</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="size-6 text-indigo-600" />
              <h1 className="text-foreground text-2xl font-bold tracking-tight">
                Expertise & Tribal Knowledge Ledger
              </h1>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchLogs} disabled={isLoading}>
              <RefreshCw className="mr-2 size-4" />
              Sync Logs
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Digitize shop-floor machinist observations and tribal overrides. Bind overrides directly
            as human-authored G-code notes and compliance parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LOGS SECTION */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Tribal Override Logs
            </span>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="size-6 animate-spin text-zinc-400" />
              </div>
            ) : logs.length > 0 ? (
              <div className="flex flex-col gap-4">
                {logs.map((l) => (
                  <div
                    key={l.id}
                    className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/10 p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-zinc-100 p-2 text-zinc-600">
                          <User className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-900">{l.operatorName}</span>
                          <span className="text-[9px] text-zinc-400">
                            {new Date(l.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {l.associatedCert && (
                        <Badge variant="secondary" size="sm" className="flex items-center gap-1">
                          <Award className="size-3 text-indigo-500" />
                          <span>{l.associatedCert}</span>
                        </Badge>
                      )}
                    </div>

                    <div className="text-zinc-605 flex items-start gap-2 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-xs italic">
                      <MessageSquare className="mt-0.5 size-4 shrink-0 text-indigo-400" />
                      <span>&ldquo;{l.transcription}&rdquo;</span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
                      <span>Mapped G-Code Adjustment:</span>
                      <span className="rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-600">
                        {l.gcodeOffset}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Panel padding="lg" className="text-muted-foreground text-center text-sm">
                No operator overrides logged.
              </Panel>
            )}
          </div>

          {/* UPLOAD TRIBAL NOTES */}
          <div className="lg:col-span-1">
            <Card className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit}>
                  <Stack gap={4}>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                        Machinist Station
                      </span>
                      <h2 className="text-foreground text-base font-bold">Log Tacit Override</h2>
                    </div>

                    <Divider className="border-zinc-200" />

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-zinc-500">
                        Operator Name & Title
                      </label>
                      <Input
                        required
                        value={operatorName}
                        onChange={(e) => setOperatorName(e.target.value)}
                        placeholder="e.g., Marcus Vance (CNC Operator)"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-zinc-500">
                        Tacit Note Transcription
                      </label>
                      <textarea
                        required
                        value={transcription}
                        onChange={(e) => setTranscription(e.target.value)}
                        className="bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-20 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Explain override reason (e.g., 'Reduced cut depth because material was too hard')..."
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-zinc-500">
                        AS9100 Cert Identifier (Optional)
                      </label>
                      <Input
                        value={cert}
                        onChange={(e) => setCert(e.target.value)}
                        placeholder="e.g., AS9100-Milling-1042"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-zinc-500">
                        G-Code Command Offset (Optional)
                      </label>
                      <Input
                        value={offset}
                        onChange={(e) => setOffset(e.target.value)}
                        placeholder="e.g., G01 F3500 -> G01 F3000"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isCapturing}
                      className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      {isCapturing ? "Logging note..." : "Log Verbatim Note"}
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Stack>
    </PageContainer>
  );
}
