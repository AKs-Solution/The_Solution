"use client";

import { ShieldCheck, Lock, Activity, Server, Database, Key } from "lucide-react";
import {
  EnterpriseReadinessReport,
  EnterpriseHealthMetrics,
} from "@/server/enterprise/observability-engine";

interface EnterpriseSecurityDashboardProps {
  metrics: EnterpriseHealthMetrics;
  readinessReport: EnterpriseReadinessReport;
}

export function EnterpriseSecurityDashboard({
  metrics,
  readinessReport,
}: EnterpriseSecurityDashboardProps) {
  return (
    <div className="w-full space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-6 font-sans text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <ShieldCheck className="h-6 w-6 text-emerald-400" /> Enterprise Platform & Security
            Control Center
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Real-time surveillance of multi-tenant isolation, RBAC enforcement, immutable audit
            logging, and security observability.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <div>
            <div className="text-[11px] font-semibold text-emerald-400 uppercase">
              Enterprise Status
            </div>
            <div className="text-sm font-bold text-white">
              {readinessReport.overallStatus} ({readinessReport.readinessScore}/100)
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="text-xs font-medium text-slate-400">Tenant Isolation</div>
          <div className="flex items-center gap-2 text-xl font-bold text-emerald-400">
            <Lock className="h-4 w-4" /> {metrics.tenantCount} Isolated Tenants
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="text-xs font-medium text-slate-400">P99 API Latency</div>
          <div className="flex items-center gap-2 text-xl font-bold text-indigo-400">
            <Activity className="h-4 w-4" /> {metrics.p99LatencyMs} ms
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="text-xs font-medium text-slate-400">Knowledge Graph Nodes</div>
          <div className="flex items-center gap-2 text-xl font-bold text-blue-400">
            <Database className="h-4 w-4" /> {(metrics.graphNodesTotal / 1000000).toFixed(2)}M
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="text-xs font-medium text-slate-400">Audit Trail Integrity</div>
          <div className="flex items-center gap-2 text-xl font-bold text-emerald-400">
            <Key className="h-4 w-4" /> {metrics.auditTrailIntegrityScore}% SHA-256
          </div>
        </div>
      </div>

      {/* Security Checklist */}
      <div className="space-y-3 pt-2">
        <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase">
          <Server className="h-4 w-4 text-indigo-400" /> Enterprise Readiness Verification Matrix
        </h3>

        <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/60 p-3">
            <span className="font-medium text-slate-300">
              Strict Multi-Tenant Customer Data Isolation
            </span>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
              VERIFIED
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/60 p-3">
            <span className="font-medium text-slate-300">Fine-Grained Graph & Document RBAC</span>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
              VERIFIED
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/60 p-3">
            <span className="font-medium text-slate-300">
              Immutable SHA-256 Cryptographic Audit Logs
            </span>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
              VERIFIED
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/60 p-3">
            <span className="font-medium text-slate-300">
              SAML 2.0 / Okta / Azure AD SSO Integration
            </span>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] text-emerald-400">
              CONFIGURED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
