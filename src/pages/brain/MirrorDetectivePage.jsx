import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Clock, Award, Star, RotateCcw, HelpCircle } from 'lucide-react';
import { savePuzzleResult } from '../../utils/storage';
import { getUniqueQuestion } from '../../utils/nonRepeatingGenerator';

// Grid dimension
const GRID_SIZE = 3;

// Color hex codes for the tiles
const COLORS = [
  '#ef5543', // Red
  '#3f9674', // Green
  '#3b82f6', // Blue
  '#f7b331', // Yellow
  '#8b5cf6'  // Purple
];

// Helper to generate a random 3x3 grid pattern
function generateRandomPattern(numColors) {
  // Initialize empty grid (null = white/empty)
  const grid = Array(GRID_SIZE * GRID_SIZE).fill(null);
  
  // Pick random indices to color
  const indices = [];
  while (indices.length < numColors) {
    const idx = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
    if (!indices.includes(idx)) {
      indices.push(idx);
    }
  }

  // Assign random colors
  indices.forEach((idx, i) => {
    grid[idx] = COLORS[Math.floor(Math.random() * COLORS.length)];
  });

  return grid;
}

// Helper to translate 1D index to (row, col)
const to2D = (idx) => [Math.floor(idx / GRID_SIZE), idx % GRID_SIZE];
// Helper to translate (row, col) to 1D index
const to1D = (r, c) => r * GRID_SIZE + c;

// Transformation operations
const TRANSFORMATIONS = {
  'Horizontal Mirror': (grid) => {
    const res = Array(GRID_SIZE * GRID_SIZE).fill(null);
    for (let i = 0; i < grid.length; i++) {
      const [r, c] = to2D(i);
      res[to1D(r, GRID_SIZE - 1 - c)] = grid[i];
    }
    return res;
  },
  'Vertical Mirror': (grid) => {
    const res = Array(GRID_SIZE * GRID_SIZE).fill(null);
    for (let i = 0; i < grid.length; i++) {
      const [r, c] = to2D(i);
      res[to1D(GRID_SIZE - 1 - r, c)] = grid[i];
    }
    return res;
  },
  '90° Clockwise Rotation': (grid) => {
    const res = Array(GRID_SIZE * GRID_SIZE).fill(null);
    for (let i = 0; i < grid.length; i++) {
      const [r, c] = to2D(i);
      res[to1D(c, GRID_SIZE - 1 - r)] = grid[i];
    }
    return res;
  },
  '180° Rotation': (grid) => {
    const res = Array(GRID_SIZE * GRID_SIZE).fill(null);
    for (let i = 0; i < grid.length; i++) {
      const [r, c] = to2D(i);
      res[to1D(GRID_SIZE - 1 - r, GRID_SIZE - 1 - c)] = grid[i];
    }
    return res;
  },
  '270° Clockwise Rotation': (grid) => {
    const res = Array(GRID_SIZE * GRID_SIZE).fill(null);
    for (let i = 0; i < grid.length; i++) {
      const [r, c] = to2D(i);
      res[to1D(GRID_SIZE - 1 - c, r)] = grid[i];
    }
    return res;
  }
};

// Helper to check if two grids are identical
function areGridsEqual(g1, g2) {
  for (let i = 0; i < g1.length; i++) {
    if (g1[i] !== g2[i]) return false;
  }
  return true;
}

// Convert grid to unique string key
function getGridKey(grid) {
  return grid.map(c => c || 'E').join(',');
}

