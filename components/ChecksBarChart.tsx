"use client";

import type { Check } from "@/lib/types";
import { describeFailure, formatAbsoluteTime, formatRelativeTime, formatTimeShort } from "@/lib/format";

/** The checker runs every 5 minutes — a longer gap between two checks means runs were skipped (quiet hours) or missed. */
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

interface ChecksBarChartProps {
  checks: Check[];
  /** Show only the newest N slots (checks + unchecked gaps), padding with placeholders when there are fewer. */
  maxBars?: number;
  /** Pad with placeholders up to N slots, but never cut anything off. Ignored when `maxBars` is set. */
  minBars?: number;
  /** Also show the time since the newest check as unchecked (e.g. while an endpoint is in its quiet window). */
  untilNow?: boolean;
  barHeight?: number;
}

type Segment =
  | { kind: "check"; check: Check; slots: 1; start: number }
  | { kind: "gap"; slots: number; start: number; end: number };

function buildSegments(checks: Check[], untilNow: boolean): Segment[] {
  const sorted = [...checks].sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime());
  const segments: Segment[] = [];
  let prev: number | null = null;

  for (const check of sorted) {
    const at = new Date(check.checked_at).getTime();
    if (prev !== null) {
      const missing = Math.round((at - prev) / CHECK_INTERVAL_MS) - 1;
      if (missing > 0) segments.push({ kind: "gap", slots: missing, start: prev + CHECK_INTERVAL_MS, end: at - CHECK_INTERVAL_MS });
    }
    segments.push({ kind: "check", check, slots: 1, start: at });
    prev = at;
  }

  if (untilNow && prev !== null) {
    // Floor + 1 slot of grace: the next run may still be in flight.
    const missing = Math.floor((Date.now() - prev) / CHECK_INTERVAL_MS) - 1;
    if (missing > 0) segments.push({ kind: "gap", slots: missing, start: prev + CHECK_INTERVAL_MS, end: Date.now() });
  }

  return segments;
}

/** Keep the newest `limit` slots, cutting the oldest gap short if it straddles the edge. */
function takeNewest(segments: Segment[], limit: number): Segment[] {
  const result: Segment[] = [];
  let used = 0;
  for (let i = segments.length - 1; i >= 0 && used < limit; i--) {
    const segment = segments[i];
    const room = limit - used;
    if (segment.kind === "gap" && segment.slots > room) {
      result.unshift({ ...segment, slots: room, start: segment.end - (room - 1) * CHECK_INTERVAL_MS });
      used = limit;
    } else {
      result.unshift(segment);
      used += segment.slots;
    }
  }
  return result;
}

export default function ChecksBarChart({ checks, maxBars, minBars, untilNow = false, barHeight = 34 }: ChecksBarChartProps) {
  const all = buildSegments(checks, untilNow);
  const visible = maxBars !== undefined ? takeNewest(all, maxBars) : all;
  const usedSlots = visible.reduce((sum, s) => sum + s.slots, 0);
  const placeholders = Math.max(0, (maxBars ?? minBars ?? 0) - usedSlots);

  const oldest = visible[0];
  const newestCheck = [...visible].reverse().find((s) => s.kind === "check");

  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height: barHeight }}>
        {Array.from({ length: placeholders }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex-1 rounded-sm"
            style={{ height: "100%", background: "var(--color-check-empty)" }}
          />
        ))}
        {visible.map((segment) =>
          segment.kind === "gap" ? (
            <div
              key={`gap-${segment.start}`}
              title={`${formatTimeShort(new Date(segment.start).toISOString())}–${formatTimeShort(
                new Date(segment.end).toISOString(),
              )} — not checked`}
              className="rounded-sm"
              style={{ height: "100%", flex: `${segment.slots} 1 0`, background: "var(--color-check-empty)" }}
            />
          ) : (
            <div
              key={segment.check.id}
              title={`${formatAbsoluteTime(segment.check.checked_at)} — ${
                segment.check.success ? "success" : `failed: ${describeFailure(segment.check)}`
              }${segment.check.response_time_ms !== null ? ` (${segment.check.response_time_ms}ms)` : ""}`}
              className="flex-1 rounded-sm"
              style={{ height: "100%", background: segment.check.success ? "var(--color-success)" : "var(--color-danger)" }}
            />
          ),
        )}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
        <span>{oldest ? formatTimeShort(new Date(oldest.start).toISOString()) : "—"}</span>
        <span>{newestCheck?.kind === "check" ? formatRelativeTime(newestCheck.check.checked_at) : "—"}</span>
      </div>
    </div>
  );
}
