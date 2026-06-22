import React from "react";
import OptionCard from "./OptionCard";
import PuzzleBoard from "./PuzzleBoard";
import { validatePuzzle } from "../utils/puzzleValidation";

export default function ReviewCard({ puzzle, answer }) {
  const solved = validatePuzzle(puzzle, answer);
  const selectedAnswer = getSelectedAnswerText(puzzle, answer);
  const correctAnswer = puzzle.options?.find((option) => option.id === puzzle.correctOptionId)?.text ?? "Correct board state shown below";

  return (
    <section className="px-4 pb-28 pt-4">
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <p className="mb-2 text-xs font-extrabold text-saathi-muted">Puzzle</p>
        <h1 className="text-lg font-extrabold leading-snug text-saathi-ink">{puzzle.question}</h1>
        <PuzzleBoard puzzle={puzzle} answer={answer} readonly hideOptions />
      </div>
      {puzzle.options && (
        <div className="mt-4 space-y-3">
          {puzzle.options.map((option) => {
            const isCorrect = option.id === puzzle.correctOptionId;
            const isSelectedWrong = option.id === answer && option.id !== puzzle.correctOptionId;
            return (
              <OptionCard
                key={option.id}
                option={option}
                state={isCorrect ? "correct" : isSelectedWrong ? "wrong" : "neutral"}
              />
            );
          })}
        </div>
      )}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <span className={`grid h-7 w-7 place-items-center rounded-full text-sm font-extrabold ${solved ? "bg-emerald-100 text-saathi-green" : "bg-red-100 text-saathi-red"}`}>
            {solved ? "✓" : "!"}
          </span>
          <h2 className="text-lg font-extrabold text-saathi-ink">{solved ? "Solved" : "Review Solution"}</h2>
        </div>
        <div className="rounded-2xl bg-white p-5 text-sm font-semibold leading-relaxed text-saathi-muted shadow-card">
          <p>
            <span className="text-saathi-ink">Selected Answer:</span> {selectedAnswer}
          </p>
          <p className="mt-2">
            <span className="text-saathi-ink">Correct Answer:</span> {correctAnswer}
          </p>
          {puzzle.type !== "pattern-detective" && (
            <div className="mt-4">
              <PuzzleBoard puzzle={puzzle} answer={answer} readonly showSolution />
            </div>
          )}
          <p className="mt-4">{puzzle.explanation}</p>
        </div>
      </div>
    </section>
  );
}

function getSelectedAnswerText(puzzle, answer) {
  if (!answer) return "Not answered";
  if (puzzle.options) return puzzle.options.find((option) => option.id === answer)?.text ?? "Not answered";
  if (puzzle.type === "treasure-maze") return `Explorer reached row ${answer.position[0] + 1}, column ${answer.position[1] + 1} in ${answer.moves} moves`;
  if (puzzle.type === "space-fuel") return `Rocket collected ${answer.collectedFuel.length}/${puzzle.fuelCells.length} fuel cells in ${answer.moves} moves`;
  return "Grid submitted";
}
