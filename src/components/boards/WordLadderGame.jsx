import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Target, Trophy, Flame, Play, Sparkles, ChevronDown, Check, AlertCircle } from "lucide-react";
import { generateWordLadders } from "../../utils/generators/wordLadderGenerator";
import { useAttempt } from "../../context/AttemptContext";
import PrimaryButton from "../PrimaryButton";
import DifficultySelector from "../DifficultySelector";
import PuzzleIntroduction from "../PuzzleIntroduction";
import { getUniqueQuestion } from "../../utils/nonRepeatingGenerator";

const TOTAL_ROUNDS = 5;

export default function WordLadderGame({ puzzle }) {
  const navigate = useNavigate();
  const { submitAttempt } = useAttempt();

  // ── Core States ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState("setup"); // "setup" | "playing"
  const [difficulty, setDifficulty] = useState("Medium");

  // ── Game Session States ──────────────────────────────────────────────────
  const [currentRound, setCurrentRound] = useState(1);
  const [challenges, setChallenges] = useState([]);
  const [activeSlotIdx, setActiveSlotIdx] = useState(1); // Index of the slot being edited
  const [userAnswers, setUserAnswers] = useState({}); // { levelIndex: word }
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // Timer & Metrics
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [roundResults, setRoundResults] = useState([]); // { round, sequence, studentAnswer, correctAnswer, isCorrect, rule }

  const timerRef = useRef(null);

  // ── Start Game ──────────────────────────────────────────────────────────
  const startGame = () => {
    const list = getUniqueQuestion(`word-ladders-${difficulty}`, () => generateWordLadders(difficulty), (l) => l.map(c => c.startWord + "-" + c.endWord).join(","));
    setChallenges(list);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setElapsedSeconds(0);
    setCurrentRound(1);
    setUserAnswers({});
    setIsAnswered(false);
    setIsCorrectAnswer(false);
    setRoundResults([]);
    setPhase("playing");
    
    // Set active slot to the first slot level
    if (list[0]) {
      const firstSlot = list[0].levels.find(l => l.isSlot);
      if (firstSlot) setActiveSlotIdx(firstSlot.index);
    }
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

  // Auto-advance or choose active slot when clicking on slot
  const handleSlotClick = (idx) => {
    if (isAnswered) return;
    setActiveSlotIdx(idx);
  };

  // ── Option Select ────────────────────────────────────────────────────────
  const handleSelectOption = (wordText) => {
    if (isAnswered) return;
    
    // Set selected word for this slot
    setUserAnswers(prev => ({
      ...prev,
      [activeSlotIdx]: wordText
    }));

    // Find the next unfilled slot
    const slots = activeChallenge.levels.filter(l => l.isSlot);
    const currentSlotPos = slots.findIndex(s => s.index === activeSlotIdx);
    
    // Find if there is another empty slot after this one
    let nextSlot = slots.slice(currentSlotPos + 1).find(s => !userAnswers[s.index] || s.index === activeSlotIdx);
    if (!nextSlot) {
      // Find any unfilled slot starting from beginning
      nextSlot = slots.find(s => s.index !== activeSlotIdx && (!userAnswers[s.index] || userAnswers[s.index] === ""));
    }

    if (nextSlot) {
      setActiveSlotIdx(nextSlot.index);
    }
  };

  // Check if all slots are filled
  const allSlotsFilled = activeChallenge 
    ? activeChallenge.levels.filter(l => l.isSlot).every(l => userAnswers[l.index])
    : false;

  // ── Submit Answer ────────────────────────────────────────────────────────
  const handleSubmitAnswer = () => {
    if (!allSlotsFilled || isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnswered(true);

    // Verify answers for all slots
    const isCorrect = activeChallenge.levels.every(l => {
      if (!l.isSlot) return true;
      return userAnswers[l.index] === l.correctWord;
    });

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

    // Build paths for review
    const studentPath = activeChallenge.levels.map(l => {
      if (l.isSlot) return userAnswers[l.index] || "???";
      return l.word;
    });

    const correctPathStr = activeChallenge.path.join(" → ");

    setRoundResults((prev) => [
      ...prev,
      {
        round: currentRound,
        sequence: activeChallenge.path, // Store correct path as sequence
        studentAnswer: studentPath.join(" → "),
        correctAnswer: correctPathStr,
        isCorrect,
        rule: `Ladder Path: ${correctPathStr}`
      }
    ]);
  };

  // ── Next Round ──────────────────────────────────────────────────────────
  const handleNextRound = () => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound((r) => r + 1);
      setUserAnswers({});
      setIsAnswered(false);
      setIsCorrectAnswer(false);
      
      const nextChallenge = challenges[currentRound];
      if (nextChallenge) {
        const firstSlot = nextChallenge.levels.find(l => l.isSlot);
        if (firstSlot) setActiveSlotIdx(firstSlot.index);
      }
    } else {
      // Game Complete!
      const accuracyPercent = Math.round((correctCount / TOTAL_ROUNDS) * 100);
      const score = correctCount * 20;

      // Scale metrics
      const diffMultiplier = difficulty === "Hard" ? 1.2 : difficulty === "Medium" ? 1.0 : 0.8;
      const ladderScore = Math.round(accuracyPercent * diffMultiplier);

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
          patternRecognitionScore: ladderScore,
          vocabularyScore: ladderScore,
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

  const activeLevelConfig = activeChallenge?.levels.find(l => l.index === activeSlotIdx);

  return (
    <main className="saathi-screen flex flex-col justify-between">
      <div className="phone-frame px-4 py-6 flex flex-col justify-between overflow-y-auto">
        
        {/* ── SETUP PHASE ──────────────────────────────────────────────────── */}
        {phase === "setup" && (
          <PuzzleIntroduction
            type="word-ladder"
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onStart={startGame}
            onBack={() => navigate("/")}
            title="Word Ladder Challenge"
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
                  <span>{currentRound} / {TOTAL_ROUNDS}</span>
                </div>
                <div className="w-full h-2.5 bg-saathi-line rounded-full overflow-hidden">
                  <div
                    className="h-full bg-saathi-indigo rounded-full transition-all duration-300"
                    style={{ width: `${(currentRound / TOTAL_ROUNDS) * 100}%` }}
                  />
                </div>
              </div>

              {/* Ladder Visual Board */}
              <div className="bg-white rounded-2xl border border-saathi-line p-5 shadow-card mb-6">
                <p className="text-[10px] font-extrabold uppercase text-saathi-muted tracking-wider mb-4 text-center">
                  Word Ladder
                </p>

                <div className="flex flex-col items-center gap-1">
                  {activeChallenge.levels.map((level, lIdx) => {
                    const isStart = lIdx === 0;
                    const isEnd = lIdx === activeChallenge.levels.length - 1;
                    const isSlot = level.isSlot;
                    
                    let slotClass = "w-36 py-2.5 rounded-xl border-2 text-center text-base font-black shadow-sm transition-all duration-300 ";
                    let wordToShow = level.word;
                    
                    if (isStart || isEnd) {
                      slotClass += "border-saathi-line bg-gray-50 text-saathi-ink cursor-default";
                      wordToShow = level.word;
                    } else if (isSlot) {
                      const userWord = userAnswers[level.index];
                      wordToShow = userWord || "?";
                      
                      if (isAnswered) {
                        const isCorrectSlot = userWord === level.correctWord;
                        if (isCorrectSlot) {
                          slotClass += "border-saathi-green bg-emerald-50 text-saathi-green";
                        } else {
                          slotClass += "border-saathi-red bg-red-50 text-saathi-red";
                          wordToShow = `${userWord || "?"} (→ ${level.correctWord})`;
                        }
                      } else {
                        const isActive = level.index === activeSlotIdx;
                        if (isActive) {
                          slotClass += "border-saathi-indigo bg-indigo-50 text-saathi-indigo ring-2 ring-indigo-200 cursor-pointer scale-[1.03]";
                        } else {
                          slotClass += userWord 
                            ? "border-saathi-line bg-white text-saathi-ink cursor-pointer hover:border-saathi-indigo" 
                            : "border-dashed border-saathi-muted bg-white text-saathi-muted cursor-pointer hover:border-saathi-indigo";
                        }
                      }
                    }

                    return (
                      <React.Fragment key={lIdx}>
                        {lIdx > 0 && <ChevronDown size={14} className="text-saathi-muted py-0.5 animate-pulse" />}
                        <button
                          onClick={() => isSlot && handleSlotClick(level.index)}
                          disabled={!isSlot || isAnswered}
                          className={slotClass}
                        >
                          {wordToShow}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* ── MULTIPLE CHOICE OPTIONS (Only show when not answered and a slot is selected) ── */}
              {!isAnswered && activeLevelConfig && (
                <div className="animate-[brain-fade-in_0.3s_ease-out]">
                  <p className="text-[10px] font-black uppercase text-saathi-muted tracking-wider text-left mb-2">
                    Choose word for the highlighted slot:
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {activeLevelConfig.options.map((opt) => {
                      const isSelected = userAnswers[activeSlotIdx] === opt.text;
                      let optClass = "border p-4 rounded-[22px] flex flex-col items-center justify-center min-h-[76px] bg-white shadow-card transition-all duration-300 cursor-pointer ";
                      if (isSelected) {
                        optClass += "border-saathi-indigo bg-indigo-50 text-saathi-indigo ring-2 ring-indigo-200 font-extrabold scale-[1.02]";
                      } else {
                        optClass += "border-saathi-line hover:border-saathi-indigo hover:text-saathi-indigo hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg";
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt.text)}
                          className={optClass}
                        >
                          <span className="text-sm font-black tracking-wide">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Button (Only show when all slots filled and not answered) */}
              {!isAnswered && allSlotsFilled && (
                <button
                  onClick={handleSubmitAnswer}
                  className="w-full mt-2 py-4 bg-saathi-green hover:bg-emerald-600 text-white font-extrabold rounded-2xl transition duration-200 shadow-md flex items-center justify-center gap-1.5 animate-[brain-scale-in_0.3s_ease-out]"
                >
                  <Check size={18} strokeWidth={2.4} />
                  <span>Submit Ladder</span>
                </button>
              )}

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
                      {isCorrectAnswer ? "Ladder Completed!" : "Incorrect Ladder"}
                    </span>
                  </div>

                  <p className="text-xs text-saathi-ink font-semibold leading-relaxed mb-4 text-left">
                    {isCorrectAnswer 
                      ? "Fantastic! You successfully solved the word ladder. Every step changes exactly one letter."
                      : "Some words on your ladder did not match the correct path. Review the correct transitions below."}
                  </p>

                  <div className="p-3 bg-white/95 border border-saathi-line rounded-xl text-xs font-bold text-saathi-indigo shadow-inner text-center">
                    <span className="text-[10px] font-black uppercase text-saathi-muted block mb-1 text-left">
                      Correct Path
                    </span>
                    <span className="text-sm font-black tracking-wide text-saathi-ink">
                      {activeChallenge.path.join(" → ")}
                    </span>
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
