"use client";

/**
 * A dependency-free horizontal bar chart. Single series (the chart's own
 * heading names what's plotted, so no legend box is drawn - a legend is only
 * warranted once a chart shows 2+ series). Categorical color comes from a
 * fixed, never-cycled slot order so the same category always gets the same
 * hue across every render.
 */
const CATEGORICAL_SLOTS = [
  "text-blue-600",
  "text-emerald-600",
  "text-amber-600",
  "text-violet-600",
  "text-rose-600",
  "text-cyan-600",
  "text-orange-600",
  "text-fuchsia-600",
];

export interface BarChartDatum {
  label: string;
  value: number;
}

export function BarChart({ data, maxBars = 10 }: { data: BarChartDatum[]; maxBars?: number }) {
  const rows = data.slice(0, maxBars);
  const max = Math.max(1, ...rows.map((d) => d.value));

  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">No data to chart.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row, index) => {
        const widthPercent = Math.max(2, (row.value / max) * 100);
        const colorClass = CATEGORICAL_SLOTS[index % CATEGORICAL_SLOTS.length];
        return (
          <div key={row.label} className="flex items-center gap-3">
            <span
              className="text-muted-foreground w-36 shrink-0 truncate text-xs"
              title={row.label}
            >
              {row.label}
            </span>
            <div className="bg-muted relative h-4 flex-1 overflow-hidden rounded-full">
              <div
                className={`absolute inset-y-0 left-0 rounded-full ${colorClass}`}
                style={{ width: `${widthPercent}%`, backgroundColor: "currentColor" }}
              />
            </div>
            <span className="text-foreground w-10 shrink-0 text-right text-xs font-medium tabular-nums">
              {row.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
