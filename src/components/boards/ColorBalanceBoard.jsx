import React from "react";
import { createEmptyGrid } from "../../utils/puzzleValidation";

const nextValue = {
  "": "B",
  B: "Y",
  Y: ""
};

export default function ColorBalanceBoard({ puzzle, answer, onChange, readonly = false, showSolution = false }) {
  const grid = showSolution ? puzzle.solution : answer ?? createEmptyGrid(puzzle.size, "");

  function cycleCell(row, col) {
    if (readonly) return;
    const next = grid.map((line, rowIndex) =>
      line.map((cell, colIndex) => (rowIndex === row && colIndex === col ? nextValue[cell] : cell))
    );
    onChange(next);
  }

  return (
    <div className="mt-4">
      <div className="mx-auto grid max-w-[280px] grid-cols-4 gap-2 rounded-2xl border border-saathi-line bg-white p-3 shadow-sm">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              type="button"
              disabled={readonly}
              onClick={() => cycleCell(rowIndex, colIndex)}
              className={`aspect-square rounded-2xl border text-xs font-extrabold shadow-sm transition ${
                cell === "B"
                  ? "border-sky-300 bg-sky-400 text-white"
                  : cell === "Y"
                    ? "border-amber-300 bg-saathi-amber text-white"
                    : "border-saathi-line bg-saathi-mintSoft text-saathi-muted hover:border-saathi-green"
              }`}
            >
              {cell || "Tap"}
            </button>
          ))
        )}
      </div>
      <div className="mt-4 grid gap-2">
        {puzzle.rules.map((rule) => (
          <div key={rule} className="rounded-xl bg-saathi-mintSoft px-3 py-2 text-xs font-bold text-saathi-muted">
            {rule}
          </div>
        ))}
      </div>
    </div>
  );
}
