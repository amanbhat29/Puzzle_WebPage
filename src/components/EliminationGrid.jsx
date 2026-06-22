import React, { useCallback } from "react";
import { Check, X } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// EliminationGrid — Interactive logic grid table for Logic Detective.
//   Rows = characters, Columns = category items (grouped by category).
//   Cells cycle: empty → ✓ (yes) → ✗ (no) → empty
// ═══════════════════════════════════════════════════════════════════════════

export default function EliminationGrid({
  characters = [],
  categories = [],
  gridState = {},
  onCellToggle,
  readonly = false,
}) {
  // ── Build a flat list of column items with their category name ──────────
  const columns = categories.flatMap((cat) =>
    cat.items.map((item) => ({ categoryName: cat.name, item }))
  );

  // ── Cell click handler: cycles empty → yes → no → empty ───────────────
  const handleCellClick = useCallback(
    (character, categoryName, item) => {
      if (readonly || !onCellToggle) return;
      onCellToggle(character, categoryName, item);
    },
    [readonly, onCellToggle]
  );

  if (characters.length === 0 || categories.length === 0) return null;

  return (
    <div
      className="overflow-x-auto rounded-xl border border-saathi-line shadow-sm"
      style={{ animation: "brain-fade-in 0.4s ease-out" }}
    >
      <table className="w-full border-collapse text-center">
        {/* ── Column Group Headers ──────────────────────────────────── */}
        <thead>
          {/* Category group header row */}
          <tr className="border-b border-saathi-line bg-gray-50">
            {/* Empty corner cell above row headers */}
            <th
              className="sticky left-0 z-20 min-w-[80px] border-r border-saathi-line bg-gray-50 p-2"
              aria-hidden
            />
            {categories.map((cat) => (
              <th
                key={cat.name}
                colSpan={cat.items.length}
                className="border-r border-saathi-line px-2 py-2 text-xs font-extrabold uppercase tracking-wide text-saathi-indigo last:border-r-0"
              >
                {cat.name}
              </th>
            ))}
          </tr>

          {/* Individual column item headers */}
          <tr className="border-b-2 border-saathi-line bg-white">
            <th
              className="sticky left-0 z-20 min-w-[80px] border-r border-saathi-line bg-white p-2 text-xs font-bold text-saathi-muted"
            >
              Name
            </th>
            {columns.map((col) => (
              <th
                key={`${col.categoryName}-${col.item}`}
                className="min-w-[40px] border-r border-saathi-line px-1 py-2 text-xs font-bold text-saathi-ink last:border-r-0"
              >
                {col.item}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Character Rows ────────────────────────────────────────── */}
        <tbody>
          {characters.map((character, rowIdx) => (
            <tr
              key={character}
              className={`border-b border-saathi-line last:border-b-0 ${
                rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              {/* Sticky row header */}
              <td className="sticky left-0 z-10 min-w-[80px] border-r border-saathi-line bg-white px-3 py-2 text-left text-xs font-bold text-saathi-ink">
                {character}
              </td>

              {/* Grid cells */}
              {columns.map((col) => {
                const key = `${character}-${col.categoryName}-${col.item}`;
                const cellState = gridState[key] || "empty";

                return (
                  <GridCell
                    key={key}
                    state={cellState}
                    onClick={() =>
                      handleCellClick(character, col.categoryName, col.item)
                    }
                    readonly={readonly}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════

// ── Grid Cell: empty | yes (✓) | no (✗) ──────────────────────────────────

function GridCell({ state, onClick, readonly }) {
  const cellStyles = {
    empty: "bg-white hover:bg-gray-50",
    yes: "bg-emerald-50",
    no: "bg-red-50",
  };

  return (
    <td
      className={`h-10 min-w-[40px] border-r border-saathi-line last:border-r-0 ${cellStyles[state] || cellStyles.empty}`}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={readonly}
        className={`flex h-full w-full items-center justify-center transition-colors ${
          readonly ? "cursor-default" : "cursor-pointer"
        }`}
        aria-label={
          state === "yes" ? "Confirmed" : state === "no" ? "Eliminated" : "Unknown"
        }
      >
        {state === "yes" && (
          <Check
            size={14}
            className="text-saathi-green"
            strokeWidth={3}
          />
        )}
        {state === "no" && (
          <X
            size={14}
            className="text-saathi-red"
            strokeWidth={3}
          />
        )}
      </button>
    </td>
  );
}
