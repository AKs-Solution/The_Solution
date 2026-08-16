"use client";

import { useState } from "react";
import { GraphExplorer } from "@/features/knowledge-graph/components/graph-explorer";
import { Button } from "@/components/ui/button";
import { useGuestMode } from "@/features/auth/components";

export default function KnowledgeGraphPage() {
  const { isGuest } = useGuestMode();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/knowledge-graph/sync", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setSyncResult(`Synced ${json.data.nodes} nodes and ${json.data.edges} edges`);
      } else {
        const err = await res.json();
        setSyncResult(err.error ?? "Sync failed");
      }
    } catch {
      setSyncResult("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">Knowledge Graph</h1>
          <p className="text-muted-foreground text-sm">
            {isGuest
              ? "Public NTSB, AD, and SDR relationships. Recorded sources only."
              : "Explore and navigate the engineering knowledge graph"}
          </p>
        </div>
        {!isGuest && (
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync graph indexes"}
          </Button>
        )}
      </div>

      {syncResult && (
        <div className="bg-success/10 text-success rounded-md px-4 py-2 text-sm">{syncResult}</div>
      )}

      <GraphExplorer />
    </div>
  );
}
