import { TableSkeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="min-h-full space-y-6" role="status" aria-live="polite">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded bg-slate-200/70" />
        <div className="h-4 w-80 animate-pulse rounded bg-slate-200/70" />
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}
