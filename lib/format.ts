/** "vor 5 Sekunden"-style relative time, in English, gatus-style ("5 seconds ago"). */
export function formatRelativeTime(isoDate: string, now: number = Date.now()): string {
  const diffMs = now - new Date(isoDate).getTime();
  const diffSec = Math.max(0, Math.round(diffMs / 1000));

  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec} second${diffSec === 1 ? "" : "s"} ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}

/** "5 minutes 50 seconds"-style duration, for event descriptions. */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds} second${totalSeconds === 1 ? "" : "s"}`;

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  if (seconds > 0 && days === 0) parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);

  return parts.slice(0, 2).join(" ");
}

export function formatAbsoluteTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatTimeShort(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Why a failed check failed. The checker stores `status_code: null` when no
 * HTTP response came back at all — a timeout if it ran the full 10s budget,
 * otherwise a connection-level error (DNS, TLS, refused).
 */
export function describeFailure(check: { status_code: number | null; response_time_ms: number | null }): string {
  if (check.status_code !== null) return `HTTP ${check.status_code}`;
  if (check.response_time_ms !== null && check.response_time_ms >= 10_000) return "Timeout";
  return "Connection error";
}

export function formatMs(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "—";
  return `${Math.round(ms)}ms`;
}

export function formatUptime(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return "—";
  return `${pct.toFixed(2)}%`;
}

/** "00:00–06:10" from the database's "HH:MM:SS" quiet window bounds. */
export function formatQuietWindow(start: string | null, end: string | null): string {
  if (!start || !end) return "—";
  return `${start.slice(0, 5)}–${end.slice(0, 5)}`;
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
