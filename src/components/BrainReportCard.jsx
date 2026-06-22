import React from "react";
import { Medal, Star, Trophy, Zap } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// BrainReportCard — Final brain training report with score breakdown,
//                   animated skill bars, star rating, and XP display.
// ═══════════════════════════════════════════════════════════════════════════

export default function BrainReportCard({ report }) {
  if (!report) return null;

  const {
    speedScore = 0,
    accuracyScore = 0,
    memoryScore = 0,
    reasoningScore = 0,
    attentionScore = 0,
    overallScore = 0,
    xpEarned = 0,
    stars = 0,
    level = "Beginner",
  } = report;

  // Skill bars data
  const skills = [
    { label: "Speed", score: speedScore, emoji: "⚡" },
    { label: "Accuracy", score: accuracyScore, emoji: "🎯" },
    { label: "Memory", score: memoryScore, emoji: "🧠" },
    { label: "Reasoning", score: reasoningScore, emoji: "🔬" },
    { label: "Attention", score: attentionScore, emoji: "👁️" },
  ];

  // Score tier for ring color
  const ringColor =
    overallScore >= 80
      ? "from-indigo-500 to-violet-500"
      : overallScore >= 50
        ? "from-indigo-400 to-indigo-500"
        : "from-indigo-300 to-indigo-400";

  return (
    <div
      className="rounded-2xl border border-saathi-line bg-white p-5 shadow-card"
      style={{ animation: "brain-fade-in-up 0.5s ease-out" }}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="mb-5 text-center">
        <h2 className="text-2xl font-extrabold text-saathi-ink">
          🧠 Brain Report
        </h2>
        <p className="mt-1 text-sm font-semibold text-saathi-muted">
          Your cognitive performance summary
        </p>
      </div>

      {/* ── Overall Score Circle ───────────────────────────────────────── */}
      <div className="mx-auto mb-6 flex flex-col items-center">
        <div
          className={`relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br ${ringColor} p-1 shadow-lg`}
          style={{ animation: "brain-scale-in 0.6s ease-out" }}
        >
          <div className="grid h-full w-full place-items-center rounded-full bg-white">
            <div className="text-center">
              <p
                className="text-3xl font-extrabold text-saathi-indigo"
                style={{ animation: "brain-score-count 0.8s ease-out" }}
              >
                {overallScore}
              </p>
              <p className="text-[10px] font-bold text-saathi-muted">
                / 100
              </p>
            </div>
          </div>
        </div>

        {/* Level label */}
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-saathi-indigo">
          <Trophy size={13} />
          {level}
        </span>

        {/* Star rating */}
        <div className="mt-2 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={18}
              className={
                i < stars
                  ? "fill-saathi-amber text-saathi-amber"
                  : "text-gray-200"
              }
              style={{
                animation:
                  i < stars
                    ? `brain-scale-in 0.3s ease-out ${0.4 + i * 0.1}s both`
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Skill Score Bars ───────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-saathi-muted">
          Skill Breakdown
        </p>
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <SkillBar
              key={skill.label}
              label={skill.label}
              score={skill.score}
              emoji={skill.emoji}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>

      {/* ── XP Earned ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-4 text-center">
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-white text-saathi-amber shadow-sm">
          <Medal size={22} />
        </div>
        <p className="text-xs font-extrabold uppercase text-amber-600">
          XP Earned
        </p>
        <p
          className="mt-1 text-3xl font-extrabold text-saathi-ink"
          style={{ animation: "brain-score-count 0.8s ease-out 0.3s both" }}
        >
          +{xpEarned}
          <span className="ml-1 text-sm font-bold text-saathi-muted">XP</span>
        </p>
      </div>

      {/* ── Achievement Badges ─────────────────────────────────────────── */}
      <AchievementBadges overallScore={overallScore} stars={stars} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════

// ── Skill Bar with animated fill ─────────────────────────────────────────

function SkillBar({ label, score, emoji, delay = 0 }) {
  // Clamp score between 0 and 100
  const clamped = Math.min(100, Math.max(0, score));

  // Color tiers for bar fill
  const barColor =
    clamped >= 80
      ? "bg-gradient-to-r from-saathi-indigo to-saathi-violet"
      : clamped >= 50
        ? "bg-gradient-to-r from-saathi-indigo to-indigo-400"
        : "bg-gradient-to-r from-indigo-300 to-indigo-400";

  return (
    <div className="flex items-center gap-3">
      {/* Emoji + Label */}
      <div className="flex w-28 shrink-0 items-center gap-2">
        <span className="text-sm">{emoji}</span>
        <span className="text-xs font-bold text-saathi-ink">{label}</span>
      </div>

      {/* Bar track */}
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
          style={{
            width: `${clamped}%`,
            animation: `brain-progress-fill 0.8s ease-out ${delay}s both`,
          }}
        />
      </div>

      {/* Score value */}
      <span className="w-8 text-right text-xs font-extrabold text-saathi-indigo">
        {clamped}
      </span>
    </div>
  );
}

// ── Achievement Badges ────────────────────────────────────────────────────

function AchievementBadges({ overallScore, stars }) {
  // Derive achievement badges from performance
  const badges = [];

  if (overallScore >= 90) {
    badges.push({ icon: "🏆", label: "Brain Master" });
  }
  if (overallScore >= 70) {
    badges.push({ icon: "🌟", label: "Sharp Mind" });
  }
  if (stars >= 5) {
    badges.push({ icon: "⭐", label: "Perfect Score" });
  }
  if (stars >= 3) {
    badges.push({ icon: "🎯", label: "Focused" });
  }
  if (overallScore >= 50) {
    badges.push({ icon: "🧩", label: "Problem Solver" });
  }

  if (badges.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 text-center text-xs font-bold text-saathi-muted">
        Achievements
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {badges.map((badge) => (
          <span
            key={badge.label}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-saathi-indigo ring-1 ring-indigo-200 shadow-sm"
            style={{ animation: "brain-scale-in 0.4s ease-out" }}
          >
            {badge.icon} {badge.label}
          </span>
        ))}
      </div>
    </div>
  );
}
