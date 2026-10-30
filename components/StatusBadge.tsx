interface StatusBadgeProps {
  healthy: boolean;
  /** Endpoint is inside its quiet window — checks are skipped, so neither healthy nor unhealthy applies. */
  paused?: boolean;
  healthyLabel?: string;
  unhealthyLabel?: string;
}

export default function StatusBadge({
  healthy,
  paused = false,
  healthyLabel = "Healthy",
  unhealthyLabel = "Unhealthy",
}: StatusBadgeProps) {
  const background = paused ? "var(--color-check-empty)" : healthy ? "var(--color-success-bg)" : "var(--color-danger-bg)";
  const color = paused ? "var(--color-text-secondary)" : healthy ? "var(--color-success)" : "var(--color-danger-text)";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {paused ? "Paused" : healthy ? healthyLabel : unhealthyLabel}
    </span>
  );
}
