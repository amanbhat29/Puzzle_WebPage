import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Clock, Award, Star, RotateCcw, HelpCircle } from 'lucide-react';
import { savePuzzleResult } from '../../utils/storage';
import { getUniqueQuestion } from '../../utils/nonRepeatingGenerator';

// Grid size configuration
const GRID_SIZE = 5;

// Compass directions helper
const DIRS = {
  'North': { dr: -1, dc: 0, arrow: '↑' },
  'South': { dr: 1, dc: 0, arrow: '↓' },
  'East': { dr: 0, dc: 1, arrow: '→' },
  'West': { dr: 0, dc: -1, arrow: '←' }
};

// Generates a random walk that stays inside the grid
function generateRandomPath(numMovements) {
  let r = Math.floor(Math.random() * GRID_SIZE);
  let c = Math.floor(Math.random() * GRID_SIZE);
  const start = [r, c];
  const visited = [[r, c]];
  const movements = [];

  const dirNames = Object.keys(DIRS);

  for (let i = 0; i < numMovements; i++) {
    // Pick valid directions that keep the next step inside grid
    const validDirs = dirNames.filter((name) => {
      const { dr, dc } = DIRS[name];
      // Try walking 1 or 2 steps
      const nr = r + dr;
      const nc = c + dc;
      return nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE;
    });

    if (validDirs.length === 0) break;
    const dir = validDirs[Math.floor(Math.random() * validDirs.length)];
    const { dr, dc } = DIRS[dir];

    // Determine step count: 1 or 2 steps (if possible)
    let steps = 1;
    if (Math.random() > 0.5) {
      const nr2 = r + dr * 2;
      const nc2 = c + dc * 2;
      if (nr2 >= 0 && nr2 < GRID_SIZE && nc2 >= 0 && nc2 < GRID_SIZE) {
        steps = 2;
      }
    }

    // Traverse
    for (let s = 1; s <= steps; s++) {
      r += dr;
      c += dc;
      visited.push([r, c]);
    }

    movements.push({ direction: dir, distance: steps });
  }

  return { start, end: [r, c], steps: movements, visited };
}

// Helper to determine relative direction from start to end
function getRelativeDirection(start, end) {
  const dr = end[0] - start[0]; // negative = North, positive = South
  const dc = end[1] - start[1]; // negative = West, positive = East

  if (dr === 0 && dc === 0) return 'Same Position';
  if (dr < 0 && dc === 0) return 'North';
  if (dr > 0 && dc === 0) return 'South';
  if (dr === 0 && dc > 0) return 'East';
  if (dr === 0 && dc < 0) return 'West';
  if (dr < 0 && dc > 0) return 'Northeast';
  if (dr < 0 && dc < 0) return 'Northwest';
  if (dr > 0 && dc > 0) return 'Southeast';
  if (dr > 0 && dc < 0) return 'Southwest';
  return 'Unknown';
}

