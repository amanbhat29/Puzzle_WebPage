import React from "react";

// ═══════════════════════════════════════════════════════════════════════════
// DifficultySelector — Horizontal row of pill buttons for selecting
//                      puzzle difficulty (Easy / Medium / Hard).
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function DifficultySelector({
  selected,
  onChange,
  difficulties = DEFAULT_DIFFICULTIES,
}) {
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Difficulty">
      {difficulties.map((diff) => {
        const isSelected = selected === diff;

        return (
          <button
            key={diff}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(diff)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-all duration-200 ${
              isSelected
                ? "bg-saathi-indigo text-white shadow-sm scale-[1.02]"
                : "bg-white text-saathi-ink border border-saathi-line hover:border-saathi-indigo hover:text-saathi-indigo"
            }`}
          >
            {diff}
          </button>
        );
      })}
    </div>
  );
}
