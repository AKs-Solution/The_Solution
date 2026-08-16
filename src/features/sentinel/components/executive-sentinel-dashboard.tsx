"use client";

import {
  Activity,
  AlertOctagon,
  Zap,
  ShieldAlert,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Hash,
} from "lucide-react";
import { ExecutiveDashboardData } from "@/server/sentinel/executive-dashboard-engine";

interface ExecutiveSentinelDashboardProps {
  data: ExecutiveDashboardData;
  onSelectAlert?: (alertId: string) => void;
}

export function ExecutiveSentinelDashboard({
  data,
  onSelectAlert,
}: ExecutiveSentinelDashboardProps) {
  return (
    <div className="w-full space-y-6 rounded-xl border border-slate-200 bg-white p-6 font-sans text-slate-900 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Activity className="h-6 w-6 text-indigo-400" /> Decision Sentinel & Innovation
            Executive Dashboard
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Continuous real-time surveillance of active engineering hypotheses, expectation
            deviations, and precedent alerts.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">
              Innovation Velocity Index
            </div>
            <div className="flex items-center gap-1 text-xl font-black text-emerald-700">
              <TrendingUp className="h-4 w-4" /> {data.innovationVelocityIndex} / 100
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">
              Program Maturity
            </div>
            <div className="text-xl font-black text-indigo-700">{data.programMaturityScore}%</div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-100 p-4">
          <div className="text-xs font-medium text-slate-500">Monitored Decisions</div>
          <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <CheckCircle2 className="h-5 w-5 text-blue-600" /> {data.activeDecisionsCount}
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-100 p-4">
          <div className="text-xs font-medium text-slate-500">Expectation Deviations</div>
          <div className="flex items-center gap-2 text-2xl font-bold text-amber-700">
            <AlertOctagon className="h-5 w-5" /> {data.deviatedDecisionsCount}
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-100 p-4">
          <div className="text-xs font-medium text-slate-500">Aging Assumptions</div>
          <div className="flex items-center gap-2 text-2xl font-bold text-indigo-700">
            <Zap className="h-5 w-5" /> {data.agingAssumptionsCount}
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-100 p-4">
          <div className="text-xs font-medium text-slate-500">Technical Debt Hotspots</div>
          <div className="flex items-center gap-2 text-2xl font-bold text-rose-700">
            <ShieldAlert className="h-5 w-5" /> {data.technicalDebtHotspotsCount}
          </div>
        </div>
      </div>

      {/* Realtime Alert Stream */}
      <div className="space-y-4 pt-2">
        <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
          <ShieldAlert className="h-4 w-4 text-rose-600" /> Sentinel Real-Time Alert Stream
        </h3>

        <div className="space-y-3">
          {data.realtimeAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectAlert?.(alert.id)}
              className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-100 p-4 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-100/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 font-mono text-xs font-bold text-rose-700">
                      {alert.type.replace("_", " ")}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-indigo-700">
                    {alert.title}
                    <ChevronRight className="h-4 w-4 text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  </h4>

                  <p className="text-xs text-slate-700">{alert.reason}</p>

                  {alert.evidenceHashes.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-500">
                        <Hash className="h-3 w-3 text-emerald-600" />{" "}
                        {alert.evidenceHashes[0].slice(0, 16)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
