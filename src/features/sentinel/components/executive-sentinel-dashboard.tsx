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
    <div className="w-full space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-6 font-sans text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <Activity className="h-6 w-6 text-indigo-400" /> Decision Sentinel & Innovation
            Executive Dashboard
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Continuous real-time surveillance of active engineering hypotheses, expectation
            deviations, and precedent alerts.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">
              Innovation Velocity Index
            </div>
            <div className="flex items-center gap-1 text-xl font-black text-emerald-400">
              <TrendingUp className="h-4 w-4" /> {data.innovationVelocityIndex} / 100
            </div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">
              Program Maturity
            </div>
            <div className="text-xl font-black text-indigo-400">{data.programMaturityScore}%</div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="text-xs font-medium text-slate-400">Monitored Decisions</div>
          <div className="flex items-center gap-2 text-2xl font-bold text-white">
            <CheckCircle2 className="h-5 w-5 text-blue-400" /> {data.activeDecisionsCount}
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="text-xs font-medium text-slate-400">Expectation Deviations</div>
          <div className="flex items-center gap-2 text-2xl font-bold text-amber-400">
            <AlertOctagon className="h-5 w-5" /> {data.deviatedDecisionsCount}
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="text-xs font-medium text-slate-400">Aging Assumptions</div>
          <div className="flex items-center gap-2 text-2xl font-bold text-indigo-400">
            <Zap className="h-5 w-5" /> {data.agingAssumptionsCount}
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
          <div className="text-xs font-medium text-slate-400">Technical Debt Hotspots</div>
          <div className="flex items-center gap-2 text-2xl font-bold text-rose-400">
            <ShieldAlert className="h-5 w-5" /> {data.technicalDebtHotspotsCount}
          </div>
        </div>
      </div>

      {/* Realtime Alert Stream */}
      <div className="space-y-4 pt-2">
        <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase">
          <ShieldAlert className="h-4 w-4 text-rose-400" /> Sentinel Real-Time Alert Stream
        </h3>

        <div className="space-y-3">
          {data.realtimeAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => onSelectAlert?.(alert.id)}
              className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-800/50 p-4 shadow-md transition-all hover:border-slate-700 hover:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 font-mono text-xs font-bold text-rose-400">
                      {alert.type.replace("_", " ")}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <h4 className="flex items-center gap-2 text-sm font-semibold text-white transition-colors group-hover:text-indigo-300">
                    {alert.title}
                    <ChevronRight className="h-4 w-4 text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </h4>

                  <p className="text-xs text-slate-300">{alert.reason}</p>

                  {alert.evidenceHashes.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-[11px] text-slate-400">
                        <Hash className="h-3 w-3 text-emerald-400" />{" "}
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
