import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Target, Trophy, Flame, Play, Sparkles } from "lucide-react";
import { generateEliminationGrid } from "../../utils/generators/eliminationGridGenerator";
import { useAttempt } from "../../context/AttemptContext";
import PrimaryButton from "../PrimaryButton";
import DifficultySelector from "../DifficultySelector";
import PuzzleIntroduction from "../PuzzleIntroduction";
import { getUniqueQuestion } from "../../utils/nonRepeatingGenerator";

const TOTAL_ROUNDS = 5;

export default function EliminationGridGame({ puzzle }) {
  const navigate = useNavigate();
  const { submitAttempt } = useAttempt();

  // ── Core States ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState("setup"); // "setup" | "playing" | "results"
  const [difficulty, setDifficulty] = useState("Medium");

  // ── Game Session States ──────────────────────────────────────────────────
  const [currentRound, setCurrentRound] = useState(1);
  const [challenge, setChallenge] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // Timer & Metrics
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [roundResults, setRoundResults] = useState([]); // { round, sequence: clues, studentAnswer, correctAnswer, isCorrect, rule }

  const timerRef = useRef(null);

  // ── Start Game ──────────────────────────────────────────────────────────
  const startGame = () => {
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setElapsedSeconds(0);
    setCurrentRound(1);
    setRoundResults([]);
    loadChallenge("Medium");
    setPhase("playing");
  };

  // ── Load Challenge ──────────────────────────────────────────────────────
  const loadChallenge = (diffOverride = null) => {
    const nextDiff = diffOverride || difficulty;
    const nextChallenge = getUniqueQuestion(`elimination-grid-${nextDiff}`, () => generateEliminationGrid(nextDiff), (q) => JSON.stringify(q.clues));
    setChallenge(nextChallenge);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrectAnswer(false);
  };

  // ── Timer Effect ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "playing" && !isAnswered) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isAnswered]);

  // ── Handle Answer ───────────────────────────────────────────────────────
  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = String(opt.text) === String(challenge.answer);
    setIsCorrectAnswer(isCorrect);

    // Update streak
    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > bestStreak) {
      setBestStreak(newStreak);
    }

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    }

    setRoundResults((prev) => [
      ...prev,
      {
        round: currentRound,
        sequence: challenge.clues, // Save clues as the sequence representation for review
        studentAnswer: opt.text,
        correctAnswer: challenge.answer,
        isCorrect,
        rule: challenge.rule
      }
    ]);
  };

  // ── Next Round ──────────────────────────────────────────────────────────
  const handleNextRound = () => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound((r) => r + 1);
      loadChallenge();
    } else {
      // Game Complete! Submit results to context and redirect
      const accuracyPercent = Math.round((correctCount / TOTAL_ROUNDS) * 100);
      const score = correctCount * 20;

      // Calculate Deductive Reasoning Score
      const diffMultiplier = difficulty === "Hard" ? 1.2 : difficulty === "Medium" ? 1.0 : 0.8;
      const deductiveScore = Math.round(accuracyPercent * diffMultiplier);

      submitAttempt(
        puzzle.id,
        elapsedSeconds,
        accuracyPercent >= 80,
        score,
        accuracyPercent,
        difficulty,
        {
          questionsSolved: correctCount,
          bestStreak,
          deductiveReasoningScore: deductiveScore,
          roundResults
        }
      );

      navigate(`/result/${puzzle.id}`);
    }
  };

  // Format timer
  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${mins}:${s}`;
  };

  return (
    <main className="saathi-screen flex flex-col justify-between">
      <div className="phone-frame px-4 py-6 flex flex-col justify-between overflow-y-auto">
        
        {/* ── SETUP PHASE ──────────────────────────────────────────────────── */}
        {phase === "setup" && (
          <PuzzleIntroduction
            type="elimination-grid"
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onStart={startGame}
            onBack={() => navigate("/")}
            title="Elimination Grid Challenge"
          />
        )}

        {/* ── PLAYING PHASE ────────────────────────────────────────────────── */}
        {phase === "playing" && challenge && (
          <div className="flex-1 flex flex-col justify-between animate-[brain-fade-in-up_0.4s_ease-out]">
            <div>
              {/* Header Info */}
              <header className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setPhase("setup")}
                  className="p-2 -ml-2 rounded-xl hover:bg-saathi-line transition text-saathi-ink"
                  aria-label="Back to setup"
                >
                  <ArrowLeft size={18} />
                </button>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                  difficulty === "Hard"
                    ? "bg-red-50 text-saathi-red border border-red-200"
                    : difficulty === "Medium"
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "bg-emerald-50 text-saathi-green border border-emerald-200"
                }`}>
                  {difficulty}
                </span>
              </header>

              {/* Performance Indicators */}
              <div className="grid grid-cols-4 gap-2 mb-5 text-center text-xs">
                <div className="bg-white border border-saathi-line rounded-xl p-2 shadow-sm">
                  <Clock className="mx-auto text-saathi-indigo mb-0.5 animate-pulse" size={14} />
                  <span className="block font-black text-saathi-ink">{formatTimer(elapsedSeconds)}</span>
                  <span className="text-[9px] font-bold text-saathi-muted uppercase">Timer</span>
                </div>
                <div className="bg-white border border-saathi-line rounded-xl p-2 shadow-sm">
                  <Target className="mx-auto text-saathi-green mb-0.5" size={14} />
                  <span className="block font-black text-saathi-ink">
                    {currentRound > 1 ? Math.round((correctCount / (currentRound - (isAnswered ? 0 : 1))) * 100) : 0}%
                  </span>
                  <span className="text-[9px] font-bold text-saathi-muted uppercase">Accuracy</span>
                </div>
                <div className="bg-white border border-saathi-line rounded-xl p-2 shadow-sm">
                  <Trophy className="mx-auto text-saathi-amber mb-0.5" size={14} />
                  <span className="block font-black text-saathi-ink">{correctCount * 20}</span>
                  <span className="text-[9px] font-bold text-saathi-muted uppercase">Score</span>
                </div>
                <div className="bg-white border border-saathi-line rounded-xl p-2 shadow-sm">
                  <Flame className="mx-auto text-saathi-red mb-0.5" size={14} />
                  <span className="block font-black text-saathi-ink">{streak}</span>
                  <span className="text-[9px] font-bold text-saathi-muted uppercase">Streak</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-bold text-saathi-muted mb-1.5">
                  <span>ROUND PROGRESS</span>
                  <span>{currentRound - 1} / {TOTAL_ROUNDS}</span>
                </div>
                <div className="w-full h-2.5 bg-saathi-line rounded-full overflow-hidden">
                  <div
                    className="h-full bg-saathi-indigo rounded-full transition-all duration-300"
                    style={{ width: `${((currentRound - 1) / TOTAL_ROUNDS) * 100}%` }}
                  />
                </div>
              </div>

              {/* Clues Card */}
              <div className="bg-white rounded-2xl border border-saathi-line p-5 shadow-card mb-6">
                <p className="text-[10px] font-extrabold uppercase text-saathi-muted tracking-wider mb-3">
                  Logical Clues
                </p>
                <div className="space-y-2 text-left bg-gray-50/50 p-4 rounded-xl border border-saathi-line mb-4 font-semibold text-sm text-saathi-ink">
                  {challenge.clues.map((clue, idx) => (
                    <p key={idx} className="flex gap-2">
                      <span className="text-saathi-indigo">•</span>
                      <span>{clue}</span>
                    </p>
                  ))}
                </div>
                <h3 className="text-center text-sm font-extrabold text-saathi-ink leading-snug">
                  {challenge.question}
                </h3>
              </div>

              {/* ── ANSWER INTERFACE ── */}
              <div className="grid grid-cols-2 gap-3">
                {challenge.options.map((opt) => {
                  let btnClass = "border p-4 rounded-[22px] flex flex-col items-center justify-center min-h-[80px] bg-white shadow-card transition-all duration-300 ";
                  if (isAnswered) {
                    const isCorrectOpt = String(opt.text) === String(challenge.answer);
                    const isSelectedOpt = selectedOption?.id === opt.id;
                    
                    if (isCorrectOpt) {
                      btnClass += "border-saathi-green bg-emerald-50 text-saathi-green ring-2 ring-saathi-green scale-[1.02] font-extrabold";
                    } else if (isSelectedOpt) {
                      btnClass += "border-saathi-red bg-red-50 text-saathi-red ring-2 ring-saathi-red scale-[0.98]";
                    } else {
                      btnClass += "opacity-50 border-saathi-line cursor-not-allowed";
                    }
                  } else {
                    btnClass += "border-saathi-line hover:border-saathi-indigo hover:text-saathi-indigo hover:scale-[1.02] active:scale-[0.98] cursor-pointer hover:shadow-lg";
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      disabled={isAnswered}
                      className={btnClass}
                    >
                      <span className="text-lg font-black">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── FEEDBACK PANEL ── */}
              {isAnswered && (
                <div
                  className={`mt-4 p-5 rounded-2xl border ${
                    isCorrectAnswer
                      ? "bg-emerald-50 border-emerald-200 text-saathi-green"
                      : "bg-red-50 border-red-200 text-saathi-red"
                  } shadow-sm animate-[brain-fade-in-up_0.3s_ease-out]`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full text-white text-xs font-black shadow-sm ${
                        isCorrectAnswer ? "bg-saathi-green animate-[brain-scale-in_0.4s_ease-out]" : "bg-saathi-red"
                      }`}
                    >
                      {isCorrectAnswer ? "✓" : "!"}
                    </span>
                    <span className="font-extrabold text-sm uppercase">
                      {isCorrectAnswer ? "Correct Answer!" : "Incorrect"}
                    </span>
                  </div>

                  <p className="text-xs text-saathi-ink font-semibold leading-relaxed mb-4 whitespace-pre-line">
                    {challenge.explanation}
                  </p>

                  <div className="p-3 bg-white/90 border border-saathi-line rounded-xl text-xs font-bold text-saathi-indigo shadow-inner">
                    <span className="text-[10px] font-black uppercase text-saathi-muted block mb-0.5">
                      Pattern Rule
                    </span>
                    {challenge.rule}
                  </div>

                  <button
                    onClick={handleNextRound}
                    className="w-full mt-5 py-3.5 bg-saathi-indigo hover:bg-saathi-indigoDark text-white font-extrabold rounded-2xl transition duration-200 shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {currentRound < TOTAL_ROUNDS ? "Next Question" : "See Final Results"}
                    </span>
                    <Sparkles size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
