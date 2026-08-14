"use client";

import type { TrendPoint } from "@/server/reporting/types";

/**
 * A dependency-free single-series trend line. One hue (the default sequential
 * blue), 2px stroke, an 8px end-marker with a surface ring, and a value label
 * at the end only - per-point labels would be noise. Each point still carries
 * a native `<title>` tooltip so the underlying value is never hidden, without
 * building a full custom tooltip layer for this foundation release.
 */
export function TrendLine({ points, height = 64 }: { points: TrendPoint[]; height?: number }) {
  if (points.length === 0) {
    return <p className="text-muted-foreground text-sm">No trend data available.</p>;
  }

  const width = 320;
  const padding = 8;
  const max = Math.max(1, ...points.map((p) => p.count));
  const stepX = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: padding + i * stepX,
    y: height - padding - (p.count / max) * (height - padding * 2),
    point: p,
  }));

  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(2)},${c.y.toFixed(2)}`)
    .join(" ");
  const last = coords[coords.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="text-blue-600"
      role="img"
      aria-label="Trend chart"
    >
      <title>{`${points[0].date} to ${points[points.length - 1].date}`}</title>
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        className="stroke-border"
        strokeWidth={1}
      />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coords.map((c) => (
        <circle key={c.point.date} cx={c.x} cy={c.y} r={2} fill="currentColor" opacity={0.35}>
          <title>{`${c.point.date}: ${c.point.count}`}</title>
        </circle>
      ))}
      <circle
        cx={last.x}
        cy={last.y}
        r={4}
        fill="currentColor"
        stroke="var(--color-background, #fff)"
        strokeWidth={2}
      />
      <text
        x={last.x}
        y={last.y - 8}
        textAnchor="end"
        className="fill-foreground text-[10px] font-medium"
      >
        {last.point.count}
      </text>
    </svg>
  );
}
