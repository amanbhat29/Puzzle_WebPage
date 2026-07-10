import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Target, Trophy, Flame, Play, Sparkles, ChevronRight } from "lucide-react";
import { generateWordDetective } from "../../utils/generators/wordDetectiveGenerator";
import { useAttempt } from "../../context/AttemptContext";
import PrimaryButton from "../PrimaryButton";
import DifficultySelector from "../DifficultySelector";
import PuzzleIntroduction from "../PuzzleIntroduction";
import { getUniqueQuestion } from "../../utils/nonRepeatingGenerator";

const TOTAL_ROUNDS = 5;

export default function WordDetectiveGame({ puzzle }) {
  const navigate = useNavigate();
  const { submitAttempt } = useAttempt();

  // ── Core States ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState("setup"); // "setup" | "playing"
  const [difficulty, setDifficulty] = useState("Medium");

  // ── Game Session States ──────────────────────────────────────────────────
  const [currentRound, setCurrentRound] = useState(1);
  const [challenges, setChallenges] = useState([]);
  const [cluesVisibleCount, setCluesVisibleCount] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // Timer & Metrics
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [roundResults, setRoundResults] = useState([]); // { round, sequence: clues, studentAnswer, correctAnswer, isCorrect, rule: explanation }

  const timerRef = useRef(null);

  // ── Start Game ──────────────────────────────────────────────────────────
  const startGame = () => {
    const list = getUniqueQuestion(`word-detective-${difficulty}`, () => generateWordDetective(difficulty), (l) => l.map(c => c.word).join(','));
    setChallenges(list);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setElapsedSeconds(0);
    setCurrentRound(1);
    setCluesVisibleCount(1);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrectAnswer(false);
    setRoundResults([]);
    setPhase("playing");
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

  const activeChallenge = challenges[currentRound - 1];

  // ── Handle Answer ───────────────────────────────────────────────────────
  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt.text === activeChallenge.answer;
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
        sequence: activeChallenge.clueList, // Save clues for review
        studentAnswer: opt.text,
        correctAnswer: activeChallenge.answer,
        isCorrect,
        rule: activeChallenge.explanation
      }
    ]);
  };

  // ── Next Round ──────────────────────────────────────────────────────────
  const handleNextRound = () => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound((r) => r + 1);
      setCluesVisibleCount(1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrectAnswer(false);
    } else {
      // Game Complete!
      const accuracyPercent = Math.round((correctCount / TOTAL_ROUNDS) * 100);
      
      // Points scored. Earlier correct answers give higher points.
      // E.g., if correct, score = 100 - (cluesVisibleCount - 1) * scaling
      // Easy scaling (3 clues): 100, 75, 50
      // Medium scaling (4 clues): 100, 80, 60, 40
      // Hard scaling (5 clues): 100, 80, 60, 40, 20
      // Let's compute average score of correct rounds
      const score = roundResults.reduce((sum, res, idx) => {
        if (!res.isCorrect) return sum;
        // Find clues shown for this round
        const cluesShown = res.sequence.length; // wait, no, cluesVisibleCount is a state. We should store it or calculate from clues visible.
        // Let's make it simple. We can compute it in handleSelectOption.
        return sum + 20; // 20 points per correct answer, so max 100 points
      }, 0);

      // Compute custom Vocabulary Score (which scales with earlier guesses)
      // If correct at clue 1: 100 points, clue 2: 80 points, etc.
      // Let's calculate the reasoning/vocab score from the results:
      const totalPoints = roundResults.reduce((sum, res) => {
        if (!res.isCorrect) return sum;
        // We can estimate how many clues were visible. Let's record the cluesVisibleCount in roundResults.
        // Let's modify handleSelectOption to store cluesVisibleCount.
        return sum + res.points;
      }, 0);

      // Submit attempt and navigate to ResultPage
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
          vocabularyScore: Math.round(totalPoints / TOTAL_ROUNDS),
          reasoningScore: Math.round(totalPoints / TOTAL_ROUNDS),
          roundResults: roundResults.map(res => ({
            ...res,
            points: undefined // remove temp points property from local storage to clean up
          }))
        }
      );

      navigate(`/result/${puzzle.id}`);
    }
  };

  // Enhance handleSelectOption to support point calculations
  const handleSelectOptionWithPoints = (opt) => {
    if (isAnswered) return;
    
    // Points calculation:
    let points = 0;
    if (opt.text === activeChallenge.answer) {
      if (difficulty === "Easy") {
        points = 100 - (cluesVisibleCount - 1) * 25; // 100, 75, 50
      } else {
        points = 100 - (cluesVisibleCount - 1) * 20; // 100, 80, 60, 40, 20
      }
    }
    
    // Update roundResults state using a helper callback
    handleSelectOption(opt);
    setRoundResults((prev) => {
      const updated = [...prev];
      if (updated[updated.length - 1]) {
        updated[updated.length - 1].points = points;
      }
      return updated;
    });
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
            type="word-detective"
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onStart={startGame}
            onBack={() => navigate("/")}
            title="Mystery Word Detective"
          />
        )}

        {/* ── PLAYING PHASE ────────────────────────────────────────────────── */}
        {phase === "playing" && activeChallenge && (
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
                  <Clock className="mx-auto text-saathi-indigo mb-0.5" size={14} />
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
                  <span className="block font-black text-saathi-ink">
                    {roundResults.reduce((sum, r) => sum + (r.points || 0), 0)}
                  </span>
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
                  <span>{currentRound} / {TOTAL_ROUNDS}</span>
                </div>
                <div className="w-full h-2.5 bg-saathi-line rounded-full overflow-hidden">
                  <div
                    className="h-full bg-saathi-indigo rounded-full transition-all duration-300"
                    style={{ width: `${(currentRound / TOTAL_ROUNDS) * 100}%` }}
                  />
                </div>
              </div>

              {/* Mystery Clues Card */}
              <div className="bg-white rounded-2xl border border-saathi-line p-5 shadow-card mb-5">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] font-extrabold uppercase text-saathi-muted tracking-wider">
                    Category: <span className="text-saathi-indigo">{activeChallenge.category}</span>
                  </p>
                  <span className="text-[10px] font-extrabold text-saathi-muted">
                    Clues Revealed: {cluesVisibleCount} / {activeChallenge.clueList.length}
                  </span>
                </div>

                {/* Clues List */}
                <div className="space-y-2.5 min-h-[160px] bg-slate-50 p-4 rounded-xl border border-dashed border-saathi-line text-left flex flex-col justify-center">
                  {activeChallenge.clueList.slice(0, cluesVisibleCount).map((clue, idx) => (
                    <div key={idx} className="flex gap-2.5 animate-[brain-fade-in_0.3s_ease-out]">
                      <span className="text-saathi-indigo font-black text-sm mt-0.5">•</span>
                      <p className="text-xs font-bold text-saathi-ink leading-relaxed">
                        {clue}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Next Clue Button */}
                {!isAnswered && cluesVisibleCount < activeChallenge.clueList.length && (
                  <button
                    onClick={() => setCluesVisibleCount(prev => prev + 1)}
                    className="mt-3.5 mx-auto text-xs font-black text-saathi-indigo hover:text-saathi-indigoDark hover:underline flex items-center gap-1 transition duration-150"
                  >
                    <span>Reveal Next Clue</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {/* ── ANSWER OPTIONS (Large option cards) ── */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {activeChallenge.options.map((opt) => {
                  let btnClass = "border p-4 rounded-[22px] flex flex-col items-center justify-center min-h-[84px] bg-white shadow-card transition-all duration-300 ";
                  if (isAnswered) {
                    const isCorrectOpt = opt.text === activeChallenge.answer;
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
                      onClick={() => handleSelectOptionWithPoints(opt)}
                      disabled={isAnswered}
                      className={btnClass}
                    >
                      <span className="text-sm font-black tracking-wide">{opt.text}</span>
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
                      {isCorrectAnswer ? "Correct Answer!" : `Incorrect. It is ${activeChallenge.answer}.`}
                    </span>
                  </div>

                  <p className="text-xs text-saathi-ink font-semibold leading-relaxed mb-4 text-left">
                    {activeChallenge.explanation}
                  </p>

                  <button
                    onClick={handleNextRound}
                    className="w-full mt-2 py-3.5 bg-saathi-indigo hover:bg-saathi-indigoDark text-white font-extrabold rounded-2xl transition duration-200 shadow-md flex items-center justify-center gap-1.5"
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
