import React, { useMemo } from "react";
import { formatTimer } from "../utils/format";

// ═══════════════════════════════════════════════════════════════════════════
// GameTimer — Circular SVG countdown timer with animated ring and
//             centered MM:SS display.
// ═══════════════════════════════════════════════════════════════════════════

export default function GameTimer({
  totalSeconds,
  remainingSeconds,
  size = 64,
  strokeWidth = 4,
  accentColor = "#6366f1",
}) {
  // ── Circle geometry ────────────────────────────────────────────────────
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // ── Progress fraction (how much of the ring is filled) ─────────────────
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const dashOffset = circumference * (1 - progress);

  // ── Formatted time string ──────────────────────────────────────────────
  const timeDisplay = useMemo(
    () => formatTimer(Math.max(0, Math.round(remainingSeconds))),
    [remainingSeconds]
  );

  // ── Urgency color: switch to red when ≤20% time remains ───────────────
  const ringColor =
    totalSeconds > 0 && remainingSeconds / totalSeconds <= 0.2
      ? "#ef5543" // saathi-red
      : accentColor;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="timer"
      aria-label={`${timeDisplay} remaining`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={{ animation: "brain-timer-ring 0.6s ease-out" }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e7ece8"
          strokeWidth={strokeWidth}
        />

        {/* Animated progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 0.4s ease-out, stroke 0.3s ease",
          }}
        />
      </svg>

      {/* Center time display */}
      <span
        className="absolute text-center font-extrabold leading-none text-saathi-ink"
        style={{ fontSize: size * 0.22 }}
      >
        {timeDisplay}
      </span>
    </div>
  );
}
