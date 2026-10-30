import type { Check } from "@/lib/types";
import { describeFailure, formatAbsoluteTime, formatMs } from "@/lib/format";

interface FailedChecksListProps {
  checks: Check[];
}

/** Lists the failed checks among `checks`, newest first — the bar chart only shows them as red bars. */
export default function FailedChecksList({ checks }: FailedChecksListProps) {
  const failed = checks
    .filter((c) => !c.success)
    .sort((a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime());

  if (checks.length === 0) return null;

  if (failed.length === 0) {
    return (
      <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
        No failed checks on this page.
      </p>
    );
  }

  return (
    <div
      className="rounded-[var(--radius-main)]"
      style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
    >
      <div
        className="px-4 py-2 text-xs font-medium"
        style={{ color: "var(--color-danger-text)", borderBottom: "1px solid var(--color-border)" }}
      >
        {failed.length} failed check{failed.length === 1 ? "" : "s"} on this page
      </div>
      <ul className="max-h-64 overflow-y-auto">
        {failed.map((check) => (
          <li
            key={check.id}
            className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <span className="flex items-center gap-2" style={{ color: "var(--color-text)" }}>
              <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--color-danger-text)" }} />
              {formatAbsoluteTime(check.checked_at)}
            </span>
            <span className="flex items-center gap-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>
              <span
                className="rounded-full px-2 py-0.5 font-medium"
                style={{ background: "var(--color-danger-bg)", color: "var(--color-danger-text)" }}
              >
                {describeFailure(check)}
              </span>
              <span className="w-14 text-right">{formatMs(check.response_time_ms)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
