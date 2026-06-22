import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Clock, Award, Star, Trophy, RotateCcw, HelpCircle, Eye } from 'lucide-react';
import { savePuzzleResult } from '../../utils/storage';

// ═══════════════════════════════════════════════════════════════════════════
// VisualRadarPage — Visual Attention Radar Game.
// ═══════════════════════════════════════════════════════════════════════════

const TOTAL_ROUNDS = 5;

const SHAPES = [
  { name: 'Star', glyph: '★' },
  { name: 'Triangle', glyph: '▲' },
  { name: 'Circle', glyph: '●' },
  { name: 'Square', glyph: '■' },
  { name: 'Heart', glyph: '♥' }
];

const COLORS = [
  { name: 'Red', hex: '#ef5543' },
  { name: 'Green', hex: '#3f9674' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Yellow', hex: '#f7b331' },
  { name: 'Violet', hex: '#8b5cf6' }
];

export default function VisualRadarPage() {
  const navigate = useNavigate();

  // ── Core state ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'results'
  const [difficulty, setDifficulty] = useState('easy');

  // ── Game state ──────────────────────────────────────────────────────────
  const [currentRound, setCurrentRound] = useState(1);
  const [gridSize, setGridSize] = useState(3);
  const [boardItems, setBoardItems] = useState([]);
  const [gameState, setGameState] = useState('countdown'); // 'countdown' | 'reveal' | 'question' | 'feedback'

  // Timers
  const [countdownNum, setCountdownNum] = useState(3);
  const [revealTimeLeft, setRevealTimeLeft] = useState(3); // display duration
  const [totalRevealTime, setTotalRevealTime] = useState(3);

  // Question details
  const [currentQuestion, setCurrentQuestion] = useState(null); // { questionText, options: [], answer: '' }
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Stats
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);

  const timerRef = useRef(null);

  // ── Get difficulty configuration ────────────────────────────────────────
  const getDifficultyConfig = useCallback((diff) => {
    switch (diff) {
      case 'easy':
        return { gridSize: 3, duration: 3, shapesCount: 2, colorsCount: 2 };
      case 'medium':
        return { gridSize: 4, duration: 2, shapesCount: 4, colorsCount: 4 };
      case 'hard':
        return { gridSize: 5, duration: 1, shapesCount: 5, colorsCount: 5 };
      default:
        return { gridSize: 3, duration: 3, shapesCount: 2, colorsCount: 2 };
    }
  }, []);

  // ── Generate Dynamic Board and Question ──────────────────────────────────
  const generateBoardAndQuestion = useCallback((roundNum, diff) => {
    const config = getDifficultyConfig(diff);
    setGridSize(config.gridSize);
    setRevealTimeLeft(config.duration);
    setTotalRevealTime(config.duration);
    setSelectedOption(null);
    setGameState('countdown');
    setCountdownNum(3);

    // 1. Generate Board Grid Items
    const totalCells = config.gridSize * config.gridSize;
    const activeShapes = SHAPES.slice(0, config.shapesCount);
    const activeColors = COLORS.slice(0, config.colorsCount);

    const items = [];
    for (let i = 0; i < totalCells; i++) {
      const shape = activeShapes[Math.floor(Math.random() * activeShapes.length)];
      const color = activeColors[Math.floor(Math.random() * activeColors.length)];
      items.push({
        id: i,
        shape: shape.glyph,
        shapeName: shape.name,
        colorHex: color.hex,
        colorName: color.name
      });
    }
    setBoardItems(items);

    // 2. Pre-generate Question based on board data
    const question = generateQuestionFromBoard(items, activeShapes, activeColors, diff);
    setCurrentQuestion(question);
  }, [getDifficultyConfig]);

  // Question Generator Helper
  const generateQuestionFromBoard = (items, activeShapes, activeColors, diff) => {
    // Counts
    const shapeCounts = {};
    const colorCounts = {};
    const comboCounts = {};

    items.forEach((item) => {
      shapeCounts[item.shapeName] = (shapeCounts[item.shapeName] || 0) + 1;
      colorCounts[item.colorName] = (colorCounts[item.colorName] || 0) + 1;
      const comboKey = `${item.colorName}-${item.shapeName}`;
      comboCounts[comboKey] = (comboCounts[comboKey] || 0) + 1;
    });

    const questionTypes = ['shapeCount', 'colorCount', 'mostFreqShape'];
    if (diff !== 'easy') {
      questionTypes.push('comboCount', 'exactlyNShape', 'mostFreqColor');
    }

    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let questionText = '';
    let correctAnswer = '';
    let rawOptions = [];

    switch (type) {
      case 'shapeCount': {
        const targetShape = activeShapes[Math.floor(Math.random() * activeShapes.length)];
        const count = shapeCounts[targetShape.name] || 0;
        questionText = `How many ${targetShape.name}s (${targetShape.glyph}) were shown?`;
        correctAnswer = String(count);
        rawOptions = [count, count + 1, count - 1, count + 2]
          .filter((c) => c >= 0)
          .map(String);
        break;
      }
      case 'colorCount': {
        const targetColor = activeColors[Math.floor(Math.random() * activeColors.length)];
        const count = colorCounts[targetColor.name] || 0;
        questionText = `How many ${targetColor.name} objects were displayed?`;
        correctAnswer = String(count);
        rawOptions = [count, count + 1, count - 1, count + 2]
          .filter((c) => c >= 0)
          .map(String);
        break;
      }
      case 'mostFreqShape': {
        let maxCount = -1;
        let mostFreq = '';
        activeShapes.forEach((s) => {
          const c = shapeCounts[s.name] || 0;
          if (c > maxCount) {
            maxCount = c;
            mostFreq = s.name;
          }
        });
        questionText = `Which shape appeared most frequently?`;
        correctAnswer = mostFreq;
        rawOptions = activeShapes.map((s) => s.name);
        break;
      }
      case 'comboCount': {
        const targetShape = activeShapes[Math.floor(Math.random() * activeShapes.length)];
        const targetColor = activeColors[Math.floor(Math.random() * activeColors.length)];
        const key = `${targetColor.name}-${targetShape.name}`;
        const count = comboCounts[key] || 0;
        questionText = `How many ${targetColor.name} ${targetShape.name}s (${targetShape.glyph}) appeared?`;
        correctAnswer = String(count);
        rawOptions = [count, count + 1, count - 1, count + 2]
          .filter((c) => c >= 0)
          .map(String);
        break;
      }
      case 'exactlyNShape': {
        // Find a count N that belongs to exactly one shape
        const countMap = {};
        activeShapes.forEach((s) => {
          const c = shapeCounts[s.name] || 0;
          countMap[c] = (countMap[c] || []);
          countMap[c].push(s.name);
        });

        // Find a count with length 1
        const uniqueCounts = Object.keys(countMap).filter((c) => countMap[c].length === 1 && Number(c) > 0);

        if (uniqueCounts.length > 0) {
          const count = uniqueCounts[Math.floor(Math.random() * uniqueCounts.length)];
          const shapeName = countMap[count][0];
          questionText = `Which shape appeared exactly ${count} times?`;
          correctAnswer = shapeName;
          rawOptions = activeShapes.map((s) => s.name);
        } else {
          // fallback to shapeCount
          const targetShape = activeShapes[Math.floor(Math.random() * activeShapes.length)];
          const count = shapeCounts[targetShape.name] || 0;
          questionText = `How many ${targetShape.name}s (${targetShape.glyph}) were shown?`;
          correctAnswer = String(count);
          rawOptions = [count, count + 1, count - 1, count + 2]
            .filter((c) => c >= 0)
            .map(String);
        }
        break;
      }
      case 'mostFreqColor': {
        let maxCount = -1;
        let mostFreq = '';
        activeColors.forEach((c) => {
          const count = colorCounts[c.name] || 0;
          if (count > maxCount) {
            maxCount = count;
            mostFreq = c.name;
          }
        });
        questionText = `Which color appeared most frequently?`;
        correctAnswer = mostFreq;
        rawOptions = activeColors.map((c) => c.name);
        break;
      }
    }

    // Ensure 4 unique options, shuffle them
    const uniqueOptions = Array.from(new Set([correctAnswer, ...rawOptions]))
      .slice(0, 4)
      .sort(() => Math.random() - 0.5);

    // If options are fewer than 4 (e.g. easy grid), pad them
    while (uniqueOptions.length < 4) {
      if (type.endsWith('Count')) {
        const lastNum = Number(uniqueOptions[uniqueOptions.length - 1]);
        uniqueOptions.push(String(lastNum + 1));
      } else {
        const remainingShapes = activeShapes.map((s) => s.name).filter((name) => !uniqueOptions.includes(name));
        if (remainingShapes.length > 0) uniqueOptions.push(remainingShapes[0]);
        else uniqueOptions.push('None');
      }
    }

    return {
      questionText,
      options: uniqueOptions.sort(() => Math.random() - 0.5),
      answer: correctAnswer
    };
  };

  // ── Start the Game ──────────────────────────────────────────────────────
  const startGame = () => {
    setPhase('playing');
    setCurrentRound(1);
    setCorrectAnswers(0);
    setTotalTimeTaken(0);
    setReactionTimes([]);

    generateBoardAndQuestion(1, difficulty);
  };

  // ── Playing Phase Timers ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;

    if (gameState === 'countdown') {
      timerRef.current = setInterval(() => {
        setCountdownNum((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameState('reveal');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (gameState === 'reveal') {
      const interval = 50; // smooth sweep updates
      timerRef.current = setInterval(() => {
        setRevealTimeLeft((prev) => {
          if (prev <= interval / 1000) {
            clearInterval(timerRef.current);
            setGameState('question');
            setQuestionStartTime(Date.now());
            return 0;
          }
          return prev - interval / 1000;
        });
      }, interval);
    }

    return () => clearInterval(timerRef.current);
  }, [phase, gameState]);

  // ── Select multiple-choice option ────────────────────────────────────────
  const handleSelectOption = (option) => {
    if (gameState !== 'question' || selectedOption !== null) return;

    setSelectedOption(option);
    const reactionTime = Date.now() - questionStartTime;
    setReactionTimes((rt) => [...rt, reactionTime]);
    setTotalTimeTaken((t) => t + Math.round(reactionTime / 1000));

    const isCorrect = option === currentQuestion.answer;
    if (isCorrect) {
      setCorrectAnswers((c) => c + 1);
    }

    setGameState('feedback');
  };

  // ── Next Round or Finish ────────────────────────────────────────────────
  const handleNextRound = () => {
    if (currentRound < TOTAL_ROUNDS) {
      const nextRnd = currentRound + 1;
      setCurrentRound(nextRnd);
      generateBoardAndQuestion(nextRnd, difficulty);
    } else {
      setPhase('results');
    }
  };

  // ── Derived metrics ────────────────────────────────────────────────────
  const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);

  const avgReactionTime = reactionTimes.length > 0
    ? (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 1000).toFixed(2)
    : '0.00';

  // Observation Score: Based on correct answers
  const observationScore = accuracy;

  // Visual Attention Score: Speed + Accuracy + Display Duration penalty
  const visualAttentionScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        accuracy * 0.7 +
        (10 - Number(avgReactionTime)) * 3
      )
    )
  );

  // Memory Score: Based on accuracy, scaling with shorter display duration (Hard is worth more)
  const durationMultiplier = difficulty === 'hard' ? 1.2 : difficulty === 'medium' ? 1.0 : 0.8;
  const memoryScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(accuracy * durationMultiplier)
    )
  );

  const xpEarned = Math.round((correctAnswers * 15) + visualAttentionScore / 2);

  const performanceRating = visualAttentionScore >= 85 ? 5
    : visualAttentionScore >= 70 ? 4
    : visualAttentionScore >= 50 ? 3
    : visualAttentionScore >= 30 ? 2
    : 1;

  const performanceLabel = visualAttentionScore >= 85 ? 'Radar Mastermind!'
    : visualAttentionScore >= 70 ? 'Excellent Observation!'
    : visualAttentionScore >= 50 ? 'Good Focus and Memory!'
    : visualAttentionScore >= 30 ? 'Improving Attention Skills'
    : 'Keep Practicing Attention';

  // ── Persist result on results phase ────────────────────────────────────
  useEffect(() => {
    if (phase === 'results') {
      savePuzzleResult({
        puzzleId: 12,
        score: visualAttentionScore,
        accuracy: accuracy,
        timeTaken: Math.round(Number(avgReactionTime) * TOTAL_ROUNDS),
        difficulty: difficulty
      });
    }
  }, [phase, visualAttentionScore, accuracy, avgReactionTime, difficulty]);

  return (
    <main className="saathi-screen">
      <div className="phone-frame px-4 py-6 flex flex-col justify-between overflow-y-auto">

        {/* Phase: Setup */}
        {phase === 'setup' && (
          <div className="flex flex-col animate-[brain-fade-in-up_0.4s_ease-out]">
            <button
              onClick={() => navigate('/')}
              className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm font-extrabold text-saathi-ink transition hover:text-saathi-green"
            >
              <ArrowLeft size={17} /> Back to Puzzles
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 shadow-sm">
                <Eye size={28} className="text-saathi-indigo" />
              </div>
              <h1 className="text-2xl font-extrabold text-saathi-ink">👀 Visual Attention Radar</h1>
              <p className="mt-1.5 text-sm font-semibold text-saathi-muted leading-relaxed">
                Scan the active radar screen, remember the objects, and answer fast-paced recall questions.
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
                  { emoji: '📡', text: 'Board flashes items for a very short duration.' },
                  { emoji: '⏱️', text: 'Easy: 3s | Medium: 2s | Hard: 1s display time.' },
                  { emoji: '🔒', text: 'Grid hides, then asks observation questions.' },
                  { emoji: '🎯', text: 'Choose the correct multiple choice answers.' }
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
        {phase === 'playing' && (
          <div className="flex flex-col gap-4 animate-[brain-fade-in_0.3s_ease-out]">
            
            {/* Top HUD */}
            <header className="sticky top-0 z-10 -mx-4 -mt-6 flex items-center justify-between border-b border-saathi-line bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-saathi-indigo text-xs font-extrabold">
                  Round {currentRound}/{TOTAL_ROUNDS}
                </span>
                <span className="text-xs font-semibold text-saathi-muted capitalize">• {difficulty}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-saathi-muted block">Score</span>
                <span className="text-xs font-extrabold text-saathi-indigo">{correctAnswers} / {TOTAL_ROUNDS}</span>
              </div>
            </header>

            {/* Radar Screen Area */}
            <div className="relative w-full aspect-square bg-[#0f172a] rounded-[24px] overflow-hidden border border-slate-800 shadow-card flex items-center justify-center">
              
              {/* Radar Grid Circles */}
              <div className="absolute inset-0 border-4 border-emerald-500/5 rounded-full pointer-events-none transform scale-90" />
              <div className="absolute inset-0 border border-emerald-500/10 rounded-full pointer-events-none transform scale-60 flex items-center justify-center">
                <div className="w-full h-px bg-emerald-500/10" />
                <div className="h-full w-px bg-emerald-500/10 absolute" />
              </div>
              <div className="absolute inset-0 border border-emerald-500/10 rounded-full pointer-events-none transform scale-30" />

              {/* Sub-phase: Countdown overlay */}
              {gameState === 'countdown' && (
                <div className="text-center z-10 animate-pulse text-white">
                  <h3 className="text-xs font-black tracking-widest text-emerald-400 uppercase">System Calibrating</h3>
                  <h1 className="text-6xl font-black mt-2 text-white">{countdownNum}</h1>
                </div>
              )}

              {/* Sub-phase: Reveal scan grid */}
              {gameState === 'reveal' && (
                <>
                  {/* Glowing vertical green sweep line */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_15px_#10b981] z-20 pointer-events-none"
                    style={{
                      left: `${((revealTimeLeft / totalRevealTime)) * 100}%`,
                      transition: 'left 50ms linear'
                    }}
                  />

                  {/* Grid items */}
                  <div
                    className="grid gap-3 w-full p-6"
                    style={{
                      gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
                    }}
                  >
                    {boardItems.map((item) => (
                      <div
                        key={item.id}
                        className="aspect-square rounded-2xl bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center text-4xl select-none font-black transition-all duration-300 animate-[brain-scale-in_0.4s_ease-out]"
                        style={{ color: item.colorHex }}
                      >
                        {item.shape}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Sub-phase: Hidden / Question grid */}
              {(gameState === 'question' || gameState === 'feedback') && (
                <div
                  className="grid gap-3 w-full p-6 opacity-30"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
                  }}
                >
                  {boardItems.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-bold text-slate-600 select-none animate-[brain-card-flip_0.3s_ease-out]"
                    >
                      ?
                    </div>
                  ))}
                </div>
              )}

              {/* Prompt asking to inspect the board */}
              {gameState === 'reveal' && (
                <div className="absolute bottom-2 text-[10px] font-bold text-emerald-400/70 tracking-wide">
                  SCANNING FOR {revealTimeLeft.toFixed(1)}s
                </div>
              )}
            </div>

            {/* Question Card Box */}
            {(gameState === 'question' || gameState === 'feedback') && currentQuestion && (
              <div className="flex flex-col gap-4 animate-[brain-fade-in-up_0.3s_ease-out] mt-2">
                <div className="bg-white border border-saathi-line rounded-2xl p-5 shadow-sm text-center">
                  <div className="mx-auto mb-2 text-saathi-indigo">
                    <HelpCircle size={22} />
                  </div>
                  <h3 className="text-base font-extrabold text-saathi-ink">{currentQuestion.questionText}</h3>
                </div>

                {/* Multiple choice options */}
                <div className="grid grid-cols-2 gap-3 mx-auto w-full max-w-sm">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = opt === currentQuestion.answer;

                    let btnStyle = 'bg-white border-saathi-line text-saathi-ink hover:border-saathi-indigo';
                    if (selectedOption !== null) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-50 border-saathi-green text-saathi-green ring-2 ring-emerald-100';
                      } else if (isSelected) {
                        btnStyle = 'bg-red-50 border-saathi-red text-saathi-red ring-2 ring-red-100';
                      } else {
                        btnStyle = 'bg-gray-50 border-saathi-line text-gray-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(opt)}
                        disabled={gameState !== 'question'}
                        className={`min-h-16 rounded-2xl border-2 flex items-center justify-center font-bold text-sm px-3 select-none transition-all duration-200 ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feedback Footer */}
            {gameState === 'feedback' && (
              <footer className="mt-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-center font-bold text-sm">
                    {selectedOption === currentQuestion.answer ? (
                      <span className="text-saathi-green">✓ Correct Answer!</span>
                    ) : (
                      <span className="text-saathi-red">✗ Incorrect. Correct: {currentQuestion.answer}</span>
                    )}
                  </div>
                  <button
                    onClick={handleNextRound}
                    className="min-h-12 w-full rounded-2xl bg-saathi-indigo text-white font-bold hover:bg-saathi-indigoDark text-sm shadow transition"
                  >
                    {currentRound === TOTAL_ROUNDS ? 'Finish & See Results' : 'Next Round'}
                  </button>
                </div>
              </footer>
            )}

          </div>
        )}

        {/* Phase: Results */}
        {phase === 'results' && (
          <div className="flex-1 flex flex-col justify-between" style={{ animation: 'brain-scale-in 0.4s ease-out' }}>
            <div className="text-center">
              <header className="mb-6">
                <h1 className="text-2xl font-extrabold text-saathi-ink">📡 Radar Analysis Complete</h1>
                <p className="text-xs font-bold text-saathi-muted mt-1 uppercase tracking-wider">Visual Attention Radar</p>
              </header>

              {/* Circular Score ring */}
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
                      strokeDashoffset={339.3 - (339.3 * visualAttentionScore) / 100}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-saathi-indigo">{visualAttentionScore}</span>
                    <span className="text-[10px] font-bold text-saathi-muted uppercase">Attention Rating</span>
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
                    {correctAnswers} / {TOTAL_ROUNDS}
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Correct Responses</p>
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
                    {memoryScore}%
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Radar Memory Score</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">🔭</span>
                  <p className="text-base font-extrabold text-saathi-green mt-1">
                    {observationScore}%
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Observation Score</p>
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
