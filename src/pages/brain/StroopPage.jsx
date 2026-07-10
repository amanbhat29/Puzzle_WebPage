import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Clock, Award, Star, Trophy, RotateCcw, Check, X } from 'lucide-react';
import { savePuzzleResult } from '../../utils/storage';
import { getUniqueQuestion } from '../../utils/nonRepeatingGenerator';

// ═══════════════════════════════════════════════════════════════════════════
// StroopPage — Color Word Conflict Challenge.
// ═══════════════════════════════════════════════════════════════════════════

const COLOR_MAP = [
  { name: 'RED', color: '#ef5543' },
  { name: 'GREEN', color: '#3f9674' },
  { name: 'BLUE', color: '#8ccdf7' },
  { name: 'YELLOW', color: '#f7b331' },
  { name: 'VIOLET', color: '#8b5cf6' },
  { name: 'ORANGE', color: '#f97316' }
];

export default function StroopPage() {
  const navigate = useNavigate();

  // ── Core state ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'results'
  const [difficulty, setDifficulty] = useState('easy');

  // ── Game state ──────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTime, setTotalTime] = useState(30);
  const [score, setScore] = useState(0);

  // Current Question
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState({});
  const [options, setOptions] = useState([]);

  // Stats
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  // Reaction Times
  const [reactionTimes, setReactionTimes] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Feedback State
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null

  const timerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  // ── Get difficulty configuration ────────────────────────────────────────
  const getDifficultyConfig = useCallback((diff) => {
    switch (diff) {
      case 'easy':
        return { timeLimit: 30, optionCount: 2 };
      case 'medium':
        return { timeLimit: 20, optionCount: 4 };
      case 'hard':
        return { timeLimit: 15, optionCount: 6 };
      default:
        return { timeLimit: 30, optionCount: 2 };
    }
  }, []);

  const generateQuestionData = useCallback((diff) => {
    const config = getDifficultyConfig(diff);
    
    // Pick target display color and text word (conflict!)
    const wordIndex = Math.floor(Math.random() * COLOR_MAP.length);
    let colorIndex = Math.floor(Math.random() * COLOR_MAP.length);
    
    // Force conflict 80% of the time to create interference
    if (Math.random() < 0.8) {
      while (colorIndex === wordIndex) {
        colorIndex = Math.floor(Math.random() * COLOR_MAP.length);
      }
    }

    const word = COLOR_MAP[wordIndex].name;
    const colorObj = COLOR_MAP[colorIndex];

    // Options generation
    const availableOptions = [...COLOR_MAP];
    const correctOptionName = colorObj.name;
    const distractorSet = new Set([correctOptionName]);

    // Ensure the word text color name is one of the distractors for maximum conflict
    if (COLOR_MAP[wordIndex].name !== correctOptionName && distractorSet.size < config.optionCount) {
      distractorSet.add(COLOR_MAP[wordIndex].name);
    }

    // Fill with random other options
    while (distractorSet.size < config.optionCount) {
      const idx = Math.floor(Math.random() * availableOptions.length);
      distractorSet.add(availableOptions[idx].name);
    }

    const questionOptions = Array.from(distractorSet).sort(() => Math.random() - 0.5);

    return { word, colorObj, questionOptions };
  }, [getDifficultyConfig]);

  // ── Generate Question ────────────────────────────────────────────────────
  const generateQuestion = useCallback((diff) => {
    const data = getUniqueQuestion(`stroop-${diff}`, () => generateQuestionData(diff), (q) => q.word + '-' + q.colorObj.name);
    setCurrentWord(data.word);
    setCurrentColor(data.colorObj);
    setOptions(data.questionOptions);
    setQuestionStartTime(Date.now());
  }, [generateQuestionData]);

  // ── Start Challenge ─────────────────────────────────────────────────────
  const startChallenge = () => {
    const config = getDifficultyConfig(difficulty);
    setPhase('playing');
    setTimeLeft(config.timeLimit);
    setTotalTime(config.timeLimit);
    setScore(0);
    setTotalAnswered(0);
    setCorrectCount(0);
    setCurrentStreak(0);
    setLongestStreak(0);
    setReactionTimes([]);
    setFeedback(null);

    generateQuestion(difficulty);
  };

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

  // ── Handle option selection ─────────────────────────────────────────────
  const handleSelectOption = (option) => {
    if (feedback !== null || phase !== 'playing') return;

    const reactionTime = Date.now() - questionStartTime;
    setReactionTimes((rt) => [...rt, reactionTime]);
    setTotalAnswered((t) => t + 1);

    const isCorrect = option === currentColor.name;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setScore((s) => s + 10 + currentStreak * 2); // bonus for streak
      setCurrentStreak((s) => {
        const next = s + 1;
        setLongestStreak((ls) => Math.max(ls, next));
        return next;
      });
      setFeedback('correct');
    } else {
      setCurrentStreak(0);
      setFeedback('wrong');
    }

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      generateQuestion(difficulty);
    }, isCorrect ? 250 : 800);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  // ── Derived metrics ────────────────────────────────────────────────────
  const accuracy = totalAnswered > 0
    ? Math.round((correctCount / totalAnswered) * 100)
    : 0;

  const avgReactionTime = reactionTimes.length > 0
    ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 1000).toFixed(2)
    : '0.00';

  // Focus Score: combining accuracy and reaction speed
  const focusScore = Math.min(
    100,
    Math.max(
      0,
      totalAnswered === 0
        ? 0
        : Math.round(
            accuracy * 0.7 +
            (longestStreak * 2) -
            (Number(avgReactionTime) * 4)
          )
    )
  );

  // Cognitive Control Score: measuring performance under high cognitive interference
  const cognitiveControlScore = Math.min(
    100,
    Math.max(
      0,
      totalAnswered === 0
        ? 0
        : Math.round(
            accuracy * 0.8 +
            Math.max(0, 5 - Number(avgReactionTime)) * 4
          )
    )
  );

  const performanceRating = focusScore >= 85 ? 5
    : focusScore >= 70 ? 4
    : focusScore >= 50 ? 3
    : focusScore >= 30 ? 2
    : 1;

  const performanceLabel = focusScore >= 85 ? 'Stroop Mastermind!'
    : focusScore >= 70 ? 'Excellent Control!'
    : focusScore >= 50 ? 'Strong Focus!'
    : focusScore >= 30 ? 'Improving Attention'
    : 'Keep Practicing Control';

  // ── Persist result on results phase ────────────────────────────────────
  useEffect(() => {
    if (phase === 'results') {
      savePuzzleResult({
        puzzleId: 11,
        score: focusScore,
        accuracy: accuracy,
        timeTaken: Math.round(Number(avgReactionTime) * totalAnswered),
        difficulty: difficulty
      });
    }
  }, [phase, focusScore, accuracy, avgReactionTime, totalAnswered, difficulty]);

  return (
    <main className="saathi-screen">
      <div className="phone-frame px-4 py-6 flex flex-col justify-between overflow-y-auto">

        {/* Phase: Setup */}
        {phase === 'setup' && (
          <div className="flex flex-col" style={{ animation: 'brain-fade-in-up 0.4s ease-out' }}>
            <button
              onClick={() => navigate('/')}
              className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm font-extrabold text-saathi-ink transition hover:text-saathi-green"
            >
              <ArrowLeft size={17} /> Back to Puzzles
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 shadow-sm">
                <Trophy size={28} className="text-saathi-indigo" />
              </div>
              <h1 className="text-2xl font-extrabold text-saathi-ink">🎨 Stroop Challenge</h1>
              <p className="mt-1.5 text-sm font-semibold text-saathi-muted leading-relaxed">
                Match the ink color of the word, NOT the word itself. Speed up and overcome brain conflict!
              </p>
            </div>

            {/* Difficulty Selector */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-saathi-muted">
                Difficulty
              </p>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-bold transition capitalize active:scale-95 ${
                      difficulty === d
                        ? d === 'easy'
                          ? 'bg-emerald-50 text-saathi-green border-emerald-200'
                          : d === 'medium'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-red-50 text-saathi-red border-red-200'
                        : 'border-saathi-line bg-white text-saathi-ink hover:border-indigo-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules Card */}
            <div className="mb-6 rounded-2xl border border-saathi-line bg-white p-4 shadow-card">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-saathi-muted">
                How it works
              </p>
              <div className="grid gap-2">
                {[
                  { emoji: '💡', text: 'Select the color of the text.' },
                  { emoji: '⚠️', text: 'Conflicting words will try to distract you!' },
                  { emoji: '⏱️', text: 'Easy: 30s | Medium: 20s | Hard: 15s.' },
                  { emoji: '🎯', text: 'Answer correctly to boost your score and streaks.' }
                ].map((rule) => (
                  <div key={rule.text} className="flex items-center gap-2.5 rounded-xl bg-indigo-50 px-3 py-2">
                    <span className="text-base">{rule.emoji}</span>
                    <span className="text-xs font-bold text-saathi-ink">{rule.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startChallenge}
              className="min-h-12 w-full rounded-2xl bg-saathi-indigo font-bold text-white shadow-saathi transition hover:bg-saathi-indigoDark active:scale-[0.97]"
            >
              Start Challenge
            </button>
          </div>
        )}

        {/* Phase: Playing */}
        {phase === 'playing' && (
          <div className="flex flex-col gap-6" style={{ animation: 'brain-fade-in 0.3s ease-out' }}>
            
            {/* HUD */}
            <header className="sticky top-0 z-10 -mx-4 -mt-6 flex items-center justify-between border-b border-saathi-line bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-saathi-indigo" />
                <span className="text-sm font-extrabold text-saathi-indigo">{timeLeft}s remaining</span>
              </div>
              <div className="text-center">
                <span className="text-lg font-black text-saathi-indigo">{score}</span>
                <span className="text-[10px] font-bold text-saathi-muted block">Score</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-500">🔥 {currentStreak} streak</span>
              </div>
            </header>

            {/* Word Display Area */}
            <div 
              className={`rounded-2xl border border-saathi-line p-10 shadow-card bg-white flex flex-col items-center justify-center min-h-48 transition-colors duration-150 ${
                feedback === 'correct' ? 'bg-emerald-50 border-saathi-green' : feedback === 'wrong' ? 'bg-red-50 border-saathi-red brain-shake-anim' : ''
              }`}
            >
              <h2 
                className="text-5xl font-black tracking-widest select-none transition-all duration-300 transform scale-100"
                style={{ color: currentColor.color }}
              >
                {currentWord}
              </h2>
            </div>

            {/* Input Selection Buttons */}
            <div className="grid grid-cols-2 gap-3 mx-auto w-full max-w-sm mt-4">
              {options.map((optionName) => {
                const colorObj = COLOR_MAP.find((c) => c.name === optionName) || {};
                return (
                  <button
                    key={optionName}
                    onClick={() => handleSelectOption(optionName)}
                    disabled={feedback !== null}
                    className={`min-h-16 rounded-2xl border-2 flex items-center justify-center font-extrabold text-base select-none transition-all duration-200 bg-white border-saathi-line text-saathi-ink hover:border-saathi-indigo active:scale-95`}
                  >
                    {optionName}
                  </button>
                );
              })}
            </div>

            {/* Incorret Notification Banner */}
            {feedback === 'wrong' && (
              <div className="text-center text-xs font-bold text-saathi-red uppercase tracking-wider animate-bounce">
                Correct Color was: {currentColor.name}
              </div>
            )}

          </div>
        )}

        {/* Phase: Results */}
        {phase === 'results' && (
          <div className="flex-1 flex flex-col justify-between" style={{ animation: 'brain-scale-in 0.4s ease-out' }}>
            <div className="text-center">
              <header className="mb-6">
                <h1 className="text-2xl font-extrabold text-saathi-ink">🎨 Challenge Complete!</h1>
                <p className="text-xs font-bold text-saathi-muted mt-1 uppercase tracking-wider">Stroop Color Word Challenge</p>
              </header>

              {/* Score Display Circle */}
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="54" stroke="#e7ece8" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="#6366f1"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={339.3}
                      strokeDashoffset={339.3 - (339.3 * focusScore) / 100}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-saathi-indigo">{focusScore}</span>
                    <span className="text-[10px] font-bold text-saathi-muted uppercase">Focus Score</span>
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={22}
                    className={s <= performanceRating ? 'text-saathi-amber fill-saathi-amber' : 'text-gray-200'}
                  />
                ))}
              </div>

              <div className="mb-6">
                <p className="text-sm font-extrabold text-saathi-ink">{performanceLabel}</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">🎯</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {accuracy}%
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Accuracy</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">⚡</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {avgReactionTime}s
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Avg Reaction Time</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">🧠</span>
                  <p className="text-base font-extrabold text-saathi-indigo mt-1">
                    {cognitiveControlScore}/100
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Cognitive Control</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">🔥</span>
                  <p className="text-base font-extrabold text-amber-500 mt-1">
                    {longestStreak}
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Best Streak</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid gap-3">
              <button
                onClick={startChallenge}
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
