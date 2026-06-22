import React, { useEffect, useMemo } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { createMovementAnswer, isPointInList, isSamePoint, moveOnGrid, pointKey } from "../../utils/puzzleValidation";

export default function MovementBoard({ puzzle, answer, onChange, readonly = false, showSolution = false }) {
  const current = answer ?? createMovementAnswer(puzzle);
  const collectedFuel = current.collectedFuel ?? [];
  const remainingFuel = (puzzle.fuelCells ?? []).length - collectedFuel.length;

  const displayAnswer = useMemo(() => {
    if (!showSolution) return current;
    return {
      ...current,
      position: puzzle.goal,
      collectedFuel: (puzzle.fuelCells ?? []).map(pointKey)
    };
  }, [current, puzzle, showSolution]);

  function move(direction) {
    if (readonly) return;
    onChange(moveOnGrid(puzzle, current, direction));
  }

  useEffect(() => {
    if (readonly) return undefined;

    function handleKeyDown(event) {
      const keyMap = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right"
      };
      const direction = keyMap[event.key];
      if (!direction) return;
      event.preventDefault();
      move(direction);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Moves" value={current.moves ?? 0} />
        {puzzle.type === "space-fuel" ? (
          <>
            <Stat label="Fuel" value={`${collectedFuel.length}/${puzzle.fuelCells.length}`} />
            <Stat label="Left" value={remainingFuel} />
          </>
        ) : (
          <>
            <Stat label="Goal" value="Chest" />
            <Stat label="Grid" value="4x4" />
          </>
        )}
      </div>

      <div className="mx-auto mt-4 grid max-w-[280px] grid-cols-4 gap-2 rounded-2xl border border-saathi-line bg-white p-3 shadow-sm">
        {Array.from({ length: puzzle.size }).map((_, row) =>
          Array.from({ length: puzzle.size }).map((__, col) => {
            const point = [row, col];
            return (
              <div
                key={`${row}-${col}`}
                className={`grid aspect-square place-items-center rounded-2xl border text-2xl font-extrabold shadow-sm ${cellClass(puzzle, point, displayAnswer)}`}
              >
                {cellContent(puzzle, point, displayAnswer)}
              </div>
            );
          })
        )}
      </div>

      {!readonly && (
        <div className="mx-auto mt-5 grid w-40 grid-cols-3 gap-2">
          <span />
          <MoveButton label="Move up" onClick={() => move("up")}>
            <ArrowUp size={20} />
          </MoveButton>
          <span />
          <MoveButton label="Move left" onClick={() => move("left")}>
            <ArrowLeft size={20} />
          </MoveButton>
          <MoveButton label="Move down" onClick={() => move("down")}>
            <ArrowDown size={20} />
          </MoveButton>
          <MoveButton label="Move right" onClick={() => move("right")}>
            <ArrowRight size={20} />
          </MoveButton>
        </div>
      )}

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

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-saathi-mintSoft px-3 py-2">
      <p className="text-[10px] font-extrabold uppercase text-saathi-muted">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-saathi-ink">{value}</p>
    </div>
  );
}

function MoveButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-12 w-12 place-items-center rounded-2xl bg-saathi-green text-white shadow-saathi transition hover:bg-saathi-greenDark"
    >
      {children}
    </button>
  );
}

function cellClass(puzzle, point, answer) {
  if (isPointInList(point, puzzle.obstacles ?? [])) return "border-slate-300 bg-slate-200";
  if (isSamePoint(point, answer.position)) return "border-saathi-green bg-emerald-50";
  if (puzzle.type === "space-fuel" && isPointInList(point, puzzle.fuelCells) && !answer.collectedFuel?.includes(pointKey(point))) {
    return "border-amber-300 bg-amber-50";
  }
  if (isSamePoint(point, puzzle.goal)) return "border-amber-300 bg-amber-50";
  return "border-saathi-line bg-saathi-mintSoft";
}

function cellContent(puzzle, point, answer) {
  if (isSamePoint(point, answer.position)) return puzzle.type === "space-fuel" ? "R" : "E";
  if (isPointInList(point, puzzle.obstacles ?? [])) return "X";
  if (puzzle.type === "space-fuel" && isPointInList(point, puzzle.fuelCells) && !answer.collectedFuel?.includes(pointKey(point))) return "F";
  if (isSamePoint(point, puzzle.goal)) return puzzle.type === "space-fuel" ? "P" : "$";
  return "";
}
