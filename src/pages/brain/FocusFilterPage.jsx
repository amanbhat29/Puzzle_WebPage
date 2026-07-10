import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Clock, Award, Star, Trophy, RotateCcw, Check, X, ShieldAlert } from 'lucide-react';
import { savePuzzleResult } from '../../utils/storage';
import { getUniqueQuestion } from '../../utils/nonRepeatingGenerator';

// ═══════════════════════════════════════════════════════════════════════════
// FocusFilterPage — Selective Attention and Concentration Challenge.
// ═══════════════════════════════════════════════════════════════════════════

const TOTAL_ROUNDS = 5;

// Item Pools
const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
const PRIMES = ['2', '3', '5', '7', '11', '13', '17', '19', '23'];
const COMPOSITES = ['4', '6', '8', '9', '10', '12', '14', '15', '16', '18', '20', '21', '22', '24', '25'];
const SHAPES = ['▲', '■', '●', '◆', '★', '⬟', '⬡'];
const SYMBOLS = ['♠', '♣', '♥', '♦', '✿', '☀', '⚡', '★', '☎', '⚔', '⚓'];

// Palette Colors
const BLUE_COLOR = '#8ccdf7';
const OTHER_COLORS = [
  '#ef5543', // saathi-red
  '#3f9674', // saathi-green
  '#f7b331', // saathi-amber
  '#8b5cf6', // saathi-violet
];
const CLOSE_BLUE_COLORS = [
  '#06b6d4', // saathi-cyan (similar distractor for blue on hard)
  '#8b5cf6', // saathi-violet
];

// Tasks
const TASKS = [
  { id: 'vowels', text: 'Click only Vowels', description: 'Find letters A, E, I, O, U' },
  { id: 'numbers', text: 'Click only Numbers', description: 'Find all numerical digits' },
  { id: 'primes', text: 'Click only Prime Numbers', description: 'Find numbers divisible only by 1 and themselves' },
  { id: 'triangles', text: 'Click only Triangles', description: 'Find the triangle shape ▲' },
  { id: 'blue', text: 'Click only Blue Objects', description: 'Find all items in light blue' }
];

