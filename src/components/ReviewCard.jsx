import React from "react";
import OptionCard from "./OptionCard";
import PuzzleBoard from "./PuzzleBoard";
import { validatePuzzle } from "../utils/puzzleValidation";

export default function ReviewCard({ puzzle, answer }) {
  const isCustomGame = [
    "pattern-detection",
    "pattern-detective",
    "elimination-grid",
    "number-matrix",
    "code-breaker"
  ].includes(puzzle.type);

  if (isCustomGame) {
    const roundResults = answer?.roundResults || [];
    return (
      <section className="px-4 pb-28 pt-4">
        <h2 className="text-lg font-extrabold text-saathi-ink mb-4">Round Summary</h2>
        {roundResults.length === 0 ? (
          <div className="rounded-2xl bg-white p-5 text-center border border-dashed border-saathi-line">
            <p className="text-sm font-bold text-saathi-muted">No rounds logged for this session.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roundResults.map((res, idx) => (
              <div key={idx} className="rounded-2xl bg-white p-5 border border-saathi-line shadow-card animate-[brain-fade-in-up_0.3s_ease-out]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-saathi-indigo uppercase tracking-wider">Round {res.round}</span>
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-black text-white ${res.isCorrect ? "bg-saathi-green" : "bg-saathi-red"}`}>
                    {res.isCorrect ? "✓" : "!"}
                  </span>
                </div>
                
                {/* Sequence / Content Display */}
                <div className="mb-4">
                  {(puzzle.type === "pattern-detection" || puzzle.type === "pattern-detective") && (
                    <div className="flex flex-wrap items-center justify-center gap-2 bg-gray-50/50 p-3 rounded-xl border border-saathi-line">
                      {res.sequence.map((item, sIdx) => {
                        const isQuestion = item === '?';
                        return (
                          <span key={sIdx} className={`w-10 h-10 flex items-center justify-center rounded-xl border text-sm font-black shadow-sm ${
                            isQuestion ? "border-saathi-amber bg-amber-50 text-saathi-amber" : "border-saathi-line bg-white text-saathi-ink"
                          }`}>
                            {Array.isArray(item) ? renderGridPreview(item) : item}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {puzzle.type === "elimination-grid" && (
                    <div className="w-full text-left space-y-1.5 p-4 bg-gray-50/50 rounded-xl border border-saathi-line font-semibold text-xs text-saathi-ink">
                      {res.sequence.map((clue, sIdx) => (
                        <p key={sIdx} className="flex gap-2">
                          <span className="text-saathi-indigo font-bold">•</span>
                          <span>{clue}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {puzzle.type === "number-matrix" && (
                    <div className="grid grid-cols-3 gap-1.5 mx-auto w-32 p-2 bg-gray-50/50 rounded-xl border border-saathi-line shadow-inner">
                      {res.sequence.flat().map((cell, cIdx) => {
                        const isQuestion = cell === "?";
                        return (
                          <div key={cIdx} className={`aspect-square flex items-center justify-center text-xs font-black rounded-lg border shadow-sm ${
                            isQuestion 
                              ? "border-saathi-amber bg-amber-50 text-saathi-amber"
                              : "border-saathi-line bg-white text-saathi-ink"
                          }`}>
                            {cell}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {puzzle.type === "code-breaker" && (
                    <div className="w-full text-center space-y-1.5 p-3 bg-gray-50/50 rounded-xl border border-saathi-line font-bold text-xs text-saathi-ink">
                      {res.sequence.map((eq, sIdx) => {
                        const parts = eq.split(" = ");
                        const word = parts[0];
                        const code = parts[1];
                        const isQuestion = code === "?";
                        return (
                          <div key={sIdx} className="flex justify-center items-center gap-1.5">
                            <span className="bg-white px-2 py-0.5 border border-saathi-line rounded shadow-sm text-[11px]">{word}</span>
                            <span className="text-saathi-muted text-[10px]">=</span>
                            <span className={`px-2 py-0.5 border rounded shadow-sm text-[11px] ${
                              isQuestion 
                                ? "border-saathi-amber bg-amber-50 text-saathi-amber border-dashed font-black" 
                                : "bg-indigo-50 border-indigo-100 text-saathi-indigo"
                            }`}>{code}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Answers & Rule */}
                <div className="text-xs font-semibold space-y-1.5 text-saathi-muted">
                  <p>
                    <span className="text-saathi-ink font-bold">Your Answer:</span>{" "}
                    <span className={res.isCorrect ? "text-saathi-green font-bold" : "text-saathi-red font-bold"}>
                      {res.studentAnswer || "Not answered"}
                    </span>
                  </p>
                  <p>
                    <span className="text-saathi-ink font-bold">Correct Answer:</span>{" "}
                    <span className="text-saathi-green font-bold">{res.correctAnswer}</span>
                  </p>
                  <div className="mt-3 p-3 bg-emerald-50 text-saathi-green rounded-xl border border-emerald-100 font-extrabold text-[11px] leading-relaxed">
                    <span className="text-[9px] font-black uppercase text-saathi-muted block mb-0.5">Pattern Rule</span>
                    {res.rule}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

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
          {puzzle.type !== "pattern-detective" && puzzle.type !== "pattern-detection" && (
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

function renderGridPreview(grid) {
  if (!Array.isArray(grid)) return null;
  return (
    <span className="grid grid-cols-2 gap-0.5 w-6 h-6 border border-saathi-line bg-gray-50 p-0.5 rounded">
      {grid.map((cell, cIdx) => (
        <span key={cIdx} className={`w-2.5 h-2.5 rounded-sm ${cell ? 'bg-saathi-indigo' : 'bg-gray-100'}`} />
      ))}
    </span>
  );
}

function getSelectedAnswerText(puzzle, answer) {
  if (!answer) return "Not answered";
  if (puzzle.options) return puzzle.options.find((option) => option.id === answer)?.text ?? "Not answered";
  if (puzzle.type === "treasure-maze") return `Explorer reached row ${answer.position[0] + 1}, column ${answer.position[1] + 1} in ${answer.moves} moves`;
  if (puzzle.type === "space-fuel") return `Rocket collected ${answer.collectedFuel.length}/${puzzle.fuelCells.length} fuel cells in ${answer.moves} moves`;
  return "Grid submitted";
}
