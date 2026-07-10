import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Brain, RotateCcw, Star, CheckCircle, XCircle, Award, Target, Trophy } from 'lucide-react';
import { generateMemoryBoard } from '../../utils/generators/memoryGenerator';
import { formatTimer } from '../../utils/format';
import { savePuzzleResult } from '../../utils/storage';
import { getUniqueQuestion } from '../../utils/nonRepeatingGenerator';

// ═══════════════════════════════════════════════════════════════════════════
// MemoryFlashPage — A memory pattern recall game with display/hide/recall phases.
// Self-contained page with sub-components inline.
// ═══════════════════════════════════════════════════════════════════════════

const TOTAL_ROUNDS = 5;

export default function MemoryFlashPage() {
  const navigate = useNavigate();

  // ── Core State ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'results'
  const [difficulty, setDifficulty] = useState('easy');

  // ── Game State ──────────────────────────────────────────────────────────
  const [currentRound, setCurrentRound] = useState(1);
  const [board, setBoard] = useState(null);
  const [subPhase, setSubPhase] = useState('display'); // 'display' | 'hidden' | 'feedback'
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalDisplayTime, setTotalDisplayTime] = useState(0);

  // Recall subphase state
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [recalledItems, setRecalledItems] = useState([]); // Array of item values/objects
  const [paletteItems, setPaletteItems] = useState([]); // Shuffled list of correct items
  const [roundStartTime, setRoundStartTime] = useState(0);

  // Statistics & History
  const [roundScores, setRoundScores] = useState([]); // Array of { round, correct, total, timeMs }
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [avgRecallTime, setAvgRecallTime] = useState(0);
  const [bestRound, setBestRound] = useState(0);

  // Refs for timers
  const timerRef = useRef(null);
  const displayTimerRef = useRef(null);

  // ── Start Challenge ─────────────────────────────────────────────────────
  const startChallenge = () => {
    setRoundScores([]);
    setTotalCorrect(0);
    setTotalItemsCount(0);
    setCurrentRound(1);
    loadRound(1, difficulty);
    setPhase('playing');
  };

  // ── Load Round ──────────────────────────────────────────────────────────
  const loadRound = useCallback((roundNum, diff) => {
    const newBoard = getUniqueQuestion(`memory-flash-${diff}`, () => generateMemoryBoard(diff), (b) => JSON.stringify(b.items.map(item => ({ val: item.value, type: item.type }))));
    setBoard(newBoard);
    setSubPhase('display');
    setTimeLeft(newBoard.displayTime);
    setTotalDisplayTime(newBoard.displayTime);

    // Prepare recall slots
    setRecalledItems(Array(newBoard.totalItems).fill(null));
    setSelectedSlot(0);

    // Shuffle the items for the palette
    const itemsCopy = [...newBoard.items];
    // Simple shuffle
    for (let i = itemsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [itemsCopy[i], itemsCopy[j]] = [itemsCopy[j], itemsCopy[i]];
    }
    setPaletteItems(itemsCopy);
  }, []);

  // ── Display Countdown Timer ─────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'playing' && subPhase === 'display') {
      const interval = 50; // smooth 50ms updates
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= interval) {
            clearInterval(timerRef.current);
            // Switch to hidden/recall subphase
            setSubPhase('hidden');
            setRoundStartTime(Date.now());
            return 0;
          }
          return prev - interval;
        });
      }, interval);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, subPhase]);

  // Calculate stars/score percentage
  const scorePercent = totalItemsCount > 0 ? Math.round((totalCorrect / totalItemsCount) * 100) : 0;

  // ── Persist result on results phase ────────────────────────────────────
  useEffect(() => {
    if (phase === 'results') {
      savePuzzleResult({
        puzzleId: 9,
        score: scorePercent,
        accuracy: scorePercent,
        timeTaken: Math.round(avgRecallTime * TOTAL_ROUNDS)
      });
    }
  }, [phase, scorePercent, avgRecallTime]);

  // ── Item Click Handlers ────────────────────────────────────────────────
  const selectSlot = (index) => {
    if (subPhase !== 'hidden') return;
    setSelectedSlot(index);
  };

  const assignFromPalette = (item) => {
    if (subPhase !== 'hidden' || selectedSlot === null) return;

    setRecalledItems((prev) => {
      const updated = [...prev];
      // If the item is already assigned to a different slot, clear that slot to avoid duplicates
      const existingIndex = updated.findIndex((i) => i && i.id === item.id);
      if (existingIndex !== -1) {
        updated[existingIndex] = null;
      }
      updated[selectedSlot] = item;
      return updated;
    });

    // Auto-advance to next empty slot if available
    setSelectedSlot((prev) => {
      const nextIndex = (prev + 1) % board.totalItems;
      return nextIndex;
    });
  };

  const clearSlot = (index, e) => {
    e.stopPropagation();
    if (subPhase !== 'hidden') return;
    setRecalledItems((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
    setSelectedSlot(index);
  };

  // ── Check Answer & Score Round ──────────────────────────────────────────
  const checkAnswer = () => {
    if (subPhase !== 'hidden') return;

    const recallTimeMs = Date.now() - roundStartTime;
    let correctCount = 0;
    
    board.items.forEach((originalItem, idx) => {
      const recalled = recalledItems[idx];
      if (recalled && recalled.id === originalItem.id) {
        correctCount++;
      }
    });

    const scoreEntry = {
      round: currentRound,
      correct: correctCount,
      total: board.totalItems,
      timeMs: recallTimeMs,
    };

    setRoundScores((prev) => [...prev, scoreEntry]);
    setTotalCorrect((prev) => prev + correctCount);
    setTotalItemsCount((prev) => prev + board.totalItems);
    setSubPhase('feedback');
  };

  // ── Next Round or Complete ──────────────────────────────────────────────
  const handleNext = () => {
    if (currentRound < TOTAL_ROUNDS) {
      const nextRnd = currentRound + 1;
      setCurrentRound(nextRnd);
      loadRound(nextRnd, difficulty);
    } else {
      // Calculate final results
      const scores = [...roundScores];
      const totalScorePercent = Math.round((totalCorrect / totalItemsCount) * 100);
      const avgTime = scores.reduce((sum, item) => sum + item.timeMs, 0) / TOTAL_ROUNDS;
      
      let best = 0;
      scores.forEach((s) => {
        const pct = (s.correct / s.total) * 100;
        if (pct > best) best = pct;
      });

      setAvgRecallTime(avgTime / 1000); // convert to seconds
      setBestRound(Math.round(best));
      setPhase('results');
    }
  };

  // ── Render Item helper ──────────────────────────────────────────────────
  const renderItemContent = (item, isFeedback = false, isCorrect = false) => {
    if (!item) return null;

    switch (item.type) {
      case 'color':
        return (
          <div 
            className="w-12 h-12 rounded-full shadow-inner transition-transform duration-300 transform hover:scale-110" 
            style={{ backgroundColor: item.value }} 
          />
        );
      case 'shape':
        return (
          <span className="text-4xl font-extrabold" style={{ color: item.displayColor }}>
            {item.value}
          </span>
        );
      case 'number':
        return (
          <span className="text-3xl font-black tracking-wider" style={{ color: item.displayColor }}>
            {item.value}
          </span>
        );
      case 'symbol':
        return (
          <span className="text-4xl" style={{ color: item.displayColor }}>
            {item.value}
          </span>
        );
      default:
        return null;
    }
  };

  // Calculate stars for result page
  let starsCount = 1;
  if (scorePercent >= 90) starsCount = 5;
  else if (scorePercent >= 75) starsCount = 4;
  else if (scorePercent >= 60) starsCount = 3;
  else if (scorePercent >= 40) starsCount = 2;

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
                    🧠 Memory Flash Challenge
                  </h1>
                </div>
              </header>

              <p className="text-sm font-semibold text-saathi-muted mb-6 leading-relaxed">
                Test your visual memory! Memorize a grid of shapes, symbols, and colors before they disappear, then recreate the pattern from a shuffle palette.
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

              {/* Rules Card */}
              <div className="bg-white rounded-2xl p-5 border border-saathi-line shadow-card mb-6">
                <h3 className="text-sm font-bold text-saathi-ink mb-3">How to Play:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-xs font-medium text-saathi-muted">
                    <span className="w-5 h-5 rounded-full bg-saathi-indigo text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <span>Observe the grid and memorize the position of each visual item.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs font-medium text-saathi-muted">
                    <span className="w-5 h-5 rounded-full bg-saathi-indigo text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <span>Wait for the display timer to run out. The items will hide under <b>?</b> cards.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs font-medium text-saathi-muted">
                    <span className="w-5 h-5 rounded-full bg-saathi-indigo text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                    <span>Tap a slot in the grid, then tap its matching item from the selection palette below.</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={startChallenge}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-saathi-indigo px-5 text-base font-bold text-white shadow-saathi transition hover:bg-saathi-indigoDark active:scale-[0.98] w-full"
            >
              Start Challenge
            </button>
          </div>
        )}

        {/* PLAYING PHASE */}
        {phase === 'playing' && board && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Top HUD */}
            <header className="flex items-center justify-between border-b border-saathi-line pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-saathi-indigo text-xs font-extrabold">
                  Round {currentRound}/{TOTAL_ROUNDS}
                </span>
                <span className="text-xs font-semibold text-saathi-muted capitalize">
                  • {difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2 text-saathi-ink font-bold text-sm">
                {subPhase === 'display' ? (
                  <span className="flex items-center gap-1.5 text-saathi-indigo">
                    <Eye size={16} className="animate-pulse" /> Memorise!
                  </span>
                ) : subPhase === 'hidden' ? (
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <EyeOff size={16} /> Recall!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-saathi-green">
                    <Award size={16} /> Checking...
                  </span>
                )}
              </div>
            </header>

            {/* Display Countdown Bar */}
            {subPhase === 'display' && (
              <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden mb-6">
                <div 
                  className="h-full bg-saathi-indigo transition-all duration-75"
                  style={{ width: `${(timeLeft / totalDisplayTime) * 100}%` }}
                />
              </div>
            )}

            {/* Grid Area */}
            <div className="flex-1 flex items-center justify-center py-6">
              <div 
                className="grid gap-4 w-full max-w-sm"
                style={{ 
                  gridTemplateColumns: `repeat(${board.gridCols}, minmax(0, 1fr))`,
                  animation: subPhase === 'display' ? 'brain-fade-in 0.3s ease-out' : 'none'
                }}
              >
                {board.items.map((item, idx) => {
                  const isSlotSelected = selectedSlot === idx && subPhase === 'hidden';
                  const recalledItem = recalledItems[idx];
                  const isCorrect = recalledItem && recalledItem.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => selectSlot(idx)}
                      className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-3 relative cursor-pointer select-none transition-all duration-200 ${
                        subPhase === 'display'
                          ? 'bg-white border-saathi-line shadow-sm'
                          : subPhase === 'hidden'
                          ? isSlotSelected
                            ? 'bg-indigo-50 border-saathi-indigo shadow-md ring-2 ring-saathi-indigo ring-opacity-20 scale-[1.03] animate-pulse'
                            : recalledItem
                            ? 'bg-white border-indigo-200 shadow-sm'
                            : 'bg-gray-50 border-dashed border-gray-300 hover:border-saathi-indigo'
                          : isCorrect // feedback
                          ? 'bg-emerald-50 border-saathi-green shadow-sm'
                          : 'bg-red-50 border-saathi-red shadow-sm'
                      }`}
                    >
                      {/* Slot Content */}
                      {subPhase === 'display' ? (
                        renderItemContent(item)
                      ) : subPhase === 'hidden' ? (
                        recalledItem ? (
                          <>
                            {renderItemContent(recalledItem)}
                            <button
                              onClick={(e) => clearSlot(idx, e)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-400 text-white flex items-center justify-center text-[10px] font-bold shadow hover:bg-gray-500"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-gray-300">?</span>
                        )
                      ) : (
                        // Feedback Mode: Show student recall selection, with target correct visual helper nearby
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="opacity-80">
                            {recalledItem ? renderItemContent(recalledItem) : <span className="text-xl font-bold text-gray-400">∅</span>}
                          </div>
                          
                          {/* Mini validation indicator */}
                          <div className="absolute bottom-2 right-2">
                            {isCorrect ? (
                              <CheckCircle size={16} className="text-saathi-green" />
                            ) : (
                              <XCircle size={16} className="text-saathi-red" />
                            )}
                          </div>
                          
                          {/* Show correct value overlay if user got it wrong */}
                          {!isCorrect && (
                            <div className="absolute top-1 left-1 bg-white border border-saathi-green rounded-md px-1 py-0.5 text-[8px] font-bold text-saathi-green transform -rotate-12">
                              Correct: {item.type === 'color' ? '🎨' : item.value}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selection Palette (Recall Phase) */}
            {subPhase === 'hidden' && (
              <div className="mt-4 p-4 bg-white rounded-2xl border border-saathi-line shadow-card animate-brain-slide-in-right">
                <p className="text-[11px] font-bold text-saathi-muted uppercase tracking-wider mb-2 text-center">
                  Select item for Slot {selectedSlot + 1}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {paletteItems.map((item) => {
                    const isAlreadyAssigned = recalledItems.some((ri) => ri && ri.id === item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => assignFromPalette(item)}
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                          isAlreadyAssigned
                            ? 'bg-gray-100 border-saathi-line opacity-40 cursor-not-allowed'
                            : 'bg-white border-saathi-line hover:border-saathi-indigo hover:scale-105 active:scale-95 shadow-sm'
                        }`}
                        disabled={isAlreadyAssigned}
                      >
                        {renderItemContent(item)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6">
              {subPhase === 'hidden' && (
                <button
                  onClick={checkAnswer}
                  disabled={recalledItems.some((ri) => ri === null)}
                  className={`min-h-12 w-full rounded-2xl font-bold transition duration-200 text-sm shadow ${
                    recalledItems.some((ri) => ri === null)
                      ? 'bg-gray-100 text-saathi-muted border border-saathi-line cursor-not-allowed'
                      : 'bg-saathi-indigo text-white hover:bg-saathi-indigoDark'
                  }`}
                >
                  Check Answer
                </button>
              )}

              {subPhase === 'feedback' && (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-center font-bold text-saathi-ink text-sm">
                    Round Score: <span className="text-saathi-indigo">{roundScores[roundScores.length - 1]?.correct}</span> / {board.totalItems} Correct
                  </div>
                  <button
                    onClick={handleNext}
                    className="min-h-12 w-full rounded-2xl bg-saathi-indigo text-white font-bold hover:bg-saathi-indigoDark text-sm shadow transition"
                  >
                    {currentRound === TOTAL_ROUNDS ? 'Finish & See Results' : 'Next Round'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESULTS PHASE */}
        {phase === 'results' && (
          <div className="flex-1 flex flex-col justify-between" style={{ animation: 'brain-scale-in 0.4s ease-out' }}>
            <div className="text-center">
              <header className="mb-6">
                <h2 className="text-2xl font-extrabold text-saathi-ink">🧠 Challenge Complete!</h2>
                <p className="text-xs font-bold text-saathi-muted mt-1 uppercase tracking-wider">Memory Flash Arena</p>
              </header>

              {/* Big Score Ring */}
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="#e7ece8"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="#6366f1"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={339.3}
                      strokeDashoffset={339.3 - (339.3 * scorePercent) / 100}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-saathi-indigo">{scorePercent}%</span>
                    <span className="text-[10px] font-bold text-saathi-muted uppercase">Accuracy</span>
                  </div>
                </div>
              </div>

              {/* Stars display */}
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={22}
                    className={s <= starsCount ? 'text-saathi-amber fill-saathi-amber' : 'text-gray-200'}
                  />
                ))}
              </div>

              {/* Performance Label */}
              <div className="mb-6">
                <p className="text-sm font-extrabold text-saathi-ink">
                  {scorePercent >= 90
                    ? '🏆 Photomemory Master!'
                    : scorePercent >= 75
                    ? '🌟 Excellent Recall!'
                    : scorePercent >= 60
                    ? '👍 Nice Memory Skills!'
                    : scorePercent >= 40
                    ? '📚 Getting Better!'
                    : '🔁 Keep Practicing!'}
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">🎯</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {totalCorrect} / {totalItemsCount}
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Correct Items</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">⚡</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {avgRecallTime.toFixed(1)}s
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Avg Recall Time</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">🔥</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {bestRound}%
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Best Round Score</p>
                </div>
              </div>

              {/* Round breakdown */}
              <div className="bg-white rounded-2xl border border-saathi-line p-4 shadow-sm mb-6 text-left">
                <p className="text-xs font-bold text-saathi-ink uppercase tracking-wider mb-2">Round Breakdown</p>
                <div className="flex justify-between items-center gap-2">
                  {roundScores.map((r) => {
                    const rPct = Math.round((r.correct / r.total) * 100);
                    return (
                      <div key={r.round} className="flex-1 flex flex-col items-center bg-gray-50 rounded-lg p-2 border border-saathi-line">
                        <span className="text-[10px] font-bold text-saathi-muted">R{r.round}</span>
                        <span className="text-xs font-bold text-saathi-ink mt-0.5">{r.correct}/{r.total}</span>
                        <span className="text-[9px] font-medium text-saathi-muted mt-0.5">{(r.timeMs / 1000).toFixed(1)}s</span>
                      </div>
                    );
                  })}
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
