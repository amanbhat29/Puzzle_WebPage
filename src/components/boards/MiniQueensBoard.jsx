import React from "react";
import { Crown } from "lucide-react";
import { createEmptyGrid } from "../../utils/puzzleValidation";

export default function MiniQueensBoard({ puzzle, answer, onChange, readonly = false, showSolution = false }) {
  const grid = showSolution ? puzzle.solution : answer ?? createEmptyGrid(puzzle.size, 0);

  function toggleCell(row, col) {
    if (readonly) return;
    const next = grid.map((line, rowIndex) =>
      line.map((cell, colIndex) => (rowIndex === row && colIndex === col ? (cell ? 0 : 1) : cell))
    );
    onChange(next);
  }

  return (
    <div className="mt-4">
      <div className="mx-auto grid max-w-[280px] grid-cols-4 overflow-hidden rounded-2xl border border-saathi-line bg-white shadow-sm">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isDark = (rowIndex + colIndex) % 2 === 1;
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                disabled={readonly}
                onClick={() => toggleCell(rowIndex, colIndex)}
                className={`grid aspect-square place-items-center border border-white/80 transition ${
                  isDark ? "bg-saathi-mint" : "bg-white"
                } ${cell ? "text-saathi-green" : "text-transparent"} ${readonly ? "" : "hover:bg-emerald-100"}`}
              >
                <Crown size={28} fill="currentColor" />
              </button>
            );
          })
        )}
      </div>
      <RuleList rules={puzzle.rules} />
    </div>
  );
}

function RuleList({ rules }) {
  return (
    <div className="mt-4 grid gap-2">
      {rules.map((rule) => (
        <div key={rule} className="rounded-xl bg-saathi-mintSoft px-3 py-2 text-xs font-bold text-saathi-muted">
          {rule}
        </div>
      ))}
    </div>
  );
}
