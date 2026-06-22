import React, { useState } from "react";
import { Crown, X } from "lucide-react";

/**
 * QueensGameBoard — Interactive grid with coloured regions, click cycling,
 * conflict highlighting, and hint glow.
 *
 * Props:
 *   board       — { size, queens, regions, regionColors }
 *   grid        — 2-D array of "empty" | "queen" | "marker"
 *   onCellClick — (row, col) => void
 *   conflicts   — Set of "row-col" keys
 *   hintCell    — [row, col] | null
 *   disabled    — boolean (locks the board during hint animation, etc.)
 */
export default function QueensGameBoard({ board, grid, onCellClick, conflicts, hintCell, disabled = false }) {
  const { size, regions, regionColors } = board;
  const [hoveredRegion, setHoveredRegion] = useState(-1);

  const iconSize = size <= 4 ? 26 : size <= 5 ? 22 : size <= 6 ? 19 : size <= 7 ? 16 : 14;
  const markerSize = size <= 5 ? 16 : size <= 7 ? 13 : 11;

  return (
    <div className="queens-board-enter mx-auto w-full" style={{ maxWidth: `${Math.min(size * 58, 420)}px` }}>
      <div
        className="grid overflow-hidden rounded-xl shadow-md"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const regionId = regions[r][c];
            const color = regionColors[regionId];
            const key = `${r}-${c}`;
            const isConflict = conflicts.has(key);
            const isHint = hintCell && hintCell[0] === r && hintCell[1] === c;
            const isHovered = hoveredRegion === regionId;

            // Region-boundary borders
            const borderTop = r === 0 || regions[r - 1][c] !== regionId;
            const borderBottom = r === size - 1 || regions[r + 1]?.[c] !== regionId;
            const borderLeft = c === 0 || regions[r][c - 1] !== regionId;
            const borderRight = c === size - 1 || regions[r][c + 1] !== regionId;

            const borderStyle = {
              borderTop: borderTop ? `2.5px solid ${color.accent}44` : "1px solid rgba(0,0,0,0.06)",
              borderBottom: borderBottom ? `2.5px solid ${color.accent}44` : "1px solid rgba(0,0,0,0.06)",
              borderLeft: borderLeft ? `2.5px solid ${color.accent}44` : "1px solid rgba(0,0,0,0.06)",
              borderRight: borderRight ? `2.5px solid ${color.accent}44` : "1px solid rgba(0,0,0,0.06)",
              backgroundColor: isConflict ? "#FEE2E2" : isHint ? "#DBEAFE" : isHovered ? color.hover : color.bg,
              transition: "background-color 0.2s, box-shadow 0.2s",
            };

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onCellClick(r, c)}
                onMouseEnter={() => setHoveredRegion(regionId)}
                onMouseLeave={() => setHoveredRegion(-1)}
                className={`aspect-square flex items-center justify-center relative select-none
                  ${isConflict ? "queens-conflict" : ""}
                  ${isHint ? "queens-hint" : ""}
                  ${!disabled ? "cursor-pointer active:scale-90" : "cursor-default"}
                `}
                style={borderStyle}
                aria-label={`Row ${r + 1}, Column ${c + 1}, ${cell}`}
              >
                {cell === "queen" && (
                  <span className="queens-place flex items-center justify-center" style={{ color: isConflict ? "#DC2626" : color.accent }}>
                    <Crown size={iconSize} fill="currentColor" strokeWidth={1.5} />
                  </span>
                )}
                {cell === "marker" && (
                  <span className="flex items-center justify-center text-gray-400">
                    <X size={markerSize} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Region legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        {regionColors.map((color, idx) => {
          const queensInRegion = countQueensInRegion(grid, regions, idx, size);
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: color.bg, color: color.accent, border: `1px solid ${color.border}` }}
            >
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color.accent }} />
              {queensInRegion}/1
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Count how many queens are in a given region. */
function countQueensInRegion(grid, regions, regionId, size) {
  let count = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "queen" && regions[r][c] === regionId) count++;
    }
  }
  return count;
}
