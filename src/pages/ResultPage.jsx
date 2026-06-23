import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";
import ResultCard from "../components/ResultCard";
import SecondaryButton from "../components/SecondaryButton";
import { useAttempt } from "../context/AttemptContext";
import { getPuzzleById } from "../data/puzzles";

export default function ResultPage() {
  const { id = "1" } = useParams();
  const puzzle = getPuzzleById(id);
  const navigate = useNavigate();
  const { getAttempt } = useAttempt();

  if (!puzzle) return null;

  const attempt = getAttempt(puzzle.id);
  const isCorrect = Boolean(attempt.isCorrect);
  const attempted = attempt.answer ? 1 : 0;
  const accuracy = (attempt.answer && typeof attempt.answer === "object" && typeof attempt.answer.accuracy === "number")
    ? attempt.answer.accuracy
    : (isCorrect ? 100 : 0);
  const resultPuzzle = { ...puzzle, latestAnswer: attempt.answer, elapsedSeconds: attempt.elapsedSeconds, attempted };

  return (
    <main className="saathi-screen">
      <div className="phone-frame relative bg-white">
        <ResultCard
          puzzle={resultPuzzle}
          accuracy={accuracy}
          attempted={attempted}
          elapsedSeconds={attempt.elapsedSeconds}
          solved={isCorrect}
        />
        <footer className="fixed inset-x-0 bottom-0 mx-auto grid max-w-md grid-cols-2 gap-3 border-t border-saathi-line bg-white px-4 py-3">
          <SecondaryButton onClick={() => navigate("/")}>Home</SecondaryButton>
          <PrimaryButton onClick={() => navigate(`/review/${puzzle.id}`)}>Review Solutions</PrimaryButton>
        </footer>
      </div>
    </main>
  );
}
