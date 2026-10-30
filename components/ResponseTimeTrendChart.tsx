"use client";

import { Area, AreaChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface TrendPoint {
  label: string;
  timestamp: number;
  responseTimeMs: number | null;
  /** False for buckets with no checks at all (quiet hours, missed runs) — drawn as a grey band. */
  tracked: boolean;
}

interface ResponseTimeTrendChartProps {
  data: TrendPoint[];
}

/** Runs of untracked points, stretched to the tracked neighbours so the band covers the whole gap. */
function untrackedRanges(data: TrendPoint[]): { x1: number; x2: number }[] {
  const ranges: { x1: number; x2: number }[] = [];
  let i = 0;
  while (i < data.length) {
    if (data[i].tracked) {
      i++;
      continue;
    }
    const startIdx = i;
    while (i < data.length && !data[i].tracked) i++;
    ranges.push({
      x1: data[Math.max(0, startIdx - 1)].timestamp,
      x2: data[Math.min(data.length - 1, i)].timestamp,
    });
  }
  return ranges;
}

export default function ResponseTimeTrendChart({ data }: ResponseTimeTrendChartProps) {
  // Keyed by timestamp, not label — hourly labels repeat across a 24h window.
  const labels = new Map(data.map((p) => [p.timestamp, p.label]));
  const labelOf = (ts: unknown) => labels.get(Number(ts)) ?? "";

  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="responseTimeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            tickFormatter={labelOf}
            tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v) => `${v}ms`}
          />
          {untrackedRanges(data).map((r) => (
            <ReferenceArea key={r.x1} x1={r.x1} x2={r.x2} fill="var(--color-check-empty)" fillOpacity={0.6} stroke="none" />
          ))}
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              color: "var(--color-text)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--color-text-secondary)" }}
            labelFormatter={labelOf}
            formatter={(value: number | string) => [`${value}ms`, "Response time"]}
          />
          <Area
            type="monotone"
            dataKey="responseTimeMs"
            stroke="var(--color-accent)"
            strokeWidth={2}
            fill="url(#responseTimeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
