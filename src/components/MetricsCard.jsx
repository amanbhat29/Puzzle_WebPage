import React from "react";

// ═══════════════════════════════════════════════════════════════════════════
// MetricsCard — A responsive grid of performance metric items.
//               Supports indigo (brain) or green (logic) accent theming.
// ═══════════════════════════════════════════════════════════════════════════

export default function MetricsCard({ metrics, accentColor = "indigo" }) {
  if (!metrics || metrics.length === 0) return null;

  // Choose grid columns based on count — 2 cols for ≤4 items, 3 cols for 5+
  const gridCols =
    metrics.length <= 2
      ? "grid-cols-2"
      : metrics.length <= 4
        ? "grid-cols-2"
        : "grid-cols-3";

  // Accent class for values
  const valueColor =
    accentColor === "green" ? "text-saathi-green" : "text-saathi-indigo";

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {metrics.map((metric, index) => (
        <MetricItem
          key={metric.label || index}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
          suffix={metric.suffix}
          valueColor={valueColor}
          index={index}
        />
      ))}
    </div>
  );
}

// ── Single Metric Item ───────────────────────────────────────────────────

function MetricItem({ icon, label, value, suffix, valueColor, index }) {
  return (
    <div
      className="min-h-[88px] rounded-xl border border-saathi-line bg-white p-3 shadow-sm"
      style={{
        animation: `brain-fade-in-up 0.4s ease-out ${index * 0.08}s both`,
      }}
    >
      {/* Icon + Value */}
      <div className={`mx-auto flex h-9 items-center justify-center gap-1.5 text-lg font-extrabold ${valueColor}`}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span>
          {value}
          {suffix && (
            <span className="ml-0.5 text-sm font-bold">{suffix}</span>
          )}
        </span>
      </div>

      {/* Label */}
      <p className="mt-2 text-center text-xs font-bold text-saathi-muted">
        {label}
      </p>
    </div>
  );
}
