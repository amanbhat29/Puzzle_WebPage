import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, CheckCircle, XCircle, Star, RotateCcw, Sparkles } from 'lucide-react';
import { generatePatternChallenge } from '../../utils/generators/patternGenerator';
import { savePuzzleResult } from '../../utils/storage';
import { getUniqueQuestion } from '../../utils/nonRepeatingGenerator';

// ═══════════════════════════════════════════════════════════════════════════
// RuleDiscoveryPage — A pattern sequence discovery game with 10 rounds.
// Self-contained page with sub-components inline.
// ═══════════════════════════════════════════════════════════════════════════

const TOTAL_ROUNDS = 10;

export default function RuleDiscoveryPage() {
  const navigate = useNavigate();

  // ── Core State ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'results'
  const [difficulty, setDifficulty] = useState('easy');

  // ── Game State ──────────────────────────────────────────────────────────
  const [currentRound, setCurrentRound] = useState(1);
  const [challenge, setChallenge] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null); // { id, text } or null
  const [isAnswered, setIsAnswered] = useState(false);
  const [roundTimer, setRoundTimer] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [showHintToast, setShowHintToast] = useState(false);

  // Stats and History
  const [roundResults, setRoundResults] = useState([]); // Array of { round, sequence, studentAnswer, correctAnswer, isCorrect, rule, timeMs }
  const [correctCount, setCorrectCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  // Refs
  const timerIntervalRef = useRef(null);
  const roundStartTimeRef = useRef(0);

  // ── Start Game ──────────────────────────────────────────────────────────
  const startGame = () => {
    setRoundResults([]);
    setCorrectCount(0);
    setTotalTime(0);
    setCurrentRound(1);
    setHintsLeft(3);
    loadChallenge(1, difficulty);
    setPhase('playing');
  };

  // ── Load Challenge ──────────────────────────────────────────────────────
  const loadChallenge = useCallback((roundNum, diff) => {
    const newChallenge = getUniqueQuestion(`rule-discovery-${diff}`, () => generatePatternChallenge(diff), (q) => JSON.stringify(q.sequence));
    setChallenge(newChallenge);
    setSelectedOption(null);
    setIsAnswered(false);
    setRoundTimer(0);
    setShowHintToast(false);
    roundStartTimeRef.current = Date.now();
  }, []);

  // ── Timer Effect ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'playing' && !isAnswered) {
      timerIntervalRef.current = setInterval(() => {
        setRoundTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [phase, isAnswered]);

  // ── Persist result on results phase ────────────────────────────────────
  useEffect(() => {
    if (phase === 'results') {
      savePuzzleResult({
        puzzleId: 8,
        score: correctCount * 10,
        accuracy: Math.round((correctCount / TOTAL_ROUNDS) * 100),
        timeTaken: Math.round(totalTime / 1000),
        hintsUsed: 3 - hintsLeft
      });
    }
  }, [phase, correctCount, totalTime, hintsLeft]);

  // ── Select Option ───────────────────────────────────────────────────────
  const handleSelectOption = (option) => {
    if (isAnswered) return;
    
    clearInterval(timerIntervalRef.current);
    setSelectedOption(option);
    setIsAnswered(true);

    const timeSpentMs = Date.now() - roundStartTimeRef.current;
    const isCorrect = String(option.text) === String(challenge.answer);

    const resultEntry = {
      round: currentRound,
      sequence: [...challenge.sequence],
      studentAnswer: option.text,
      correctAnswer: challenge.answer,
      isCorrect,
      rule: challenge.rule,
      timeMs: timeSpentMs,
    };

    setRoundResults((prev) => [...prev, resultEntry]);
    setTotalTime((prev) => prev + timeSpentMs);
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentRound < TOTAL_ROUNDS) {
        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);
        loadChallenge(nextRound, difficulty);
      } else {
        // Calculate Streak
        let currentStreak = 0;
        let maxStreak = 0;
        const finalResults = [...roundResults, resultEntry];
        finalResults.forEach((res) => {
          if (res.isCorrect) {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
          } else {
            currentStreak = 0;
          }
        });
        setLongestStreak(maxStreak);
        setPhase('results');
      }
    }, 2000);
  };

  // ── Trigger Hint ────────────────────────────────────────────────────────
  const triggerHint = () => {
    if (hintsLeft <= 0 || isAnswered) return;
    setShowHintToast(true);
    setHintsLeft((prev) => prev - 1);
    // Hide toast after 4 seconds
    setTimeout(() => {
      setShowHintToast(false);
    }, 4000);
  };

  // ── Star Calculation ────────────────────────────────────────────────────
  let starRating = 1;
  const accuracyPercent = Math.round((correctCount / TOTAL_ROUNDS) * 100);
  if (accuracyPercent >= 90) starRating = 5;
  else if (accuracyPercent >= 75) starRating = 4;
  else if (accuracyPercent >= 60) starRating = 3;
  else if (accuracyPercent >= 40) starRating = 2;

  // Format total seconds into MM:SS
  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <main className="saathi-screen">
      <div className="phone-frame px-4 py-6 flex flex-col justify-between">
        
        {/* SETUP PHASE */}
        {phase === 'setup' && (
          <div className="flex-1 flex flex-col justify-between" style={{ animation: 'brain-fade-in-up 0.5s ease-out' }}>
            <div>
              <header className="flex items-center gap-3 mb-6">
                <button 
                  onClick={() => navigate('/')} 
                  className="p-2 rounded-xl hover:bg-saathi-line transition text-saathi-ink"
                  aria-label="Back to landing page"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <p className="text-xs font-bold text-saathi-indigo">Class Saathi Brain Training</p>
                  <h1 className="text-2xl font-extrabold text-saathi-ink flex items-center gap-2">
                    🔍 Rule Discovery
                  </h1>
                </div>
              </header>

              <p className="text-sm font-semibold text-saathi-muted mb-6 leading-relaxed">
                Find the hidden mathematical or visual pattern in each sequence and identify the next missing element.
              </p>

              {/* Difficulty Selector */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-saathi-ink uppercase tracking-wider mb-2">
                  Select Difficulty
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['easy', 'medium', 'hard'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`py-3 px-4 rounded-2xl text-sm font-bold border transition duration-200 capitalize ${
                        difficulty === diff
                          ? diff === 'easy'
                            ? 'bg-emerald-50 text-saathi-green border-saathi-green shadow-sm'
                            : diff === 'medium'
                            ? 'bg-amber-50 text-amber-600 border-amber-500 shadow-sm'
                            : 'bg-red-50 text-saathi-red border-saathi-red shadow-sm'
                          : 'bg-white text-saathi-ink border-saathi-line hover:border-saathi-indigo'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rules card */}
              <div className="bg-white rounded-2xl p-5 border border-saathi-line shadow-card mb-6">
                <h3 className="text-sm font-bold text-saathi-ink mb-3">Discovery Rules:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-xs font-medium text-saathi-muted">
                    <span className="w-5 h-5 rounded-full bg-saathi-indigo text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <span>Observe the progress of the sequence from left to right.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs font-medium text-saathi-muted">
                    <span className="w-5 h-5 rounded-full bg-saathi-indigo text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <span>Identify the missing element marked with <b>?</b>.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs font-medium text-saathi-muted">
                    <span className="w-5 h-5 rounded-full bg-saathi-indigo text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                    <span>Complete 10 progressive rounds. Use your 3 hints wisely.</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={startGame}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-saathi-indigo px-5 text-base font-bold text-white shadow-saathi transition hover:bg-saathi-indigoDark active:scale-[0.98] w-full"
            >
              Start Discovery
            </button>
          </div>
        )}

        {/* PLAYING PHASE */}
        {phase === 'playing' && challenge && (
          <div className="flex-1 flex flex-col justify-between relative">
            <div>
              {/* Stepper HUD */}
              <header className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-saathi-indigo">Round {currentRound - 1} of {TOTAL_ROUNDS}</span>
                  <span className="text-xs font-semibold text-saathi-muted">Time: {roundTimer}s</span>
                  
                  {/* Hint Button */}
                  <button
                    onClick={triggerHint}
                    disabled={hintsLeft <= 0 || isAnswered}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                      hintsLeft > 0 && !isAnswered
                        ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
                        : 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed'
                    }`}
                  >
                    <Lightbulb size={13} />
                    <span>{hintsLeft} hints</span>
                  </button>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-saathi-indigo transition-all duration-300"
                    style={{ width: `${((currentRound - 1) / TOTAL_ROUNDS) * 100}%` }}
                  />
                </div>
              </header>

              {/* Hint Toast overlay */}
              {showHintToast && (
                <div className="absolute top-14 left-0 right-0 z-20 bg-amber-50 border border-amber-200 rounded-2xl p-3 shadow-md text-amber-700 text-xs font-bold text-center animate-bounce">
                  💡 Hint: {challenge.hintText}
                </div>
              )}

              {/* Sequence Display */}
              <section className="bg-white rounded-2xl p-6 border border-saathi-line shadow-card mb-6 mt-4 flex flex-col items-center">
                <p className="text-[10px] font-bold text-saathi-muted uppercase tracking-wider mb-4">Complete the sequence</p>
                
                <div className="flex flex-wrap gap-2 justify-center items-center">
                  {challenge.sequence.map((term, idx) => {
                    const isQuestion = term === '?';
                    return (
                      <div
                        key={idx}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border flex items-center justify-center text-xl font-extrabold shadow-sm transition-all duration-300 ${
                          isQuestion
                            ? 'bg-indigo-50 border-saathi-indigo border-dashed text-saathi-indigo scale-105 animate-pulse shadow-md'
                            : 'bg-white border-saathi-line text-saathi-ink'
                        }`}
                      >
                        {term}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Multiple Choice Options Grid */}
              <section className="grid grid-cols-2 gap-3 mb-6">
                {challenge.options.map((opt) => {
                  const isSelected = selectedOption && selectedOption.id === opt.id;
                  const isCorrectAnswer = String(opt.text) === String(challenge.answer);
                  
                  let cardStyle = 'bg-white border-saathi-line text-saathi-ink hover:border-saathi-indigo hover:shadow';
                  let icon = null;

                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      cardStyle = 'bg-emerald-50 border-saathi-green text-saathi-green ring-2 ring-emerald-100 scale-[1.02]';
                      icon = <CheckCircle size={16} className="text-saathi-green shrink-0" />;
                    } else if (isSelected) {
                      cardStyle = 'bg-red-50 border-saathi-red text-saathi-red ring-2 ring-red-100 scale-[0.98]';
                      icon = <XCircle size={16} className="text-saathi-red shrink-0" />;
                    } else {
                      cardStyle = 'bg-gray-50 border-saathi-line text-gray-400 opacity-60';
                    }
                  } else if (isSelected) {
                    cardStyle = 'bg-indigo-50 border-saathi-indigo text-saathi-indigo';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      disabled={isAnswered}
                      className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-extrabold text-base transition-all duration-200 select-none ${cardStyle}`}
                    >
                      {icon}
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </section>
            </div>

            {/* Revealed Rule (Shown during feedback) */}
            {isAnswered && (
              <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 text-center animate-brain-slide-in-right">
                <span className="text-[9px] font-bold text-saathi-indigo uppercase tracking-wider">Pattern Rule Discovered</span>
                <p className="text-sm font-extrabold text-saathi-ink mt-1 flex items-center justify-center gap-1.5">
                  <Sparkles size={16} className="text-saathi-amber animate-spin" /> {challenge.rule}
                </p>
              </div>
            )}
          </div>
        )}

        {/* RESULTS PHASE */}
        {phase === 'results' && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto" style={{ animation: 'brain-scale-in 0.4s ease-out' }}>
            <div className="text-center">
              <header className="mb-6">
                <h2 className="text-2xl font-extrabold text-saathi-ink">🔍 Discovery Complete!</h2>
                <p className="text-xs font-bold text-saathi-muted mt-1 uppercase tracking-wider">Rule Discovery Arena</p>
              </header>

              {/* Big Score circle */}
              <div className="flex justify-center mb-6">
                <div className="w-28 h-28 border-4 border-saathi-indigo rounded-full flex flex-col items-center justify-center bg-indigo-50/30">
                  <span className="text-3xl font-black text-saathi-indigo">{correctCount} / {TOTAL_ROUNDS}</span>
                  <span className="text-[10px] font-bold text-saathi-muted uppercase mt-0.5">Correct</span>
                </div>
              </div>

              {/* Stars display */}
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={22}
                    className={s <= starRating ? 'text-saathi-amber fill-saathi-amber' : 'text-gray-200'}
                  />
                ))}
              </div>

              <div className="mb-6">
                <p className="text-sm font-extrabold text-saathi-ink">
                  {accuracyPercent >= 90
                    ? '🏆 Grand Pattern Master!'
                    : accuracyPercent >= 75
                    ? '🌟 Exceptional Analytical Mind!'
                    : accuracyPercent >= 60
                    ? '👍 Superb Sequence Solver!'
                    : accuracyPercent >= 40
                    ? '📚 Getting Better!'
                    : '🔁 Keep Practicing!'}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">⏱️</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {formatTime(Math.round(totalTime / 1000))}
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Total Time</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">🔥</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {longestStreak} Rnds
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Best Streak</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">💡</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {3 - hintsLeft} Used
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Hints Used</p>
                </div>
              </div>

              {/* Scrollable round breakdown list */}
              <div className="bg-white rounded-2xl border border-saathi-line p-4 shadow-sm mb-6 text-left">
                <p className="text-xs font-bold text-saathi-ink uppercase tracking-wider mb-2">Round Review</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {roundResults.map((r) => (
                    <div 
                      key={r.round} 
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs gap-3 ${
                        r.isCorrect 
                          ? 'bg-emerald-50/50 border-emerald-100' 
                          : 'bg-red-50/50 border-red-100'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-saathi-ink">R{r.round}:</span>
                          <span className="font-semibold text-saathi-muted">
                            [{r.sequence.map(s => s === '?' ? '?' : s).join(', ')}]
                          </span>
                        </div>
                        <p className="text-[10px] text-saathi-muted font-bold mt-1">Rule: {r.rule}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`font-black ${r.isCorrect ? 'text-saathi-green' : 'text-saathi-red'}`}>
                          Ans: {r.studentAnswer}
                        </span>
                        {!r.isCorrect && (
                          <p className="text-[9px] text-saathi-green font-bold">({r.correctAnswer})</p>
                        )}
                        <p className="text-[9px] text-gray-400 font-medium">{(r.timeMs / 1000).toFixed(1)}s</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid gap-3">
              <button
                onClick={startGame}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-saathi-indigo text-white font-bold hover:bg-saathi-indigoDark transition shadow w-full text-sm"
              >
                <RotateCcw size={16} /> Play Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-saathi-line bg-white text-saathi-ink font-bold hover:border-saathi-indigo hover:text-saathi-indigo transition shadow-sm w-full text-sm"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
