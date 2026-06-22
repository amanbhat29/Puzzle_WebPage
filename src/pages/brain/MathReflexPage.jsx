import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Target, Clock, Award, Star, Trophy, RotateCcw } from 'lucide-react';
import { generateMathQuestion } from '../../utils/generators/mathGenerator';
import { formatTimer } from '../../utils/format';
import { savePuzzleResult } from '../../utils/storage';

// ═══════════════════════════════════════════════════════════════════════════
// MathReflexPage — 60-second rapid-fire math challenge game.
// Self-contained with all sub-components defined inline.
// ═══════════════════════════════════════════════════════════════════════════

const GAME_DURATION = 60; // seconds

export default function MathReflexPage() {
  const navigate = useNavigate();

  // ── Core state ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'results'
  const [difficulty, setDifficulty] = useState('easy');

  // ── Game state ──────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [questionsAttempted, setQuestionsAttempted] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);
  const [responseTimes, setResponseTimes] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // ── UI feedback state ──────────────────────────────────────────────────
  const [flashState, setFlashState] = useState(null); // 'correct' | 'wrong' | null
  const [streakKey, setStreakKey] = useState(0); // triggers streak animation

  const timerRef = useRef(null);
  const flashTimeoutRef = useRef(null);

  // ── Options Generator ──────────────────────────────────────────────────
  const generateOptions = useCallback((correctAnswer) => {
    const distractorSet = new Set();
    const offsets = [-2, -1, 1, 2, -10, 10, -3, 3, -5, 5];
    const shuffledOffsets = [...offsets].sort(() => Math.random() - 0.5);

    for (const offset of shuffledOffsets) {
      const val = correctAnswer + offset;
      if (val !== correctAnswer) {
        distractorSet.add(val);
      }
      if (distractorSet.size >= 3) break;
    }

    let fallback = 4;
    while (distractorSet.size < 3) {
      const val = correctAnswer + fallback;
      if (val !== correctAnswer) {
        distractorSet.add(val);
      }
      fallback++;
    }

    return [correctAnswer, ...Array.from(distractorSet)].sort(() => Math.random() - 0.5);
  }, []);

  // ── Start the game ──────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    setPhase('playing');
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setSelectedAnswer(null);
    setCurrentStreak(0);
    setLongestStreak(0);
    setQuestionsAttempted(0);
    setQuestionsCorrect(0);
    setResponseTimes([]);
    setFlashState(null);

    const q = generateMathQuestion(difficulty);
    setCurrentQuestion(q);
    setCurrentOptions(generateOptions(q.answer));
    setQuestionStartTime(Date.now());
  }, [difficulty, generateOptions]);

  // ── Timer countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ── Cleanup flash timeout on unmount ───────────────────────────────────
  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  // ── Derived metrics ────────────────────────────────────────────────────
  const accuracy = questionsAttempted > 0
    ? Math.round((questionsCorrect / questionsAttempted) * 100)
    : 0;

  const avgResponseTime = responseTimes.length > 0
    ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000).toFixed(1)
    : '0.0';

  const xpEarned = Math.round(score / 10);

  const performanceRating = score >= 200 ? 5
    : score >= 150 ? 4
    : score >= 100 ? 3
    : score >= 50 ? 2
    : 1;

  const performanceLabel = score >= 200 ? 'Math Genius!'
    : score >= 150 ? 'Excellent!'
    : score >= 100 ? 'Good Job!'
    : score >= 50 ? 'Getting Better'
    : 'Keep Practicing';

  // ── Persist result on results phase ────────────────────────────────────
  useEffect(() => {
    if (phase === 'results') {
      savePuzzleResult({
        puzzleId: 6,
        score,
        accuracy,
        timeTaken: GAME_DURATION
      });
    }
  }, [phase, score, accuracy]);

  // ── Handle Option Selection ────────────────────────────────────────────
  const handleSelectOption = useCallback((option) => {
    if (selectedAnswer !== null || phase !== 'playing') return;

    setSelectedAnswer(option);
    const responseTime = Date.now() - questionStartTime;
    setQuestionsAttempted((a) => a + 1);
    setResponseTimes((rt) => [...rt, responseTime]);

    const isCorrect = Number(option) === Number(currentQuestion.answer);

    if (isCorrect) {
      const streakBonus = currentStreak * 2;
      const pointsEarned = 10 + streakBonus;

      setScore((s) => s + pointsEarned);
      setQuestionsCorrect((c) => c + 1);
      setCurrentStreak((s) => {
        const next = s + 1;
        setLongestStreak((ls) => Math.max(ls, next));
        return next;
      });
      setStreakKey((k) => k + 1);

      setFlashState('correct');
    } else {
      setCurrentStreak(0);
      setFlashState('wrong');
    }

    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);

    const delay = isCorrect ? 250 : 800;

    flashTimeoutRef.current = setTimeout(() => {
      setFlashState(null);
      setSelectedAnswer(null);
      const nextQ = generateMathQuestion(difficulty);
      setCurrentQuestion(nextQ);
      setCurrentOptions(generateOptions(nextQ.answer));
      setQuestionStartTime(Date.now());
    }, delay);
  }, [selectedAnswer, phase, currentQuestion, questionStartTime, currentStreak, difficulty, generateOptions]);

  // ═══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <main className="saathi-screen">
      <div className="phone-frame px-4 py-6">

        {/* Phase: Setup */}
        {phase === 'setup' && (
          <SetupPhase
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            onStart={startGame}
            onBack={() => navigate('/')}
          />
        )}

        {/* Phase: Playing */}
        {phase === 'playing' && currentQuestion && (
          <PlayingPhase
            timeLeft={timeLeft}
            score={score}
            currentStreak={currentStreak}
            streakKey={streakKey}
            question={currentQuestion}
            options={currentOptions}
            selectedAnswer={selectedAnswer}
            flashState={flashState}
            onSelectOption={handleSelectOption}
          />
        )}

        {/* Phase: Results */}
        {phase === 'results' && (
          <ResultsPhase
            score={score}
            accuracy={accuracy}
            questionsAttempted={questionsAttempted}
            questionsCorrect={questionsCorrect}
            avgResponseTime={avgResponseTime}
            longestStreak={longestStreak}
            xpEarned={xpEarned}
            performanceRating={performanceRating}
            performanceLabel={performanceLabel}
            onPlayAgain={startGame}
            onBack={() => { setPhase('setup'); }}
            onHome={() => navigate('/')}
          />
        )}

      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════

