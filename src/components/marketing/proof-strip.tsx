const BADGES = [
  { mark: "AS9100 Rev D", label: "Deterministic Design Verification" },
  { mark: "FAA FAR Part 25", label: "Airworthiness Compliance Ready" },
  { mark: "SHA-256", label: "Cryptographic Evidence Chains" },
  { mark: "NTSB Precedent Database", label: "500+ Curated Historical Failure Modes" },
] as const;

const METRICS = [
  "100% Deterministic Rule Execution — Zero Generative Hallucinations",
  "< 30s AS9100 Traceability Matrix Generation",
  "0 Non-Conformances on Audited Sub-Assemblies",
] as const;

export function ProofStrip() {
  return (
    <div className="mx-auto mt-12 max-w-5xl">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BADGES.map((badge) => (
          <div
            key={badge.mark}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-xs"
          >
            <p className="font-mono text-[11px] font-semibold tracking-wide text-blue-700 uppercase">
              {badge.mark}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">{badge.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        {METRICS.map((metric) => (
          <p
            key={metric}
            className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-medium text-slate-700"
          >
            {metric}
          </p>
        ))}
      </div>
    </div>
  );
}
