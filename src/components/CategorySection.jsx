import React from "react";
import PuzzleCard from "./PuzzleCard";

// ═══════════════════════════════════════════════════════════════════════════
// CategorySection — Renders a category header, skill pills, and a
//                   responsive grid of PuzzleCards for the landing page.
// ═══════════════════════════════════════════════════════════════════════════

export default function CategorySection({ category, puzzles, onStartPuzzle }) {
  if (!category || !puzzles || puzzles.length === 0) return null;

  return (
    <section
      className="mb-10"
      style={{ animation: "brain-fade-in-up 0.5s ease-out" }}
    >
      {/* ── Category Header ─────────────────────────────────────────── */}
      <div className="mb-5 flex items-start gap-4">
        {/* Large emoji icon */}
        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl shadow-sm ${category.accentBg || (category.id === "brain" ? "bg-indigo-50" : "bg-emerald-50")}`}
        >
          {category.icon}
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-saathi-ink">
            {category.title}
          </h2>
          <p className="mt-1 text-sm text-saathi-muted">
            {category.description}
          </p>
        </div>
      </div>

      {/* ── Skill Tags ──────────────────────────────────────────────── */}
      {category.skills && category.skills.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {category.skills.map((skill) => (
            <span
              key={skill}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                category.accentBg && category.accentText
                  ? `${category.accentBg} ${category.accentText}`
                  : category.id === "brain"
                    ? "bg-indigo-50 text-saathi-indigo"
                    : "bg-emerald-50 text-saathi-green"
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* ── Puzzle Cards Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {puzzles.map((puzzle) => (
          <PuzzleCard
            key={puzzle.id || puzzle.title}
            puzzle={puzzle}
            onStart={() => onStartPuzzle(puzzle)}
          />
        ))}
      </div>

      {/* ── Visual Separator ────────────────────────────────────────── */}
      <div className="mt-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-saathi-line" />
        <span
          className={`text-xs font-bold ${
            category.id === "brain" ? "text-indigo-300" : "text-emerald-300"
          }`}
        >
          ✦
        </span>
        <div className="h-px flex-1 bg-saathi-line" />
      </div>
    </section>
  );
}