export default function FocusFilterPage() {
  const navigate = useNavigate();

  // ── Core state ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'results'
  const [difficulty, setDifficulty] = useState('easy');

  // ── Game state ──────────────────────────────────────────────────────────
  const [currentRound, setCurrentRound] = useState(1);
  const [roundTask, setRoundTask] = useState(null);
  const [gridItems, setGridItems] = useState([]);
  const [subPhase, setSubPhase] = useState('search'); // 'search' | 'feedback'
  
  // Timers and limits
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalRoundTime, setTotalRoundTime] = useState(30);

  // Statistics
  const [correctHits, setCorrectHits] = useState(0);
  const [incorrectClicks, setIncorrectClicks] = useState(0);
  const [missedTargets, setMissedTargets] = useState(0);
  const [totalTargetsCount, setTotalTargetsCount] = useState(0);
  
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);

  // Reaction time tracking
  const [reactionTimes, setReactionTimes] = useState([]);
  const [lastActionTime, setLastActionTime] = useState(null);

  const timerRef = useRef(null);

  // ── Get config based on difficulty ──────────────────────────────────────
  const getDifficultyConfig = useCallback((diff) => {
    switch (diff) {
      case 'easy':
        return { gridSize: 3, timer: 30, minTargets: 3 };
      case 'medium':
        return { gridSize: 4, timer: 20, minTargets: 4 };
      case 'hard':
        return { gridSize: 5, timer: 15, minTargets: 5 };
      default:
        return { gridSize: 3, timer: 30, minTargets: 3 };
    }
  }, []);

  // Helper: check if generated item is a target
  const checkIsTarget = (item, task) => {
    switch (task.id) {
      case 'vowels':
        return item.type === 'letter' && VOWELS.includes(item.value);
      case 'numbers':
        return item.type === 'number';
      case 'primes':
        return item.type === 'number' && PRIMES.includes(item.value);
      case 'triangles':
        return item.type === 'shape' && item.value === '▲';
      case 'blue':
        return item.color === BLUE_COLOR;
      default:
        return false;
    }
  };

  // Helper: Generate cell matching target or distractor rule
  const generateItemForTask = (task, isTargetWanted, diff) => {
    let type = 'letter';
    let value = 'A';
    let color = OTHER_COLORS[Math.floor(Math.random() * OTHER_COLORS.length)];

    if (isTargetWanted) {
      switch (task.id) {
        case 'vowels':
          type = 'letter';
          value = VOWELS[Math.floor(Math.random() * VOWELS.length)];
          break;
        case 'numbers':
          type = 'number';
          value = String(Math.floor(Math.random() * 10)); // 0-9
          break;
        case 'primes':
          type = 'number';
          value = PRIMES[Math.floor(Math.random() * PRIMES.length)];
          break;
        case 'triangles':
          type = 'shape';
          value = '▲';
          break;
        case 'blue':
          type = ['letter', 'number', 'shape', 'symbol'][Math.floor(Math.random() * 4)];
          color = BLUE_COLOR;
          if (type === 'letter') value = CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
          else if (type === 'number') value = String(Math.floor(Math.random() * 10));
          else if (type === 'shape') value = SHAPES[Math.floor(Math.random() * SHAPES.length)];
          else value = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          break;
      }
    } else {
      // Distractor wanted
      const categories = ['letter', 'number', 'shape', 'symbol'];
      // Filter out target category or adjust to generate non-targets
      switch (task.id) {
        case 'vowels':
          type = categories[Math.floor(Math.random() * categories.length)];
          if (type === 'letter') {
            if (diff === 'hard') {
              value = ['H', 'F', 'K', 'Z', 'X', 'Y'][Math.floor(Math.random() * 6)];
            } else {
              value = CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
            }
          } else if (type === 'number') {
            value = String(Math.floor(Math.random() * 10));
          } else if (type === 'shape') {
            value = SHAPES[Math.floor(Math.random() * SHAPES.length)];
          } else {
            value = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          }
          break;

        case 'numbers':
          type = ['letter', 'shape', 'symbol'][Math.floor(Math.random() * 3)];
          if (type === 'letter') value = CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
          else if (type === 'shape') value = SHAPES[Math.floor(Math.random() * SHAPES.length)];
          else value = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          break;

        case 'primes':
          type = categories[Math.floor(Math.random() * categories.length)];
          if (type === 'letter') {
            value = CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
          } else if (type === 'number') {
            if (diff === 'hard') {
              value = ['9', '15', '21', '25'][Math.floor(Math.random() * 4)];
            } else {
              value = COMPOSITES[Math.floor(Math.random() * COMPOSITES.length)];
            }
          } else if (type === 'shape') {
            value = SHAPES[Math.floor(Math.random() * SHAPES.length)];
          } else {
            value = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          }
          break;

        case 'triangles':
          type = categories[Math.floor(Math.random() * categories.length)];
          if (type === 'shape') {
            value = SHAPES.filter(s => s !== '▲')[Math.floor(Math.random() * (SHAPES.length - 1))];
          } else if (type === 'letter') {
            value = diff === 'hard' ? ['A', 'V', 'Y'][Math.floor(Math.random() * 3)] : CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
          } else if (type === 'number') {
            value = String(Math.floor(Math.random() * 10));
          } else {
            value = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          }
          break;

        case 'blue':
          type = categories[Math.floor(Math.random() * categories.length)];
          if (type === 'letter') value = CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)];
          else if (type === 'number') value = String(Math.floor(Math.random() * 10));
          else if (type === 'shape') value = SHAPES[Math.floor(Math.random() * SHAPES.length)];
          else value = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

          color = diff === 'hard'
            ? CLOSE_BLUE_COLORS[Math.floor(Math.random() * CLOSE_BLUE_COLORS.length)]
            : OTHER_COLORS[Math.floor(Math.random() * OTHER_COLORS.length)];
          break;
      }
    }

    return { type, value, color };
  };

  // ── Item generation ──────────────────────────────────────────────────────
  const generateGrid = useCallback((diff, task) => {
    const config = getDifficultyConfig(diff);
    const totalCells = config.gridSize * config.gridSize;
    const items = [];

    // 1. Generate Targets
    const targetCount = Math.floor(totalCells * 0.3) + 1; // around 30% are targets
    for (let i = 0; i < targetCount; i++) {
      items.push(generateItemForTask(task, true, diff));
    }

    // 2. Generate Distractors
    const distractorCount = totalCells - targetCount;
    for (let i = 0; i < distractorCount; i++) {
      items.push(generateItemForTask(task, false, diff));
    }

    // 3. Shuffle items and assign IDs and click state
    const shuffled = items
      .map((item, index) => ({
        ...item,
        id: index,
        clicked: false,
        isTarget: checkIsTarget(item, task)
      }))
      .sort(() => Math.random() - 0.5);

    return shuffled;
  }, [getDifficultyConfig]);

  // ── Load next round ──────────────────────────────────────────────────────
  const loadRound = useCallback((roundNum, diff) => {
    const task = TASKS[(roundNum - 1) % TASKS.length];
    setRoundTask(task);
    setSubPhase('search');
    
    const config = getDifficultyConfig(diff);
    setTimeLeft(config.timer);
    setTotalRoundTime(config.timer);

    const grid = getUniqueQuestion(`focus-filter-${diff}`, () => generateGrid(diff, task), (grid) => grid.map(cell => cell.value + '-' + cell.color).join(','));
    setGridItems(grid);

    const targetCount = grid.filter((item) => item.isTarget).length;
    setTotalTargetsCount((t) => t + targetCount);

    setLastActionTime(Date.now());
  }, [generateGrid, getDifficultyConfig]);

  // ── Start the game ──────────────────────────────────────────────────────
  const startGame = () => {
    setPhase('playing');
    setCurrentRound(1);
    
    setCorrectHits(0);
    setIncorrectClicks(0);
    setMissedTargets(0);
    setTotalTargetsCount(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setComboMultiplier(1);
    setReactionTimes([]);

    loadRound(1, difficulty);
  };

  // ── Timer countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing' || subPhase !== 'search') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleCheckAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, subPhase]);

  // ── Handle cell clicks ──────────────────────────────────────────────────
  const handleCellClick = (item) => {
    if (subPhase !== 'search' || item.clicked) return;

    const now = Date.now();
    if (lastActionTime) {
      setReactionTimes((r) => [...r, now - lastActionTime]);
    }
    setLastActionTime(now);

    setGridItems((prev) =>
      prev.map((cell) => (cell.id === item.id ? { ...cell, clicked: true } : cell))
    );

    if (item.isTarget) {
      setCorrectHits((c) => c + 1);
      setCurrentStreak((s) => {
        const next = s + 1;
        setMaxStreak((ms) => Math.max(ms, next));
        const nextMult = Math.min(4, Math.floor(next / 3) + 1);
        setComboMultiplier(nextMult);
        return next;
      });
    } else {
      setIncorrectClicks((ic) => ic + 1);
      setCurrentStreak(0);
      setComboMultiplier(1);
    }
  };

  // ── Check Answers (Reveal feedback) ─────────────────────────────────────
  const handleCheckAnswer = () => {
    clearInterval(timerRef.current);

    let roundMissed = 0;
    gridItems.forEach((cell) => {
      if (cell.isTarget && !cell.clicked) {
        roundMissed++;
      }
    });

    setMissedTargets((m) => m + roundMissed);
    setSubPhase('feedback');
  };

  // ── Next round or end game ──────────────────────────────────────────────
  const handleNextRound = () => {
    if (currentRound < TOTAL_ROUNDS) {
      const nextRnd = currentRound + 1;
      setCurrentRound(nextRnd);
      loadRound(nextRnd, difficulty);
    } else {
      setPhase('results');
    }
  };

  // ── Derived metrics ────────────────────────────────────────────────────
  const totalClicks = correctHits + incorrectClicks;
  const accuracy = totalClicks > 0
    ? Math.round((correctHits / totalClicks) * 100)
    : 0;

  const avgReactionTime = reactionTimes.length > 0
    ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 1000).toFixed(2)
    : '0.00';

  const focusScore = Math.min(
    100,
    Math.max(
      0,
      totalClicks === 0
        ? 0
        : Math.round(
            accuracy * 0.7 +
            (maxStreak * 2) -
            (Number(avgReactionTime) * 3) +
            Math.max(0, 10 - missedTargets) * 2
          )
    )
  );

  const performanceRating = focusScore >= 85 ? 5
    : focusScore >= 70 ? 4
    : focusScore >= 50 ? 3
    : focusScore >= 30 ? 2
    : 1;

  const performanceLabel = focusScore >= 85 ? 'Laser Sharp Focus!'
    : focusScore >= 70 ? 'Excellent Focus!'
    : focusScore >= 50 ? 'Good Concentration!'
    : focusScore >= 30 ? 'Improving Attention'
    : 'Keep Practicing Focus';

  // ── Persist result on results phase ────────────────────────────────────
  useEffect(() => {
    if (phase === 'results') {
      savePuzzleResult({
        puzzleId: 10,
        score: focusScore,
        accuracy: accuracy,
        timeTaken: Math.round(Number(avgReactionTime) * totalClicks),
        difficulty: difficulty
      });
    }
  }, [phase, focusScore, accuracy, avgReactionTime, totalClicks, difficulty]);

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
                <Target size={28} className="text-saathi-indigo" />
              </div>
              <h1 className="text-2xl font-extrabold text-saathi-ink">👁️ Focus Filter Challenge</h1>
              <p className="mt-1.5 text-sm font-semibold text-saathi-muted leading-relaxed">
                Filter out target objects from active distractors under a fast-paced timer.
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
                  { emoji: '📋', text: 'Each round gives a specific target criteria.' },
                  { emoji: '⏱️', text: 'Time decreases as difficulty increases.' },
                  { emoji: '🔥', text: 'Build combos for multiplier bonuses.' },
                  { emoji: '🚫', text: 'Incorrect clicks reset combos!' }
                ].map((rule) => (
                  <div key={rule.text} className="flex items-center gap-2.5 rounded-xl bg-indigo-50 px-3 py-2">
                    <span className="text-base">{rule.emoji}</span>
                    <span className="text-xs font-bold text-saathi-ink">{rule.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="min-h-12 w-full rounded-2xl bg-saathi-indigo font-bold text-white shadow-saathi transition hover:bg-saathi-indigoDark active:scale-[0.97]"
            >
              Start Challenge
            </button>
          </div>
        )}

        {/* Phase: Playing */}
        {phase === 'playing' && roundTask && (
          <div className="flex flex-col gap-4" style={{ animation: 'brain-fade-in 0.3s ease-out' }}>
            
            {/* Top HUD */}
            <header className="sticky top-0 z-10 -mx-4 -mt-6 flex items-center justify-between border-b border-saathi-line bg-white px-4 py-3">
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative inline-flex items-center justify-center">
                  <svg width={40} height={40} className="transform -rotate-90">
                    <circle cx={20} cy={20} r={16} fill="none" stroke="#e7ece8" strokeWidth={3} />
                    <circle
                      cx={20}
                      cy={20}
                      r={16}
                      fill="none"
                      stroke={timeLeft <= 5 ? '#ef5543' : '#6366f1'}
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeDasharray={100.5}
                      strokeDashoffset={100.5 - (100.5 * timeLeft) / totalRoundTime}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-xs font-extrabold text-saathi-indigo">{timeLeft}s</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-saathi-muted block">Round</span>
                  <span className="text-xs font-extrabold text-saathi-ink">{currentRound}/{TOTAL_ROUNDS}</span>
                </div>
              </div>

              {/* Task Prompts */}
              <div className="text-center bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-1.5 max-w-[200px] sm:max-w-xs">
                <span className="block text-[9px] font-extrabold text-saathi-indigo uppercase tracking-wider">Target Objective</span>
                <span className="text-xs font-extrabold text-saathi-ink leading-tight">{roundTask.text}</span>
              </div>

              {/* Combo and Score HUD */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-saathi-muted block">Combo</span>
                  <span className="text-xs font-extrabold text-amber-500 flex items-center gap-0.5 justify-end">
                    🔥 {currentStreak} <span className="text-[9px] font-bold text-amber-600">(x{comboMultiplier})</span>
                  </span>
                </div>
              </div>
            </header>

            {/* Instruction helper */}
            <div className="text-center text-xs font-semibold text-saathi-muted mt-1">
              {roundTask.description}
            </div>

            {/* Grid Area */}
            <div className="flex-1 flex items-center justify-center py-4">
              <div
                className="grid gap-3 w-full max-w-sm"
                style={{
                  gridTemplateColumns: `repeat(${Math.sqrt(gridItems.length)}, minmax(0, 1fr))`
                }}
              >
                {gridItems.map((cell) => {
                  const sizeClass = gridItems.length > 16 ? 'text-xl' : gridItems.length > 9 ? 'text-2xl' : 'text-3xl';
                  
                  let borderStyle = 'border-saathi-line hover:border-saathi-indigo';
                  let itemColor = cell.color;
                  
                  if (subPhase === 'search') {
                    if (cell.clicked) {
                      borderStyle = cell.isTarget
                        ? 'border-saathi-green bg-emerald-50/50 scale-[0.98]'
                        : 'border-saathi-red bg-red-50/50 scale-[0.98]';
                    }
                  } else {
                    // Feedback SubPhase: reveal all
                    if (cell.isTarget) {
                      borderStyle = cell.clicked
                        ? 'border-saathi-green bg-emerald-50 ring-2 ring-emerald-100 scale-[0.98]'
                        : 'border-dashed border-saathi-green bg-emerald-50/20 opacity-70';
                    } else if (cell.clicked) {
                      borderStyle = 'border-saathi-red bg-red-50 ring-2 ring-red-100 scale-[0.98]';
                    } else {
                      borderStyle = 'border-saathi-line opacity-30';
                    }
                  }

                  return (
                    <button
                      key={cell.id}
                      onClick={() => handleCellClick(cell)}
                      disabled={subPhase !== 'search' || cell.clicked}
                      className={`aspect-square rounded-2xl border-2 flex items-center justify-center font-black relative select-none transition-all duration-200 ${sizeClass} ${borderStyle} bg-white shadow-sm`}
                      style={{ color: itemColor }}
                    >
                      {/* Grid Item content */}
                      {cell.type === 'shape' && cell.value === '▲' ? (
                        <div className="triangle-shape" style={{ color: itemColor, borderBottomWidth: gridItems.length > 16 ? '18px' : '28px', borderLeftWidth: gridItems.length > 16 ? '10px' : '16px', borderRightWidth: gridItems.length > 16 ? '10px' : '16px' }} />
                      ) : (
                        cell.value
                      )}

                      {/* Micro Feedback Indicators */}
                      {cell.clicked && cell.isTarget && (
                        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-saathi-green text-white flex items-center justify-center text-[8px]">
                          <Check size={8} strokeWidth={4} />
                        </div>
                      )}
                      {cell.clicked && !cell.isTarget && (
                        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-saathi-red text-white flex items-center justify-center text-[8px]">
                          <X size={8} strokeWidth={4} />
                        </div>
                      )}
                      {subPhase === 'feedback' && cell.isTarget && !cell.clicked && (
                        <div className="absolute -top-1.5 -right-1.5 bg-saathi-amber text-saathi-ink border border-amber-300 rounded-full p-0.5 text-[8px]" title="Missed target">
                          <ShieldAlert size={10} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <footer className="mt-4">
              {subPhase === 'search' ? (
                <button
                  onClick={handleCheckAnswer}
                  className="min-h-12 w-full rounded-2xl bg-saathi-indigo text-white font-bold hover:bg-saathi-indigoDark text-sm shadow transition"
                >
                  Verify Selections
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-center font-bold text-saathi-ink text-sm">
                    Round Target Hits: <span className="text-saathi-green">{gridItems.filter((i) => i.isTarget && i.clicked).length}</span> / {gridItems.filter((i) => i.isTarget).length}
                  </div>
                  <button
                    onClick={handleNextRound}
                    className="min-h-12 w-full rounded-2xl bg-saathi-indigo text-white font-bold hover:bg-saathi-indigoDark text-sm shadow transition"
                  >
                    {currentRound === TOTAL_ROUNDS ? 'Finish & See Results' : 'Next Round'}
                  </button>
                </div>
              )}
            </footer>
          </div>
        )}

        {/* Phase: Results */}
        {phase === 'results' && (
          <div className="flex-1 flex flex-col justify-between" style={{ animation: 'brain-scale-in 0.4s ease-out' }}>
            <div className="text-center">
              <header className="mb-6">
                <h1 className="text-2xl font-extrabold text-saathi-ink">👁️ Focus Score Complete</h1>
                <p className="text-xs font-bold text-saathi-muted mt-1 uppercase tracking-wider">Focus Filter Challenge</p>
              </header>

              {/* Circular Score display */}
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

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">🎯</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {correctHits} / {totalTargetsCount}
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Target Hits</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">⚡</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {avgReactionTime}s
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Avg Reaction Time</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">🔥</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {maxStreak} clicks
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Max Streak</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">⚠️</span>
                  <p className="text-base font-extrabold text-saathi-red mt-1">
                    {missedTargets}
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Missed Targets</p>
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
