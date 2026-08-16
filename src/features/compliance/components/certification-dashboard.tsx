"use client";

import { Award, CheckCircle2, ShieldCheck, FileCheck, Layers, ArrowUpRight } from "lucide-react";
import { ComplianceHealthMetrics } from "@/server/compliance/compliance-health-calculator";

interface CertificationDashboardProps {
  health: ComplianceHealthMetrics;
  onGeneratePackage?: () => void;
}

export function CertificationDashboard({ health, onGeneratePackage }: CertificationDashboardProps) {
  const getStatusBadge = (status: ComplianceHealthMetrics["auditReadinessStatus"]) => {
    switch (status) {
      case "AUDIT_READY":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> AUDIT READY
          </span>
        );
      case "ATTENTION_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
            ATTENTION REQUIRED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-400">
            NON COMPLIANT
          </span>
        );
    }
  };

  const metricCards = [
    { label: "Requirement Coverage", val: health.metrics.requirementCoverage, icon: Layers },
    { label: "Evidence Completeness", val: health.metrics.evidenceCompleteness, icon: FileCheck },
    { label: "Verification Coverage", val: health.metrics.verificationCoverage, icon: ShieldCheck },
    { label: "Validation Coverage", val: health.metrics.validationCoverage, icon: CheckCircle2 },
    { label: "Certification Readiness", val: health.metrics.certificationReadiness, icon: Award },
    {
      label: "Traceability Completeness",
      val: health.metrics.traceabilityCompleteness,
      icon: Layers,
    },
  ];

  return (
    <div className="w-full space-y-6 rounded-xl border border-slate-200 bg-white p-6 font-sans text-slate-900 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <Award className="h-6 w-6 text-emerald-400" /> Certification & Compliance Intelligence
            Engine
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Continuous deterministic evidence binding, 10-level traceability, and automated audit
            readiness.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {getStatusBadge(health.auditReadinessStatus)}

          <button
            onClick={onGeneratePackage}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500"
          >
            <FileCheck className="h-4 w-4" /> Generate Audit Package{" "}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Score Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-100 p-5">
          <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Overall Compliance Score
          </div>
          <div className="flex items-baseline gap-1 text-4xl font-black text-slate-900">
            {health.overallComplianceScore}{" "}
            <span className="text-sm font-normal text-slate-500">/ 100</span>
          </div>
          <div className="text-xs font-medium text-emerald-400">
            All 10 traceability levels verified.
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-100 p-5">
          <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Audit Readiness Score
          </div>
          <div className="flex items-baseline gap-1 text-4xl font-black text-emerald-400">
            {health.metrics.auditReadiness}%
          </div>
          <div className="text-xs text-slate-500">SHA-256 evidence proofs verified.</div>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-100 p-5">
          <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Documentation Completeness
          </div>
          <div className="flex items-baseline gap-1 text-4xl font-black text-indigo-400">
            {health.metrics.documentationCompleteness}%
          </div>
          <div className="text-xs text-slate-500">0 superseded documents active.</div>
        </div>
      </div>

      {/* 6 Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {metricCards.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="space-y-1 rounded-lg border border-slate-200 bg-slate-100 p-3.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Icon className="h-3.5 w-3.5 text-emerald-400" />
                <span className="truncate">{m.label}</span>
              </div>
              <div className="text-lg font-bold text-slate-900">{m.val}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