export default function MirrorDetectivePage() {
  const navigate = useNavigate();

  // ── State variables ──────────────────────────────────────────────────────
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'results'
  const [difficulty, setDifficulty] = useState('easy');

  // Game timer
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);

  // Active question
  const [originalGrid, setOriginalGrid] = useState([]);
  const [targetTransformName, setTargetTransformName] = useState('');
  const [correctGrid, setCorrectGrid] = useState([]);
  const [options, setOptions] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(-1);

  // Analytics
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Feedback
  const [feedbackIndex, setFeedbackIndex] = useState(null); // Selected index
  const [feedbackStatus, setFeedbackStatus] = useState(null); // 'correct' | 'wrong' | null

  const timerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  // ── Difficulty configuration ──────────────────────────────────────────────
  const getDifficultyConfig = (diff) => {
    switch (diff) {
      case 'easy':
        return { numColors: 2, allowedTransforms: ['Horizontal Mirror', '90° Clockwise Rotation', '180° Rotation'] };
      case 'medium':
        return { numColors: 3, allowedTransforms: ['Horizontal Mirror', 'Vertical Mirror', '90° Clockwise Rotation', '180° Rotation', '270° Clockwise Rotation'] };
      case 'hard':
        return { numColors: 4, allowedTransforms: ['Horizontal Mirror', 'Vertical Mirror', '90° Clockwise Rotation', '180° Rotation', '270° Clockwise Rotation'] };
      default:
        return { numColors: 2, allowedTransforms: ['Horizontal Mirror', '90° Clockwise Rotation', '180° Rotation'] };
    }
  };

  // ── Question Generator ───────────────────────────────────────────────────
  const generateQuestionData = useCallback((diff) => {
    const config = getDifficultyConfig(diff);
    
    // 1. Generate pattern
    const pattern = generateRandomPattern(config.numColors);
    
    // 2. Select target transformation
    const transformName = config.allowedTransforms[Math.floor(Math.random() * config.allowedTransforms.length)];
    const transformFn = TRANSFORMATIONS[transformName];
    const transformed = transformFn(pattern);

    // 3. Generate distractors by applying other transformations
    const allTransformNames = Object.keys(TRANSFORMATIONS);
    const correctKey = getGridKey(transformed);
    const seenKeys = new Set([correctKey, getGridKey(pattern)]);
    const distractors = [];

    // First try other valid transformations on original pattern
    for (const name of allTransformNames) {
      if (name !== transformName) {
        const distGrid = TRANSFORMATIONS[name](pattern);
        const key = getGridKey(distGrid);
        if (!seenKeys.has(key)) {
          distractors.push(distGrid);
          seenKeys.add(key);
        }
      }
    }

    // Fallback: generate random grids if we don't have enough distractors
    while (distractors.length < 3) {
      const randGrid = generateRandomPattern(config.numColors);
      const key = getGridKey(randGrid);
      
      // Ensure it's not congruent to original grid by checking all transforms
      let isCongruent = false;
      for (const name of allTransformNames) {
        if (areGridsEqual(TRANSFORMATIONS[name](pattern), randGrid)) isCongruent = true;
      }
      
      if (!isCongruent && !seenKeys.has(key)) {
        distractors.push(randGrid);
        seenKeys.add(key);
      }
    }

    // Shuffle and pick exactly 3 distractors
    const selectedDistractors = distractors.sort(() => Math.random() - 0.5).slice(0, 3);

    // Combine correct and distractors, shuffle
    const allOptions = [transformed, ...selectedDistractors].sort(() => Math.random() - 0.5);

    // Find the correct index
    const correctIdx = allOptions.findIndex(opt => areGridsEqual(opt, transformed));

    return { pattern, transformName, transformed, allOptions, correctIdx };
  }, []);

  // ── Question Generator ───────────────────────────────────────────────────
  const generateQuestion = useCallback((diff) => {
    const data = getUniqueQuestion(`mirror-${diff}`, () => generateQuestionData(diff), (q) => getGridKey(q.pattern) + '-' + q.transformName);
    setOriginalGrid(data.pattern);
    setTargetTransformName(data.transformName);
    setCorrectGrid(data.transformed);
    setOptions(data.allOptions);
    setCorrectIndex(data.correctIdx);
    setFeedbackIndex(null);
    setFeedbackStatus(null);
    setQuestionStartTime(Date.now());
  }, [generateQuestionData]);

  // ── Start Game ────────────────────────────────────────────────────────────
  const startGame = () => {
    setPhase('playing');
    setTimeLeft(45);
    setScore(0);
    setTotalAnswered(0);
    setCorrectCount(0);
    setCurrentStreak(0);
    setLongestStreak(0);
    setReactionTimes([]);
    generateQuestion(difficulty);
  };

  // ── Countdown Timer loop ──────────────────────────────────────────────────
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

  // ── Clean up timeouts on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  // ── Handle option selection ───────────────────────────────────────────────
  const handleOptionClick = (index) => {
    if (feedbackStatus !== null) return; // Wait for next question

    const rt = Date.now() - questionStartTime;
    setReactionTimes(prev => [...prev, rt]);
    setTotalAnswered(prev => prev + 1);
    setFeedbackIndex(index);

    if (index === correctIndex) {
      setFeedbackStatus('correct');
      setCorrectCount(prev => prev + 1);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > longestStreak) {
        setLongestStreak(newStreak);
      }
      
      // Calculate score points (base 15 + streak bonus)
      const points = 15 + Math.min(10, newStreak * 2);
      setScore(prev => prev + points);
    } else {
      setFeedbackStatus('wrong');
      setCurrentStreak(0);
    }

    // Pause briefly to show feedback before next question
    feedbackTimeoutRef.current = setTimeout(() => {
      generateQuestion(difficulty);
    }, 1200);
  };

  // ── Save Results to local storage ─────────────────────────────────────────
  useEffect(() => {
    if (phase === 'results') {
      const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      const avgRt = reactionTimes.length > 0
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 1000)
        : 0;

      savePuzzleResult({
        puzzleId: 15,
        score: score,
        accuracy: accuracy,
        timeTaken: avgRt * totalAnswered, // Total active playing time
        difficulty: difficulty
      });
    }
  }, [phase, score, correctCount, totalAnswered, reactionTimes, difficulty]);

  // ── Grid Renderer for 3x3 Patterns ────────────────────────────────────────
  const renderPatternGrid = (grid, sizeClass = 'w-6 h-6') => {
    if (!grid || grid.length === 0) return null;
    
    return (
      <div className="grid grid-cols-3 gap-1 bg-gray-50 p-2 border border-saathi-line rounded-2xl inline-grid shadow-inner">
        {grid.map((cellColor, idx) => (
          <div
            key={idx}
            className={`rounded-xl border transition-all duration-300 ${sizeClass}`}
            style={{
              backgroundColor: cellColor || '#ffffff',
              borderColor: cellColor ? 'transparent' : '#f3f4f6'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="saathi-screen">
      <div className="phone-frame px-4 py-6 flex flex-col justify-between overflow-y-auto">

        {/* PHASE 1: SETUP SCREEN */}
        {phase === 'setup' && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <header className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => navigate('/')}
                  className="p-2 rounded-xl hover:bg-saathi-line transition text-saathi-ink"
                  aria-label="Back to home"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <p className="text-xs font-bold text-saathi-indigo">Visuospatial Ability</p>
                  <h1 className="text-xl font-extrabold text-saathi-ink">Mirror & Rotation</h1>
                </div>
              </header>

              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 shadow-sm mb-6 text-center">
                <span className="text-4xl">🪞</span>
                <h2 className="text-base font-extrabold text-saathi-ink mt-3">Visual Transformation</h2>
                <p className="text-xs text-saathi-muted font-medium mt-2 leading-relaxed">
                  Mirror & Rotation Detective tests your visual processing speed and ability to identify spatial flips and rotations. 
                  Spot the correctly transformed grid version among mirror and rotational distractors!
                </p>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-saathi-ink uppercase tracking-wider mb-3">Select Difficulty</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['easy', 'medium', 'hard'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`py-3 rounded-xl border text-xs font-bold uppercase transition duration-200 ${
                        difficulty === diff
                          ? 'bg-saathi-indigo text-white border-saathi-indigo shadow-md'
                          : 'bg-white text-saathi-ink border-saathi-line hover:bg-gray-50'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100 flex gap-3 text-xs text-amber-800">
                <HelpCircle size={18} className="shrink-0 text-saathi-amber" />
                <div>
                  <p className="font-extrabold">Tips for matching:</p>
                  <ul className="list-disc ml-4 mt-1 font-semibold space-y-1">
                    <li>A horizontal mirror flips left and right columns.</li>
                    <li>A vertical mirror flips top and bottom rows.</li>
                    <li>Hard mode features complex 4-color patterns under rapid time pressure!</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-saathi-indigo hover:bg-saathi-indigoDark text-white font-bold py-3.5 rounded-2xl shadow-md transition duration-200 text-sm mt-8 active:scale-[0.98]"
            >
              Start Challenge
            </button>
          </div>
        )}

        {/* PHASE 2: PLAYING SCREEN */}
        {phase === 'playing' && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Header stats */}
              <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-50 text-saathi-indigo px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center gap-1.5 text-xs font-extrabold">
                    <Clock size={14} />
                    <span>{timeLeft}s</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-saathi-muted font-bold block">Score</span>
                  <span className="text-lg font-black text-saathi-ink">{score}</span>
                </div>
              </header>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-saathi-line rounded-full mb-6 overflow-hidden">
                <div 
                  className="h-full bg-saathi-indigo transition-all duration-1000"
                  style={{ width: `${(timeLeft / 45) * 100}%` }}
                />
              </div>

              {/* Instruction display */}
              <div className="text-center mb-4">
                <h2 className="text-xs font-bold text-saathi-indigo uppercase tracking-wider">Required Action</h2>
                <h1 className="text-base font-black text-saathi-ink mt-1 flex items-center justify-center gap-1.5">
                  <span className="text-saathi-indigo">🪞</span>
                  {targetTransformName}
                </h1>
              </div>

              {/* Original Grid display card */}
              <div className="bg-white rounded-2xl border border-saathi-line p-5 shadow-card mb-6 text-center">
                <span className="text-[10px] font-extrabold uppercase text-saathi-muted block mb-3">Original Pattern</span>
                <div className="flex justify-center items-center">
                  {renderPatternGrid(originalGrid, 'w-8 h-8')}
                </div>
              </div>

              {/* Streak display */}
              {currentStreak > 0 && (
                <div className="text-center mb-3">
                  <span className="bg-saathi-amberMint text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-200 inline-block animate-bounce shadow-sm">
                    🔥 Streak: {currentStreak}
                  </span>
                </div>
              )}

              {/* Options Grid */}
              <div>
                <span className="text-[10px] font-extrabold uppercase text-saathi-muted block mb-3 text-center">
                  Which is the correct {targetTransformName} pattern?
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {options.map((gridOption, idx) => {
                    const isSelected = feedbackIndex === idx;
                    const isCorrect = idx === correctIndex;
                    let borderClass = 'border-saathi-line bg-white hover:border-saathi-indigo';
                    
                    if (feedbackStatus !== null) {
                      if (isCorrect) {
                        borderClass = 'border-saathi-green bg-emerald-50/20';
                      } else if (isSelected) {
                        borderClass = 'border-saathi-red bg-red-50/20';
                      } else {
                        borderClass = 'border-saathi-line bg-white opacity-40';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={feedbackStatus !== null}
                        onClick={() => handleOptionClick(idx)}
                        className={`border rounded-2xl p-4 shadow-sm transition-all duration-300 flex items-center justify-center min-h-[90px] ${borderClass}`}
                      >
                        <div className="scale-[0.85]">
                          {renderPatternGrid(gridOption, 'w-6 h-6')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Status text */}
            <p className="text-[10px] text-center font-bold text-saathi-muted mt-6">
              Distractors represent other mirror flips and rotations!
            </p>
          </div>
        )}

        {/* PHASE 3: RESULTS SCREEN */}
        {phase === 'results' && (
          <div className="flex-1 flex flex-col justify-between" style={{ animation: 'brain-scale-in 0.4s ease-out' }}>
            <div className="text-center">
              <header className="mb-6">
                <h2 className="text-2xl font-extrabold text-saathi-ink">🪞 Challenge Complete!</h2>
                <p className="text-xs font-bold text-saathi-indigo mt-1 uppercase tracking-wider">Mirror & Rotation Arena</p>
              </header>

              {/* Score Display */}
              <div className="flex justify-center mb-6">
                <div className="w-28 h-28 border-4 border-saathi-indigo rounded-full flex flex-col items-center justify-center bg-indigo-50/30">
                  <span className="text-3xl font-black text-saathi-indigo">{score}</span>
                  <span className="text-[10px] font-bold text-saathi-muted uppercase">Points</span>
                </div>
              </div>

              {/* Star Rating based on accuracy */}
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => {
                  const rating = totalAnswered > 0 ? (correctCount / totalAnswered) * 5 : 0;
                  return (
                    <Star
                      key={s}
                      size={22}
                      className={s <= Math.round(rating) ? 'text-saathi-amber fill-saathi-amber' : 'text-gray-200'}
                    />
                  );
                })}
              </div>

              {/* Performance Label */}
              <div className="mb-6">
                <p className="text-sm font-extrabold text-saathi-ink">
                  {correctCount >= 10 && (correctCount / totalAnswered) >= 0.8
                    ? '🏆 Grand Master Detective!'
                    : correctCount >= 6 && (correctCount / totalAnswered) >= 0.7
                    ? '🌟 High Visual Processing Speed!'
                    : correctCount >= 4
                    ? '👍 Nice Spatial Object Tracking!'
                    : '🔁 Keep Practicing Flips!'}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">🎯</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0}%
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Accuracy</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">⚡</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {reactionTimes.length > 0
                      ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 1000).toFixed(1)
                      : '0.0'}s
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Avg Response</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">🔥</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {longestStreak}
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Best Streak</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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
