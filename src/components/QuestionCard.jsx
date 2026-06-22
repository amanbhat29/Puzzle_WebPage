import React from "react";
import PuzzleBoard from "./PuzzleBoard";

export default function QuestionCard({ puzzle, answer, onChange }) {
  return (
    <section className="px-4 pb-28 pt-4">
      <button className="mb-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-saathi-muted shadow-sm">Ask Tutor</button>
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <p className="text-xs font-extrabold uppercase text-saathi-muted">Puzzle</p>
        <h1 className="mt-2 text-lg font-extrabold leading-snug text-saathi-ink">{puzzle.question}</h1>
        <PuzzleBoard puzzle={puzzle} answer={answer} onChange={onChange} />
      </div>
    </section>
  );
}
