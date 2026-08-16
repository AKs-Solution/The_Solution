const PILL: Record<string, string> = {
  RECORDED: "bg-slate-100 text-slate-700 border-slate-200",
  DERIVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INFERRED: "bg-amber-50 text-amber-700 border-amber-200",
  UNKNOWN: "bg-rose-50 text-rose-700 border-rose-200",
  GAP: "bg-rose-50 text-rose-700 border-rose-200",
};

export function StatusPill({ status }: { status?: string | null }) {
  const raw = (status ?? "UNKNOWN").toUpperCase();
  const allowed = ["RECORDED", "DERIVED", "INFERRED", "UNKNOWN"] as const;
  const mapped =
    raw === "READY" || raw === "COMPLETE" || raw === "COMPLETED" || raw === "SUCCESS"
      ? "RECORDED"
      : raw === "PENDING" || raw === "RUNNING" || raw === "PROCESSING"
        ? "INFERRED"
        : raw === "GAP"
          ? "UNKNOWN"
          : allowed.includes(raw as (typeof allowed)[number])
            ? raw
            : "UNKNOWN";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-0.5 font-mono text-xs ${PILL[mapped] ?? PILL.UNKNOWN}`}
    >
      <span
        className={`size-1.5 rounded-full ${
          mapped === "DERIVED"
            ? "bg-emerald-600"
            : mapped === "INFERRED"
              ? "bg-amber-600"
              : mapped === "RECORDED"
                ? "bg-slate-400"
                : "bg-rose-600"
        }`}
        aria-hidden="true"
      />
      {mapped}
    </span>
  );
}
