import React from "react";
import ColorBalanceBoard from "./boards/ColorBalanceBoard";
import MiniQueensBoard from "./boards/MiniQueensBoard";
import MovementBoard from "./boards/MovementBoard";
import PatternDetectiveBoard from "./boards/PatternDetectiveBoard";

export default function PuzzleBoard({ puzzle, answer, onChange, readonly = false, showSolution = false, hideOptions = false }) {
  if (puzzle.type === "mini-queens") {
    return <MiniQueensBoard puzzle={puzzle} answer={answer} onChange={onChange} readonly={readonly} showSolution={showSolution} />;
  }

  if (puzzle.type === "color-balance") {
    return <ColorBalanceBoard puzzle={puzzle} answer={answer} onChange={onChange} readonly={readonly} showSolution={showSolution} />;
  }

  if (puzzle.type === "treasure-maze" || puzzle.type === "space-fuel") {
    return <MovementBoard puzzle={puzzle} answer={answer} onChange={onChange} readonly={readonly} showSolution={showSolution} />;
  }

  return <PatternDetectiveBoard puzzle={puzzle} answer={answer} onChange={onChange} readonly={readonly} hideOptions={hideOptions} />;
}