export default function DirectionNavigatorPage() {
  const navigate = useNavigate();

  // ── State variables ──────────────────────────────────────────────────────
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'results'
  const [difficulty, setDifficulty] = useState('easy');

  // Game state
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  // Active question details
  const [startPos, setStartPos] = useState([2, 2]);
  const [endPos, setEndPos] = useState([2, 2]);
  const [movements, setMovements] = useState([]);
  const [fullPath, setFullPath] = useState([]);
  
  // Animation state
  const [animationPhase, setAnimationPhase] = useState('idle'); // 'idle' | 'animating' | 'countdown' | 'question'
  const [animatedCells, setAnimatedCells] = useState([]); // List of coordinates visited
  const [animatedCharacterPos, setAnimatedCharacterPos] = useState([2, 2]);
  const [animationStepIndex, setAnimationStepIndex] = useState(-1);
  const [countdownTime, setCountdownTime] = useState(3);

  // Question details
  const [questionType, setQuestionType] = useState(1); // 1: where is character, 2: which direction, 3: steps away, 4: which path
  const [options, setOptions] = useState([]); // Multiple choice options
  const [correctOptionIdx, setCorrectOptionIdx] = useState(-1);
  
  // User submissions
  const [userSelectedCell, setUserSelectedCell] = useState(null); // [r,c] for Type 1
  const [userSelectedOptionIdx, setUserSelectedOptionIdx] = useState(null); // Index for Types 2, 3, 4

  // Analytics
  const [totalQuestions, setTotalQuestions] = useState(5); // 5 rounds total
  const [correctCount, setCorrectCount] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  
  // Feedback
  const [feedbackStatus, setFeedbackStatus] = useState(null); // 'correct' | 'wrong' | null

  // Timers and intervals references
  const animIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  // ── Get difficulty configuration ──────────────────────────────────────────
  const getDifficultyConfig = (diff) => {
    switch (diff) {
      case 'easy':
        return { numMovements: 2, pathDuration: 4000, countdown: 3 };
      case 'medium':
        return { numMovements: 3, pathDuration: 3000, countdown: 2 };
      case 'hard':
        return { numMovements: 4, pathDuration: 2000, countdown: 1 };
      default:
        return { numMovements: 2, pathDuration: 4000, countdown: 3 };
    }
  };

  const generateQuestionData = useCallback((diff) => {
    const config = getDifficultyConfig(diff);
    
    // 1. Generate path
    const path = generateRandomPath(config.numMovements);

    // 2. Select Question Type
    // Easy: Type 1 & 2. Medium: Type 1, 2, 3. Hard: Type 1, 2, 3, 4.
    let type = 1;
    const rand = Math.random();
    if (diff === 'easy') {
      type = rand > 0.5 ? 1 : 2;
    } else if (diff === 'medium') {
      type = rand < 0.35 ? 1 : rand < 0.7 ? 2 : 3;
    } else {
      type = rand < 0.25 ? 1 : rand < 0.5 ? 2 : rand < 0.75 ? 3 : 4;
    }

    // 4. Set up Options based on Question Type
    const correctDir = getRelativeDirection(path.start, path.end);
    const manhattanDist = Math.abs(path.end[0] - path.start[0]) + Math.abs(path.end[1] - path.start[1]);

    let options = [];
    let correctOptionIdx = null;

    if (type === 2) {
      // Direction options
      const directions = ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];
      const correctIdx = directions.indexOf(correctDir);
      
      // Shuffle directions but keep correct option
      const pool = directions.filter(d => d !== correctDir).sort(() => Math.random() - 0.5).slice(0, 3);
      const combined = [correctDir, ...pool].sort(() => Math.random() - 0.5);
      const newCorrectIdx = combined.indexOf(correctDir);
      
      options = combined;
      correctOptionIdx = newCorrectIdx;
    } else if (type === 3) {
      // Steps away options
      const correctVal = `${manhattanDist} steps`;
      const choices = new Set([correctVal]);
      
      while (choices.size < 4) {
        const offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const val = Math.max(0, manhattanDist + offset);
        choices.add(`${val} steps`);
      }
      
      const combined = Array.from(choices).sort(() => Math.random() - 0.5);
      const newCorrectIdx = combined.indexOf(correctVal);
      
      options = combined;
      correctOptionIdx = newCorrectIdx;
    } else if (type === 4) {
      // Correct path sequence option
      const formatPathString = (steps) => steps.map(s => `${s.distance} ${s.direction}`).join(' → ');
      const correctPathStr = formatPathString(path.steps);
      
      const choices = new Set([correctPathStr]);
      
      while (choices.size < 4) {
        // Mutate correct steps slightly
        const mutated = path.steps.map(s => {
          if (Math.random() > 0.5) {
            const dirs = ['North', 'South', 'East', 'West'].filter(d => d !== s.direction);
            return { direction: dirs[Math.floor(Math.random() * dirs.length)], distance: s.distance };
          }
          return { direction: s.direction, distance: s.distance === 1 ? 2 : 1 };
        });
        choices.add(formatPathString(mutated));
      }
      
      const combined = Array.from(choices).sort(() => Math.random() - 0.5);
      const newCorrectIdx = combined.indexOf(correctPathStr);
      
      options = combined;
      correctOptionIdx = newCorrectIdx;
    }

    return { path, type, options, correctOptionIdx };
  }, []);

  // ── Question Generator ───────────────────────────────────────────────────
  const generateQuestion = useCallback((diff, currentRound) => {
    const data = getUniqueQuestion(`direction-${diff}`, () => generateQuestionData(diff), (q) => q.path.steps.map(s => s.direction + s.distance).join(',') + '-' + q.type);
    
    setStartPos(data.path.start);
    setEndPos(data.path.end);
    setMovements(data.path.steps);
    setFullPath(data.path.visited);
    setQuestionType(data.type);

    // 3. Reset states for animation
    setAnimationPhase('animating');
    setAnimatedCells([data.path.start]);
    setAnimatedCharacterPos(data.path.start);
    setAnimationStepIndex(0);
    setUserSelectedCell(null);
    setUserSelectedOptionIdx(null);
    setFeedbackStatus(null);

    setOptions(data.options);
    setCorrectOptionIdx(data.correctOptionIdx);
  }, [generateQuestionData]);

  // ── Traversal Animation loop ──────────────────────────────────────────────
  useEffect(() => {
    if (animationPhase !== 'animating') return;

    const intervalTime = 600; // Time per cell step
    let cellIdx = 1;

    animIntervalRef.current = setInterval(() => {
      if (cellIdx < fullPath.length) {
        const nextCell = fullPath[cellIdx];
        setAnimatedCells((prev) => [...prev, nextCell]);
        setAnimatedCharacterPos(nextCell);
        
        // Find which movement step this cell belongs to for indicator highlights
        let accCells = 1;
        let stepIdx = 0;
        for (let i = 0; i < movements.length; i++) {
          accCells += movements[i].distance;
          if (cellIdx < accCells) {
            stepIdx = i;
            break;
          }
        }
        setAnimationStepIndex(stepIdx);
        cellIdx++;
      } else {
        clearInterval(animIntervalRef.current);
        
        // Start countdown to hide path
        const config = getDifficultyConfig(difficulty);
        setAnimationPhase('countdown');
        setCountdownTime(config.countdown);
      }
    }, intervalTime);

    return () => clearInterval(animIntervalRef.current);
  }, [animationPhase, fullPath, movements, difficulty]);

  // ── Countdown timer to hide path ──────────────────────────────────────────
  useEffect(() => {
    if (animationPhase !== 'countdown') return;

    countdownIntervalRef.current = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setAnimationPhase('question');
          setQuestionStartTime(Date.now());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownIntervalRef.current);
  }, [animationPhase]);

  // ── Start Game ────────────────────────────────────────────────────────────
  const startGame = () => {
    setPhase('playing');
    setRound(1);
    setScore(0);
    setCorrectCount(0);
    setReactionTimes([]);
    setAnimationPhase('idle');
    generateQuestion(difficulty, 1);
  };

  // ── Clean up intervals on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  // ── Handle submission ─────────────────────────────────────────────────────
  const submitAnswer = () => {
    if (feedbackStatus !== null) return; // Already submitted

    const rt = Date.now() - questionStartTime;
    setReactionTimes((prev) => [...prev, rt]);

    let isCorrect = false;

    if (questionType === 1) {
      // Grid cell selected
      if (!userSelectedCell) return; // Must select a cell
      isCorrect = userSelectedCell[0] === endPos[0] && userSelectedCell[1] === endPos[1];
    } else {
      // Multiple choice option
      if (userSelectedOptionIdx === null) return; // Must select an option
      isCorrect = userSelectedOptionIdx === correctOptionIdx;
    }

    if (isCorrect) {
      setFeedbackStatus('correct');
      setCorrectCount((prev) => prev + 1);
      // Score calculation: +20 for correct, faster response gives bonus
      const speedBonus = Math.max(0, 10 - Math.round(rt / 1000));
      setScore((prev) => prev + 20 + speedBonus);
    } else {
      setFeedbackStatus('wrong');
    }

    // Go to next round after showing feedback
    feedbackTimeoutRef.current = setTimeout(() => {
      if (round < totalQuestions) {
        const nextRound = round + 1;
        setRound(nextRound);
        generateQuestion(difficulty, nextRound);
      } else {
        setPhase('results');
      }
    }, 2000);
  };

  // ── Save Results to local storage ─────────────────────────────────────────
  useEffect(() => {
    if (phase === 'results') {
      const accuracy = Math.round((correctCount / totalQuestions) * 100);
      const avgRt = reactionTimes.length > 0
        ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 1000)
        : 0;

      savePuzzleResult({
        puzzleId: 14,
        score: score,
        accuracy: accuracy,
        timeTaken: avgRt * totalQuestions,
        difficulty: difficulty
      });
    }
  }, [phase, score, correctCount, totalQuestions, reactionTimes, difficulty]);

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
                  <h1 className="text-xl font-extrabold text-saathi-ink">Direction Navigator</h1>
                </div>
              </header>

              <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 shadow-sm mb-6 text-center">
                <span className="text-4xl">🧭</span>
                <h2 className="text-base font-extrabold text-saathi-ink mt-3">Track the Compass!</h2>
                <p className="text-xs text-saathi-muted font-medium mt-2 leading-relaxed">
                  Track the animated movement of the character on the grid based on sequential directions. 
                  Remember the path, and answer questions about the character's final location, distance, or direction!
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
                  <p className="font-extrabold">Assessment Objectives:</p>
                  <ul className="list-disc ml-4 mt-1 font-semibold space-y-1">
                    <li>Tests spatial orientation, direction sense, and visual memory.</li>
                    <li>Hard mode features complex paths and instant path hiding!</li>
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
              <header className="flex justify-between items-center mb-4">
                <div className="text-xs font-extrabold text-saathi-indigo uppercase tracking-wider">
                  Round {round} of {totalQuestions}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-saathi-muted font-bold block uppercase">Points</span>
                  <span className="text-sm font-black text-saathi-ink">{score}</span>
                </div>
              </header>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-saathi-line rounded-full mb-4 overflow-hidden">
                <div 
                  className="h-full bg-saathi-indigo transition-all duration-300"
                  style={{ width: `${(round / totalQuestions) * 100}%` }}
                />
              </div>

              {/* Grid representation */}
              <div className="flex flex-col items-center mb-4">
                <div className="grid grid-cols-5 gap-1.5 p-2 bg-gray-50 border border-saathi-line rounded-2xl shadow-sm relative">
                  
                  {/* Grid cells */}
                  {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
                    const r = Math.floor(idx / GRID_SIZE);
                    const c = idx % GRID_SIZE;
                    
                    const isStart = r === startPos[0] && c === startPos[1];
                    const isEnd = r === endPos[0] && c === endPos[1];
                    
                    // Highlight logic
                    const isVisited = animatedCells.some(cell => cell[0] === r && cell[1] === c);
                    const isPathVisible = animationPhase === 'animating' || animationPhase === 'countdown';
                    const isCharacter = r === animatedCharacterPos[0] && c === animatedCharacterPos[1];
                    
                    // Click selection logic for Type 1
                    const isUserSelected = userSelectedCell && userSelectedCell[0] === r && userSelectedCell[1] === c;

                    let cellBg = 'bg-white';
                    let cellBorder = 'border-gray-100';

                    if (isPathVisible) {
                      if (isVisited) {
                        cellBg = 'bg-indigo-50/70';
                        cellBorder = 'border-indigo-200';
                      }
                      if (isStart) {
                        cellBg = 'bg-indigo-100';
                        cellBorder = 'border-indigo-300';
                      }
                    } else if (animationPhase === 'question' && feedbackStatus !== null) {
                      // Show answers on feedback phase
                      if (isEnd) {
                        cellBg = 'bg-emerald-50';
                        cellBorder = 'border-saathi-green';
                      } else if (isUserSelected) {
                        cellBg = 'bg-red-50';
                        cellBorder = 'border-saathi-red';
                      }
                    } else if (isUserSelected) {
                      cellBg = 'bg-amber-50';
                      cellBorder = 'border-saathi-amber';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={animationPhase !== 'question' || questionType !== 1 || feedbackStatus !== null}
                        onClick={() => setUserSelectedCell([r, c])}
                        className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 text-xs font-black select-none ${cellBg} ${cellBorder}`}
                      >
                        {isPathVisible && isCharacter && (
                          <span className="text-saathi-indigo text-lg animate-pulse">🚶</span>
                        )}
                        {isPathVisible && isStart && !isCharacter && (
                          <span className="text-[10px] font-bold text-saathi-indigo/50 uppercase">Start</span>
                        )}
                        {!isPathVisible && isStart && (
                          <span className="text-saathi-indigo text-xs font-extrabold">Start</span>
                        )}
                        {!isPathVisible && animationPhase === 'question' && isEnd && feedbackStatus !== null && (
                          <span className="text-saathi-green text-sm">🚩</span>
                        )}
                        {isUserSelected && feedbackStatus === null && (
                          <span className="text-saathi-amber text-xs">📍</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instructions and path sequence rendering */}
              <div className="bg-white rounded-2xl border border-saathi-line p-4 shadow-sm text-center">
                
                {/* ANIMATION PHASE: TRAVERSAL INDICATORS */}
                {animationPhase === 'animating' && (
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-saathi-indigo block mb-1">Character is moving...</span>
                    <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                      {movements.map((m, idx) => (
                        <span 
                          key={idx}
                          className={`text-xs font-extrabold px-3 py-1 rounded-xl border transition-all duration-300 ${
                            animationStepIndex === idx 
                              ? 'bg-saathi-indigo text-white border-saathi-indigo scale-105 shadow-sm'
                              : animationStepIndex > idx 
                              ? 'bg-gray-50 text-saathi-muted border-saathi-line line-through'
                              : 'bg-white text-saathi-ink border-saathi-line'
                          }`}
                        >
                          {m.distance} {m.direction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* COUNTDOWN PHASE */}
                {animationPhase === 'countdown' && (
                  <div className="py-2">
                    <span className="text-[10px] font-extrabold uppercase text-saathi-amber block">Memorize the endpoint!</span>
                    <p className="text-lg font-black text-saathi-amber mt-1 animate-pulse">
                      Path hiding in {countdownTime}s...
                    </p>
                  </div>
                )}

                {/* QUESTION PHASE */}
                {animationPhase === 'question' && (
                  <div>
                    {/* Prompt rendering based on question type */}
                    {questionType === 1 && (
                      <div>
                        <span className="bg-indigo-50 text-saathi-indigo text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-indigo-100 uppercase inline-block">
                          Type 1 Assessment
                        </span>
                        <h3 className="text-sm font-extrabold text-saathi-ink mt-2">
                          Where is the character's final location?
                        </h3>
                        <p className="text-[10px] text-saathi-muted font-medium mt-1">
                          Click the final grid cell above, then click submit.
                        </p>
                      </div>
                    )}
                    {questionType === 2 && (
                      <div>
                        <span className="bg-indigo-50 text-saathi-indigo text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-indigo-100 uppercase inline-block">
                          Type 2 Assessment
                        </span>
                        <h3 className="text-sm font-extrabold text-saathi-ink mt-2">
                          Which direction is the destination from the start?
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {options.map((opt, idx) => {
                            let btnStyle = 'border-saathi-line text-saathi-ink bg-white hover:bg-gray-50';
                            if (userSelectedOptionIdx === idx) {
                              btnStyle = 'border-saathi-indigo text-saathi-indigo bg-indigo-50/30 font-black';
                            }
                            if (feedbackStatus !== null) {
                              if (idx === correctOptionIdx) {
                                btnStyle = 'border-saathi-green text-saathi-green bg-emerald-50/20 font-black';
                              } else if (userSelectedOptionIdx === idx) {
                                btnStyle = 'border-saathi-red text-saathi-red bg-red-50/20';
                              } else {
                                btnStyle = 'border-saathi-line text-saathi-muted bg-white opacity-40';
                              }
                            }

                            return (
                              <button
                                key={idx}
                                disabled={feedbackStatus !== null}
                                onClick={() => setUserSelectedOptionIdx(idx)}
                                className={`py-2 px-3 border rounded-xl text-xs font-bold transition duration-200 ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {questionType === 3 && (
                      <div>
                        <span className="bg-indigo-50 text-saathi-indigo text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-indigo-100 uppercase inline-block">
                          Type 3 Assessment
                        </span>
                        <h3 className="text-sm font-extrabold text-saathi-ink mt-2">
                          How many steps away is the destination?
                        </h3>
                        <p className="text-[10px] text-saathi-muted font-medium mb-3">
                          (Calculated as total grid steps from the start point)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {options.map((opt, idx) => {
                            let btnStyle = 'border-saathi-line text-saathi-ink bg-white hover:bg-gray-50';
                            if (userSelectedOptionIdx === idx) {
                              btnStyle = 'border-saathi-indigo text-saathi-indigo bg-indigo-50/30 font-black';
                            }
                            if (feedbackStatus !== null) {
                              if (idx === correctOptionIdx) {
                                btnStyle = 'border-saathi-green text-saathi-green bg-emerald-50/20 font-black';
                              } else if (userSelectedOptionIdx === idx) {
                                btnStyle = 'border-saathi-red text-saathi-red bg-red-50/20';
                              } else {
                                btnStyle = 'border-saathi-line text-saathi-muted bg-white opacity-40';
                              }
                            }

                            return (
                              <button
                                key={idx}
                                disabled={feedbackStatus !== null}
                                onClick={() => setUserSelectedOptionIdx(idx)}
                                className={`py-2 px-3 border rounded-xl text-xs font-bold transition duration-200 ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {questionType === 4 && (
                      <div>
                        <span className="bg-indigo-50 text-saathi-indigo text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-indigo-100 uppercase inline-block">
                          Type 4 Assessment
                        </span>
                        <h3 className="text-sm font-extrabold text-saathi-ink mt-2">
                          Which path sequence reaches the destination?
                        </h3>
                        <div className="space-y-2 mt-4">
                          {options.map((opt, idx) => {
                            let btnStyle = 'border-saathi-line text-saathi-ink bg-white hover:bg-gray-50';
                            if (userSelectedOptionIdx === idx) {
                              btnStyle = 'border-saathi-indigo text-saathi-indigo bg-indigo-50/30 font-black';
                            }
                            if (feedbackStatus !== null) {
                              if (idx === correctOptionIdx) {
                                btnStyle = 'border-saathi-green text-saathi-green bg-emerald-50/20 font-black';
                              } else if (userSelectedOptionIdx === idx) {
                                btnStyle = 'border-saathi-red text-saathi-red bg-red-50/20';
                              } else {
                                btnStyle = 'border-saathi-line text-saathi-muted bg-white opacity-40';
                              }
                            }

                            return (
                              <button
                                key={idx}
                                disabled={feedbackStatus !== null}
                                onClick={() => setUserSelectedOptionIdx(idx)}
                                className={`w-full py-2 px-3 border rounded-xl text-[10px] font-bold text-left transition duration-200 ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Submit findings / Next buttons */}
            {animationPhase === 'question' && (
              <div className="mt-6">
                {feedbackStatus === null ? (
                  <button
                    onClick={submitAnswer}
                    disabled={
                      (questionType === 1 && !userSelectedCell) ||
                      (questionType !== 1 && userSelectedOptionIdx === null)
                    }
                    className={`w-full font-bold py-3.5 rounded-2xl shadow transition duration-200 text-sm ${
                      (questionType === 1 && userSelectedCell) ||
                      (questionType !== 1 && userSelectedOptionIdx !== null)
                        ? 'bg-saathi-indigo text-white hover:bg-saathi-indigoDark active:scale-[0.98]'
                        : 'bg-gray-100 text-saathi-muted cursor-not-allowed border border-saathi-line'
                    }`}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div className="text-center py-2">
                    {feedbackStatus === 'correct' ? (
                      <span className="text-saathi-green font-extrabold text-sm flex items-center justify-center gap-1.5 animate-bounce">
                        ✅ Correct! Well Navigated (+25 pts)
                      </span>
                    ) : (
                      <span className="text-saathi-red font-extrabold text-sm flex items-center justify-center gap-1.5 animate-shake">
                        ❌ Incorrect! Keep practicing sense of direction
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Animation state text */}
            {animationPhase !== 'question' && (
              <div className="h-12 flex items-center justify-center">
                <p className="text-[10px] font-bold text-saathi-muted animate-pulse uppercase">
                  Follow the step-by-step path closely...
                </p>
              </div>
            )}

          </div>
        )}

        {/* PHASE 3: RESULTS SCREEN */}
        {phase === 'results' && (
          <div className="flex-1 flex flex-col justify-between" style={{ animation: 'brain-scale-in 0.4s ease-out' }}>
            <div className="text-center">
              <header className="mb-6">
                <h2 className="text-2xl font-extrabold text-saathi-ink">🧭 Challenge Complete!</h2>
                <p className="text-xs font-bold text-saathi-indigo mt-1 uppercase tracking-wider">Direction Navigator Arena</p>
              </header>

              {/* Score Display */}
              <div className="flex justify-center mb-6">
                <div className="w-28 h-28 border-4 border-saathi-indigo rounded-full flex flex-col items-center justify-center bg-indigo-50/30">
                  <span className="text-3xl font-black text-saathi-indigo">{score}</span>
                  <span className="text-[10px] font-bold text-saathi-muted uppercase">Points</span>
                </div>
              </div>

              {/* Star Rating based on correct answers */}
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={22}
                    className={s <= correctCount ? 'text-saathi-amber fill-saathi-amber' : 'text-gray-200'}
                  />
                ))}
              </div>

              {/* Performance Label */}
              <div className="mb-6">
                <p className="text-sm font-extrabold text-saathi-ink">
                  {correctCount === 5
                    ? '🏆 Grand Master Navigator!'
                    : correctCount >= 4
                    ? '🌟 Excellent Direction Sense!'
                    : correctCount >= 2
                    ? '👍 Good Orientation Skills!'
                    : '🔁 Practice Grid Navigation!'}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white border border-saathi-line rounded-2xl p-4 shadow-sm">
                  <span className="text-lg">🎯</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {correctCount} / {totalQuestions}
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Correct Rounds</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-4 shadow-sm">
                  <span className="text-lg">⏱️</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {reactionTimes.length > 0
                      ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 1000).toFixed(1)
                      : '0.0'}s
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Avg Answer Time</p>
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
