import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";
import ProgressHeader from "../components/ProgressHeader";
import QuestionCard from "../components/QuestionCard";
import SecondaryButton from "../components/SecondaryButton";
import { useAttempt } from "../context/AttemptContext";
import { getPuzzleById } from "../data/puzzles";
import { hasAnswer, validatePuzzle } from "../utils/puzzleValidation";
import PatternDetectionGame from "../components/boards/PatternDetectionGame";
import EliminationGridGame from "../components/boards/EliminationGridGame";
import NumberMatrixGame from "../components/boards/NumberMatrixGame";
import CodeBreakerGame from "../components/boards/CodeBreakerGame";
import WordDetectiveGame from "../components/boards/WordDetectiveGame";
import WordLadderGame from "../components/boards/WordLadderGame";

export default function PuzzleAttemptPage() {
  const { id = "1" } = useParams();
  const puzzle = getPuzzleById(id);
  const navigate = useNavigate();
  const { getAttempt, startAttempt, updateAnswer, submitAttempt } = useAttempt();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!puzzle) return;
    startAttempt(puzzle.id);
    const interval = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [puzzle, startAttempt]);

  if (!puzzle) {
    return <NotFound />;
  }

  if (puzzle.type === "pattern-detection") {
    return <PatternDetectionGame puzzle={puzzle} />;
  }

  if (puzzle.type === "elimination-grid") {
    return <EliminationGridGame puzzle={puzzle} />;
  }

  if (puzzle.type === "number-matrix") {
    return <NumberMatrixGame puzzle={puzzle} />;
  }

  if (puzzle.type === "code-breaker") {
    return <CodeBreakerGame puzzle={puzzle} />;
  }

  if (puzzle.type === "word-detective") {
    return <WordDetectiveGame puzzle={puzzle} />;
  }

  if (puzzle.type === "word-ladder") {
    return <WordLadderGame puzzle={puzzle} />;
  }


  const attempt = getAttempt(puzzle.id);
  const answered = hasAnswer(puzzle, attempt.answer);
  const answeredCount = answered ? 1 : 0;

  function handleSubmit() {
    if (!answered) return;
    submitAttempt(puzzle.id, elapsedSeconds, validatePuzzle(puzzle, attempt.answer));
    navigate(`/review/${puzzle.id}`);
  }

  return (
    <main className="saathi-screen">
      <div className="phone-frame relative">
        <ProgressHeader
          current={1}
          total={1}
          elapsedSeconds={elapsedSeconds}
          progressPercent={answeredCount ? 100 : 0}
          answeredCount={answeredCount}
        />
        <QuestionCard
          puzzle={puzzle}
          answer={attempt.answer}
          onChange={(answer) => updateAnswer(puzzle.id, answer)}
        />
        <footer className="fixed inset-x-0 bottom-0 mx-auto grid max-w-md grid-cols-2 gap-3 border-t border-saathi-line bg-white px-4 py-3">
          <SecondaryButton disabled>Previous</SecondaryButton>
          <PrimaryButton disabled={!answered} onClick={handleSubmit}>
            Submit
          </PrimaryButton>
        </footer>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main className="saathi-screen grid place-items-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-extrabold text-saathi-ink">Puzzle not found</h1>
        <p className="mt-2 text-sm font-semibold text-saathi-muted">Please return home and choose another puzzle.</p>
      </div>
    </main>
  );
}
