import React from "react";
import MiniQueensBoard from "./boards/MiniQueensBoard";

export default function PuzzleBoard({ puzzle, answer, onChange, readonly = false, showSolution = false }) {
  if (puzzle.type === "mini-queens") {
    return <MiniQueensBoard puzzle={puzzle} answer={answer} onChange={onChange} readonly={readonly} showSolution={showSolution} />;
  }

  return null;
}