// ── Timer Ring (SVG circular countdown) ──────────────────────────────────
function TimerRing({ timeLeft, totalTime }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius; // ≈ 125.66
  const progress = timeLeft / totalTime;
  const offset = circumference * (1 - progress);

  const strokeColor = timeLeft <= 10 ? '#ef5543' : timeLeft <= 20 ? '#f7b331' : '#6366f1';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={48} height={48} className="transform -rotate-90">
        <circle
          cx={24}
          cy={24}
          r={radius}
          fill="none"
          stroke="#e7ece8"
          strokeWidth={3}
        />
        <circle
          cx={24}
          cy={24}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
        />
      </svg>
      <span
        className="absolute text-xs font-extrabold"
        style={{ color: strokeColor }}
      >
        {timeLeft}
      </span>
    </div>
  );
}

// ── Setup Phase ──────────────────────────────────────────────────────────
function SetupPhase({ difficulty, onDifficultyChange, onStart, onBack }) {
  const difficulties = [
    { key: 'easy', label: 'Easy', selectedClass: 'bg-emerald-50 text-saathi-green border-emerald-200' },
    { key: 'medium', label: 'Medium', selectedClass: 'bg-amber-50 text-amber-600 border-amber-200' },
    { key: 'hard', label: 'Hard', selectedClass: 'bg-red-50 text-saathi-red border-red-200' },
  ];

  return (
    <div className="flex flex-col" style={{ animation: 'brain-fade-in-up 0.4s ease-out' }}>
      <button
        onClick={onBack}
        className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm font-extrabold text-saathi-ink transition hover:text-saathi-green"
      >
        <ArrowLeft size={17} /> Back to Puzzles
      </button>

      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 shadow-sm">
          <Zap size={28} className="text-saathi-indigo" />
        </div>
        <h1 className="text-2xl font-extrabold text-saathi-ink">⚡ Math Reflex Arena</h1>
        <p className="mt-1.5 text-sm font-semibold text-saathi-muted">
          How fast can you calculate?
        </p>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-saathi-muted">
          Difficulty
        </p>
        <div className="flex gap-2">
          {difficulties.map((d) => (
            <button
              key={d.key}
              onClick={() => onDifficultyChange(d.key)}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold transition active:scale-95 ${
                difficulty === d.key
                  ? d.selectedClass
                  : 'border-saathi-line bg-white text-saathi-ink hover:border-indigo-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-saathi-line bg-white p-4 shadow-card">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-saathi-muted">
          How it works
        </p>
        <div className="grid gap-2">
          {[
            { emoji: '⏱️', text: '60 seconds on the clock' },
            { emoji: '🎯', text: 'Tap the correct multiple-choice option' },
            { emoji: '🔥', text: 'Build streaks for bonus points' },
          ].map((rule) => (
            <div key={rule.text} className="flex items-center gap-2.5 rounded-xl bg-indigo-50 px-3 py-2">
              <span className="text-base">{rule.emoji}</span>
              <span className="text-xs font-bold text-saathi-ink">{rule.text}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="min-h-12 w-full rounded-2xl bg-saathi-indigo font-bold text-white shadow transition hover:bg-saathi-indigoDark active:scale-[0.97]"
      >
        Start Challenge
      </button>
    </div>
  );
}

// ── Playing Phase ────────────────────────────────────────────────────────
function PlayingPhase({
  timeLeft,
  score,
  currentStreak,
  streakKey,
  question,
  options,
  selectedAnswer,
  flashState,
  onSelectOption,
}) {
  const cardBg = flashState === 'correct'
    ? 'bg-emerald-50'
    : flashState === 'wrong'
    ? 'bg-red-50'
    : 'bg-white';

  const shakeClass = flashState === 'wrong' ? 'brain-shake-anim' : '';

  return (
    <div className="flex flex-col gap-4" style={{ animation: 'brain-fade-in 0.3s ease-out' }}>

      {/* Top HUD bar */}
      <div className="sticky top-0 z-10 -mx-4 -mt-6 flex items-center justify-between border-b border-saathi-line bg-white px-4 py-3">
        <TimerRing timeLeft={timeLeft} totalTime={GAME_DURATION} />

        <div className="text-center">
          <p className="text-2xl font-extrabold text-saathi-indigo">{score}</p>
          <p className="text-[10px] font-bold text-saathi-muted">Score</p>
        </div>

        <div
          key={streakKey}
          className="text-center"
          style={currentStreak > 0 ? { animation: 'brain-streak-pop 0.3s ease-out' } : undefined}
        >
          <p className="text-lg font-extrabold text-saathi-ink">
            🔥 {currentStreak}
          </p>
          <p className="text-[10px] font-bold text-saathi-muted">Streak</p>
        </div>
      </div>

      {/* Question area */}
      <div
        className={`rounded-2xl border border-saathi-line p-8 shadow-card transition-colors duration-150 ${cardBg} ${shakeClass}`}
        style={flashState === 'wrong' ? { animation: 'brain-shake 0.3s ease-out' } : undefined}
      >
        <p className="text-center text-4xl font-extrabold text-saathi-ink sm:text-5xl">
          {question.expression}
        </p>
        <p className="mt-2 text-center text-sm font-semibold text-saathi-muted">= ?</p>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-3 mx-auto w-full max-w-sm mt-2">
        {options.map((opt) => {
          const isSelected = selectedAnswer !== null && selectedAnswer === opt;
          const isCorrect = Number(opt) === Number(question.answer);

          let optStyle = 'bg-white border-saathi-line text-saathi-ink hover:border-saathi-indigo hover:shadow';
          if (selectedAnswer !== null) {
            if (isCorrect) {
              optStyle = 'bg-emerald-50 border-saathi-green text-saathi-green ring-2 ring-emerald-100 scale-[1.02]';
            } else if (isSelected) {
              optStyle = 'bg-red-50 border-saathi-red text-saathi-red ring-2 ring-red-100 scale-[0.98]';
            } else {
              optStyle = 'bg-gray-50 border-saathi-line text-gray-400 opacity-60';
            }
          }

          return (
            <button
              key={opt}
              onClick={() => onSelectOption(opt)}
              disabled={selectedAnswer !== null}
              className={`min-h-20 rounded-2xl border-2 flex items-center justify-center p-4 font-black text-xl select-none transition-all duration-200 ${optStyle}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Visual Feedback Banner if incorrect */}
      {selectedAnswer !== null && selectedAnswer !== question.answer && (
        <div className="text-center text-xs font-bold text-saathi-red uppercase tracking-wider animate-bounce mt-2">
          Correct Answer: {question.answer}
        </div>
      )}

    </div>
  );
}

// ── Results Phase ────────────────────────────────────────────────────────
function ResultsPhase({
  score,
  accuracy,
  questionsAttempted,
  questionsCorrect,
  avgResponseTime,
  longestStreak,
  xpEarned,
  performanceRating,
  performanceLabel,
  onPlayAgain,
  onBack,
  onHome,
}) {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ animation: 'brain-fade-in-up 0.5s ease-out' }}
    >
      <h1
        className="mb-2 text-2xl font-extrabold text-saathi-ink"
        style={{ animation: 'brain-scale-in 0.5s ease-out' }}
      >
        ⚡ Challenge Complete!
      </h1>

      <div
        className="mt-4 grid h-28 w-28 place-items-center rounded-full border-4 border-saathi-indigo"
        style={{ animation: 'brain-score-count 0.6s ease-out' }}
      >
        <div>
          <p className="text-3xl font-extrabold text-saathi-indigo">{score}</p>
          <p className="text-xs font-semibold text-saathi-muted">points</p>
        </div>
      </div>

      <p className="mt-4 text-lg font-extrabold text-saathi-ink">{performanceLabel}</p>
      <div className="mt-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={22}
            className={i <= performanceRating ? 'text-saathi-amber fill-saathi-amber' : 'text-saathi-line'}
          />
        ))}
      </div>

      <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricCard label="Accuracy" value={`${accuracy}%`} icon={<Target size={16} />} />
        <MetricCard label="Attempted" value={questionsAttempted} icon={<Zap size={16} />} />
        <MetricCard label="Correct" value={questionsCorrect} icon="✅" />
        <MetricCard label="Avg Time" value={`${avgResponseTime}s`} icon={<Clock size={16} />} />
        <MetricCard label="Best Streak" value={`🔥 ${longestStreak}`} icon={<Award size={16} />} />
        <MetricCard label="XP Earned" value={xpEarned} icon={<Trophy size={16} />} />
      </div>

      <div className="mt-6 grid w-full max-w-sm gap-3">
        <button
          onClick={onPlayAgain}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-saathi-indigo px-5 text-sm font-bold text-white shadow transition hover:bg-saathi-indigoDark active:scale-[0.97]"
        >
          <RotateCcw size={16} /> Play Again
        </button>
        <button
          onClick={onHome}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-saathi-line bg-white px-5 text-sm font-bold text-saathi-ink shadow-sm transition hover:border-saathi-green hover:text-saathi-green active:scale-[0.97]"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ── Metric Card ──────────────────────────────────────────────────────────
function MetricCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-saathi-line bg-white p-3 shadow-sm">
      <div className="mb-1 text-saathi-indigo">
        {typeof icon === 'string' ? <span className="text-base">{icon}</span> : icon}
      </div>
      <p className="text-lg font-extrabold text-saathi-ink">{value}</p>
      <p className="text-[10px] font-bold text-saathi-muted">{label}</p>
    </div>
  );
}
