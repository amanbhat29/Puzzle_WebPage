import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Clock, Award, Star, RotateCcw, HelpCircle, Check, X, Trophy, Zap, RotateCw } from 'lucide-react';
import { savePuzzleResult } from '../../utils/storage';

// Helper to generate a random connected shape
function generateRandomShape(size) {
  const shape = [[0, 0]];
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];
  
  while (shape.length < size) {
    // Pick a random block in current shape
    const base = shape[Math.floor(Math.random() * shape.length)];
    // Pick a random adjacent direction
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const nr = base[0] + dir[0];
    const nc = base[1] + dir[1];
    
    // Check if cell already exists in shape
    if (!shape.some(cell => cell[0] === nr && cell[1] === nc)) {
      shape.push([nr, nc]);
    }
  }
  return normalizeShape(shape);
}

// Helper to normalize shape coordinates to start at (0, 0)
function normalizeShape(shape) {
  let minR = Infinity;
  let minC = Infinity;
  shape.forEach(([r, c]) => {
    if (r < minR) minR = r;
    if (c < minC) minC = c;
  });
  
  const normalized = shape.map(([r, c]) => [r - minR, c - minC]);
  // Sort coordinates to make comparison easy
  normalized.sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);
  return normalized;
}

// Helper to rotate a shape
function rotateShape(shape, angle) {
  let rotated;
  if (angle === 90) {
    rotated = shape.map(([r, c]) => [c, -r]);
  } else if (angle === 180) {
    rotated = shape.map(([r, c]) => [-r, -c]);
  } else if (angle === 270) {
    rotated = shape.map(([r, c]) => [-c, r]);
  } else {
    rotated = shape.map(([r, c]) => [r, c]);
  }
  return normalizeShape(rotated);
}

// Helper to reflect a shape horizontally
function reflectShapeH(shape) {
  const reflected = shape.map(([r, c]) => [r, -c]);
  return normalizeShape(reflected);
}

// Helper to reflect a shape vertically
function reflectShapeV(shape) {
  const reflected = shape.map(([r, c]) => [-r, c]);
  return normalizeShape(reflected);
}

// Helper to check if two shapes are identical
function areShapesEqual(shape1, shape2) {
  if (shape1.length !== shape2.length) return false;
  for (let i = 0; i < shape1.length; i++) {
    if (shape1[i][0] !== shape2[i][0] || shape1[i][1] !== shape2[i][1]) {
      return false;
    }
  }
  return true;
}

// Convert shape to string key for matching
function getShapeKey(shape) {
  return shape.map(([r, c]) => `${r},${c}`).join(';');
}

