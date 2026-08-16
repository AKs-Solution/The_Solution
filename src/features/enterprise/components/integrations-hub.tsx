"use client";

import { useState } from "react";
import { RefreshCw, Cpu, CheckCircle2 } from "lucide-react";
import { IntegrationConnector, SyncJobResult } from "@/server/enterprise/connectors-engine";

interface IntegrationsHubProps {
  connectors: IntegrationConnector[];
  onTriggerSync?: (connectorId: string) => Promise<SyncJobResult>;
}

export function IntegrationsHub({ connectors, onTriggerSync }: IntegrationsHubProps) {
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (connectorId: string) => {
    if (syncingId) return;
    setSyncingId(connectorId);
    try {
      if (onTriggerSync) {
        await onTriggerSync(connectorId);
      }
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="w-full space-y-6 rounded-xl border border-slate-200 bg-white p-6 font-sans text-slate-900 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Cpu className="h-5 w-5 text-indigo-400" /> Enterprise Integration Hub (PLM / ERP / QMS
            / ALM)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Bi-directional incremental sync connectors for Siemens Teamcenter, PTC Windchill, SAP
            S/4HANA, Veeva QMS, and IBM DOORS.
          </p>
        </div>
      </div>

      {/* Connectors List */}
      <div className="space-y-4">
        {connectors.map((conn) => (
          <div
            key={conn.id}
            className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-slate-100 p-5 shadow-md transition-all hover:border-slate-200 sm:flex-row sm:items-center"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 font-mono text-xs font-bold text-indigo-400">
                  {conn.type}
                </span>
                <span className="text-xs font-semibold text-slate-700">{conn.provider}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{conn.name}</h3>

              <div className="flex items-center gap-4 pt-1 font-mono text-[11px] text-slate-500">
                <span>Synced: {conn.recordsSynced.toLocaleString()} records</span>
                <span>•</span>
                <span>Last Sync: {new Date(conn.lastSyncAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> CONNECTED
              </span>

              <button
                onClick={() => handleSync(conn.id)}
                disabled={syncingId === conn.id}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-900 transition-all hover:bg-slate-100 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${syncingId === conn.id ? "animate-spin text-indigo-400" : ""}`}
                />
                {syncingId === conn.id ? "Syncing..." : "Sync Now"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