export default function ShapeRotationPage() {
  const navigate = useNavigate();

  // ── State variables ──────────────────────────────────────────────────────
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'results'
  const [difficulty, setDifficulty] = useState('easy');

  // Game timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);

  // Active question
  const [originalShape, setOriginalShape] = useState([]);
  const [targetRotation, setTargetRotation] = useState(90);
  const [correctRotatedShape, setCorrectRotatedShape] = useState([]);
  const [options, setOptions] = useState([]); // List of shapes
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
        return { shapeSize: 4, possibleAngles: [90, 180] };
      case 'medium':
        return { shapeSize: 5, possibleAngles: [90, 180, 270] };
      case 'hard':
        return { shapeSize: 6, possibleAngles: [90, 180, 270] };
      default:
        return { shapeSize: 4, possibleAngles: [90, 180] };
    }
  };

  // ── Question Generator ───────────────────────────────────────────────────
  const generateQuestion = useCallback((diff) => {
    const config = getDifficultyConfig(diff);
    const size = config.shapeSize;
    const angles = config.possibleAngles;

    // 1. Generate random base shape
    const shape = generateRandomShape(size);
    // 2. Select target rotation angle
    const angle = angles[Math.floor(Math.random() * angles.length)];
    // 3. Rotate shape to get correct option
    const correctShape = rotateShape(shape, angle);

    // 4. Generate distractors
    const distractorsPool = [];
    const correctKey = getShapeKey(correctShape);
    const seenKeys = new Set([correctKey, getShapeKey(shape)]);

    const reflections = [
      reflectShapeH(shape),
      reflectShapeV(shape)
    ];

    const allAngles = [0, 90, 180, 270];

    // Try reflection options
    for (const ref of reflections) {
      for (const ang of allAngles) {
        const rotatedRef = rotateShape(ref, ang);
        const key = getShapeKey(rotatedRef);
        if (!seenKeys.has(key)) {
          distractorsPool.push(rotatedRef);
          seenKeys.add(key);
        }
      }
    }

    // Try other rotations of base shape that aren't the target rotation
    for (const ang of allAngles) {
      const rotated = rotateShape(shape, ang);
      const key = getShapeKey(rotated);
      if (!seenKeys.has(key)) {
        distractorsPool.push(rotated);
        seenKeys.add(key);
      }
    }

    // Fallback: generate random shapes of the same size if needed
    while (distractorsPool.length < 3) {
      const randShape = generateRandomShape(size);
      let isCongruent = false;
      for (const ang of allAngles) {
        if (areShapesEqual(rotateShape(shape, ang), randShape)) isCongruent = true;
        if (areShapesEqual(rotateShape(reflectShapeH(shape), ang), randShape)) isCongruent = true;
      }
      
      const key = getShapeKey(randShape);
      if (!isCongruent && !seenKeys.has(key)) {
        distractorsPool.push(randShape);
        seenKeys.add(key);
      }
    }

    // Shuffle distractors pool and take exactly 3
    const selectedDistractors = distractorsPool.sort(() => Math.random() - 0.5).slice(0, 3);

    // Combine correct and distractors
    const allOptions = [correctShape, ...selectedDistractors].sort(() => Math.random() - 0.5);

    // Find the correct index
    const correctIdx = allOptions.findIndex(opt => areShapesEqual(opt, correctShape));

    setOriginalShape(shape);
    setTargetRotation(angle);
    setCorrectRotatedShape(correctShape);
    setOptions(allOptions);
    setCorrectIndex(correctIdx);
    setFeedbackIndex(null);
    setFeedbackStatus(null);
    setQuestionStartTime(Date.now());
  }, []);

  // ── Start Game ────────────────────────────────────────────────────────────
  const startGame = () => {
    setPhase('playing');
    setTimeLeft(60);
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
        puzzleId: 13,
        score: score,
        accuracy: accuracy,
        timeTaken: avgRt * totalAnswered, // Total active playing time
        difficulty: difficulty
      });
    }
  }, [phase, score, correctCount, totalAnswered, reactionTimes, difficulty]);

  // ── Grid Renderer for Shapes ──────────────────────────────────────────────
  const renderShapeGrid = (shape, sizeClass = 'w-5 h-5', gapClass = 'gap-1') => {
    // If shape is empty, return null
    if (!shape || shape.length === 0) return null;

    // Find custom dynamic grid bounds to center the shape
    const maxR = Math.max(...shape.map(c => c[0]));
    const maxC = Math.max(...shape.map(c => c[1]));
    const dimension = Math.max(3, maxR + 1, maxC + 1);

    return (
      <div 
        className={`grid ${gapClass} bg-slate-50/70 p-2 rounded-2xl border border-slate-200/40 shadow-inner inline-grid animate-brain-fade-in`}
        style={{ gridTemplateColumns: `repeat(${dimension}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: dimension * dimension }).map((_, idx) => {
          const r = Math.floor(idx / dimension);
          const c = idx % dimension;
          const isActive = shape.some(cell => cell[0] === r && cell[1] === c);
          return (
            <div 
              key={idx} 
              className={`rounded-lg transition-all duration-300 ${sizeClass} ${
                isActive 
                  ? 'bg-gradient-to-br from-indigo-500 via-indigo-650 to-violet-600 shadow-[0_2.5px_5px_rgba(99,102,241,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-indigo-500/20' 
                  : 'bg-white border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]'
              }`}
            />
          );
        })}
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
                  <h1 className="text-xl font-extrabold text-saathi-ink">Shape Rotation</h1>
                </div>
              </header>

              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 shadow-sm mb-6 text-center">
                <span className="text-4xl">🔄</span>
                <h2 className="text-base font-extrabold text-saathi-ink mt-3">Rotate and Match!</h2>
                <p className="text-xs text-saathi-muted font-medium mt-2 leading-relaxed">
                  Mental Rotation tests your ability to visualize objects from different viewpoints. 
                  Identify which of the 4 options represents the original block shape rotated by the specified angle!
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

              {/* Specific info */}
              <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100 flex gap-3 text-xs text-amber-800">
                <HelpCircle size={18} className="shrink-0 text-saathi-amber" />
                <div>
                  <p className="font-extrabold">Tips for success:</p>
                  <ul className="list-disc ml-4 mt-1 font-semibold space-y-1">
                    <li>Watch out for mirror reflections—they look correct but cannot be formed by pure rotation.</li>
                    <li>Hard mode features larger shapes (6 blocks) and a fast timer!</li>
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
          <div className="flex-1 flex flex-col justify-between h-full animate-brain-fade-in">
            <div className="w-full">
              {/* Dashboard Stats Header */}
              <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white/85 backdrop-blur-md border border-saathi-line p-3 sm:p-4 rounded-2xl shadow-card mb-6">
                {/* Left: Timer & Difficulty Badge */}
                <div className="flex items-center gap-2 justify-between sm:justify-start">
                  <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-black transition-all duration-300 border ${
                    timeLeft <= 15
                      ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                      : 'bg-indigo-50 border-indigo-100 text-saathi-indigo'
                  }`}>
                    <Clock size={14} className={timeLeft <= 15 ? 'animate-bounce' : ''} />
                    <span>{timeLeft}s</span>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase border tracking-wider ${
                    difficulty === 'easy'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                      : difficulty === 'medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-150'
                      : 'bg-rose-50 text-rose-700 border-rose-150'
                  }`}>
                    {difficulty}
                  </span>
                </div>

                {/* Center: Question Counter & Accuracy Capsule */}
                <div className="flex items-center justify-between sm:justify-center gap-3 bg-slate-50/60 border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-650">
                  <div className="flex items-center gap-1">
                    <Target size={14} className="text-indigo-500" />
                    <span>Q: {totalAnswered + 1}</span>
                  </div>
                  <div className="h-3 w-px bg-slate-200" />
                  <div>
                    <span>Acc: {totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0}%</span>
                  </div>
                </div>

                {/* Right: Score & Streak */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5">
                  <div className="bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-extrabold text-saathi-ink">
                    <Trophy size={14} className="text-amber-500 fill-amber-100" />
                    <span>Score: {score}</span>
                  </div>
                  {currentStreak > 0 && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-full shadow-sm animate-bounce shrink-0">
                      <Zap size={10} className="fill-white" />
                      <span>🔥 {currentStreak}</span>
                    </div>
                  )}
                </div>
              </header>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden border border-slate-200/30">
                <div 
                  className={`h-full transition-all duration-1000 rounded-full ${
                    timeLeft <= 15 ? 'bg-rose-500 animate-pulse' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${(timeLeft / 60) * 100}%` }}
                />
              </div>

              {/* Responsive Layout Grid: Left (Showcase) & Right (Options) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* Left Panel: Original Shape & Instructions */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/30 rounded-3xl border-2 border-indigo-100/70 p-6 shadow-md text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px]">
                    {/* Blueprint style grid lines decor */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#eef2ff_1px,transparent_1px),linear-gradient(to_bottom,#eef2ff_1px,transparent_1px)] bg-[size:24px_24px] opacity-35 pointer-events-none" />
                    
                    <div className="relative z-10 w-full flex flex-col items-center">
                      <span className="text-[10px] font-extrabold tracking-widest uppercase text-indigo-500/80 mb-4 bg-indigo-50/80 px-2.5 py-1 rounded-md border border-indigo-100/50">
                        Original Shape
                      </span>
                      <div className="flex justify-center items-center py-2">
                        {renderShapeGrid(originalShape, 'w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-12 md:h-12', 'gap-1.5')}
                      </div>
                    </div>
                  </div>

                  {/* Rotation Instructions */}
                  <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm text-center flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Target Rotation</span>
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 animate-spin-slow">
                        <RotateCw size={20} />
                      </div>
                      <div className="text-left">
                        <div className="text-xl font-black text-slate-800 leading-none">{targetRotation}°</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-0.5">Clockwise</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Multiple Choice Options */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="text-center lg:text-left">
                    <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                      Which option is the same shape rotated by {targetRotation}°?
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    {options.map((shapeOption, idx) => {
                      const isSelected = feedbackIndex === idx;
                      const isCorrect = idx === correctIndex;
                      const isAnswered = feedbackStatus !== null;

                      let stateClass = '';
                      if (!isAnswered) {
                        stateClass = 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md hover:scale-[1.03] active:scale-[0.98] cursor-pointer';
                      } else {
                        if (isCorrect) {
                          stateClass = 'border-emerald-500 bg-emerald-50/20 shadow-emerald-100/50 shadow-md ring-2 ring-emerald-500/20 animate-brain-scale-in z-10';
                        } else if (isSelected) {
                          stateClass = 'border-rose-500 bg-rose-50/20 shadow-rose-100/50 shadow-md ring-2 ring-rose-500/20 animate-brain-shake z-10';
                        } else {
                          stateClass = 'border-slate-100 bg-white opacity-40 scale-95 cursor-default';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswered}
                          onClick={() => handleOptionClick(idx)}
                          className={`relative border-2 rounded-3xl p-4 sm:p-6 flex items-center justify-center transition-all duration-300 aspect-[1.1] sm:aspect-square md:aspect-[1.1] lg:aspect-square ${stateClass}`}
                        >
                          {/* Option Identifier Number Badge */}
                          <span className="absolute top-3 left-3 text-[10px] font-black text-slate-300 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                            {String.fromCharCode(65 + idx)}
                          </span>

                          {/* Feedback Icon Overlay */}
                          {isAnswered && isCorrect && (
                            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-brain-scale-in">
                              <Check className="w-4 h-4 stroke-[3px]" />
                            </div>
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md animate-brain-scale-in">
                              <X className="w-4 h-4 stroke-[3px]" />
                            </div>
                          )}

                          {/* Grid representation of rotated shape option */}
                          <div className="scale-[0.95] xs:scale-100 transition-all duration-300">
                            {renderShapeGrid(shapeOption, 'w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-8.5 md:h-8.5 lg:w-9 lg:h-9', 'gap-1')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Hint or status message */}
            <p className="text-[10px] text-center font-bold text-saathi-muted mt-6">
              Analyze columns, rows and corners. Do not guess!
            </p>
          </div>
        )}

        {/* PHASE 3: RESULTS SCREEN */}
        {phase === 'results' && (
          <div className="flex-1 flex flex-col justify-between" style={{ animation: 'brain-scale-in 0.4s ease-out' }}>
            <div className="text-center">
              <header className="mb-6">
                <h2 className="text-2xl font-extrabold text-saathi-ink">🔄 Challenge Complete!</h2>
                <p className="text-xs font-bold text-saathi-indigo mt-1 uppercase tracking-wider">Shape Rotation Arena</p>
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
                    ? '🏆 Spatial Genius!'
                    : correctCount >= 6 && (correctCount / totalAnswered) >= 0.7
                    ? '🌟 Excellent Rotation Speed!'
                    : correctCount >= 4
                    ? '👍 Good Spatial Sense!'
                    : '🔁 Keep Visualizing!'}
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
