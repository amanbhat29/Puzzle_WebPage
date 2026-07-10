import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Check, X, Search, RotateCcw, Star, HelpCircle, Award, Target, Clock } from 'lucide-react';
import { generateLogicMystery } from '../../utils/generators/logicDetectiveGenerator';
import { getUniqueQuestion } from '../../utils/nonRepeatingGenerator';

// ═══════════════════════════════════════════════════════════════════════════
// LogicDetectivePage — A detective-style mystery game with an elimination grid.
// Self-contained page with sub-components inline.
// ═══════════════════════════════════════════════════════════════════════════

export default function LogicDetectivePage() {
  const navigate = useNavigate();

  // ── Core State ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('setup'); // 'setup' | 'playing' | 'results'
  const [difficulty, setDifficulty] = useState('easy');

  // ── Game Play State ──────────────────────────────────────────────────────
  const [puzzle, setPuzzle] = useState(null);
  const [timer, setTimer] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [gridState, setGridState] = useState({}); // key: 'char-category-item' -> 'empty' | 'yes' | 'no'
  const [assignments, setAssignments] = useState({}); // key: 'char-category' -> item value
  const [highlightedCell, setHighlightedCell] = useState(null); // 'char-category-item' key for hint pulse
  const [errorMessage, setErrorMessage] = useState('');

  // Refs
  const timerRef = useRef(null);

  // ── Start Investigation ─────────────────────────────────────────────────
  const startInvestigation = () => {
    const p = getUniqueQuestion(`logic-detective-${difficulty}`, () => generateLogicMystery(difficulty), (q) => JSON.stringify(q.clues));
    setPuzzle(p);
    setTimer(0);
    setHintsUsed(0);
    setHintsLeft(3);
    setWrongAttempts(0);
    setGridState({});
    
    // Initialize empty assignments
    const initialAssignments = {};
    p.characters.forEach((char) => {
      p.categories.forEach((cat) => {
        initialAssignments[`${char}-${cat.name}`] = '';
      });
    });
    setAssignments(initialAssignments);
    setErrorMessage('');
    setHighlightedCell(null);
    setPhase('playing');
  };

  // ── Timer Effect ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // ── Grid Cell Interaction ───────────────────────────────────────────────
  const toggleCell = (char, categoryName, item) => {
    const key = `${char}-${categoryName}-${item}`;
    setGridState((prev) => {
      const current = prev[key] || 'empty';
      let next = 'empty';
      if (current === 'empty') next = 'yes';
      else if (current === 'yes') next = 'no';
      // else 'no' goes to 'empty'
      return { ...prev, [key]: next };
    });
  };

  // ── Assignment Option Interaction ───────────────────────────────────────
  const selectAssignment = (char, categoryName, item) => {
    const key = `${char}-${categoryName}`;
    setAssignments((prev) => ({
      ...prev,
      [key]: item,
    }));
  };

  // ── Hint System ─────────────────────────────────────────────────────────
  const triggerHint = () => {
    if (hintsLeft <= 0 || !puzzle) return;

    // Find a correct connection from the solution that the user hasn't marked 'yes' yet
    const correctConnections = [];
    puzzle.characters.forEach((char) => {
      puzzle.categories.forEach((cat) => {
        const correctItem = puzzle.solution[char][cat.name];
        const key = `${char}-${cat.name}-${correctItem}`;
        if (gridState[key] !== 'yes') {
          correctConnections.push({ char, catName: cat.name, item: correctItem, key });
        }
      });
    });

    if (correctConnections.length > 0) {
      // Pick one randomly
      const selectedHint = correctConnections[Math.floor(Math.random() * correctConnections.length)];
      
      // Auto mark 'yes' in the grid for this cell
      setGridState((prev) => {
        const updated = { ...prev };
        
        // Also auto-eliminate (set 'no') for other items in the same row/col in this category
        puzzle.categories.forEach((cat) => {
          if (cat.name === selectedHint.catName) {
            cat.items.forEach((item) => {
              const cellKey = `${selectedHint.char}-${cat.name}-${item}`;
              if (item === selectedHint.item) {
                updated[cellKey] = 'yes';
              } else {
                updated[cellKey] = 'no';
              }
            });
          }
        });

        puzzle.characters.forEach((c) => {
          const cellKey = `${c}-${selectedHint.catName}-${selectedHint.item}`;
          if (c !== selectedHint.char) {
            updated[cellKey] = 'no';
          }
        });

        return updated;
      });

      // Auto assign in dropdown
      setAssignments((prev) => ({
        ...prev,
        [`${selectedHint.char}-${selectedHint.catName}`]: selectedHint.item,
      }));

      // Highlight cell temporarily with a glow
      setHighlightedCell(selectedHint.key);
      setTimeout(() => setHighlightedCell(null), 1500);

      setHintsUsed((prev) => prev + 1);
      setHintsLeft((prev) => prev - 1);
    }
  };

  // ── Submit Solution ─────────────────────────────────────────────────────
  const submitSolution = () => {
    if (!puzzle) return;

    let allCorrect = true;
    puzzle.characters.forEach((char) => {
      puzzle.categories.forEach((cat) => {
        const correctValue = puzzle.solution[char][cat.name];
        const studentValue = assignments[`${char}-${cat.name}`];
        if (studentValue !== correctValue) {
          allCorrect = false;
        }
      });
    });

    if (allCorrect) {
      setPhase('results');
    } else {
      setWrongAttempts((prev) => prev + 1);
      setErrorMessage('Oops! That profile doesn\'t match all the clues. Check your grid and try again!');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // ── Check if all assignments are filled ────────────────────────────────
  const isSubmissionReady = useMemo(() => {
    if (!puzzle) return false;
    return puzzle.characters.every((char) =>
      puzzle.categories.every((cat) => assignments[`${char}-${cat.name}`] !== '')
    );
  }, [puzzle, assignments]);

  // ── Score calculation ──────────────────────────────────────────────────
  const score = useMemo(() => {
    if (!puzzle) return 0;
    let base = 100;
    base -= hintsUsed * 15;
    base -= wrongAttempts * 10;
    if (timer < 120) base += 20; // Time bonus under 2 mins
    return Math.max(10, base);
  }, [puzzle, hintsUsed, wrongAttempts, timer]);

  let stars = 1;
  if (score >= 110) stars = 5;
  else if (score >= 90) stars = 4;
  else if (score >= 70) stars = 3;
  else if (score >= 40) stars = 2;

  // Formatter for MM:SS
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
                    🕵️ Logic Detective
                  </h1>
                </div>
              </header>

              <p className="text-sm font-semibold text-saathi-muted mb-6 leading-relaxed">
                Analyze the clues to solve the mystery. Use the interactive grid to keep track of positive and negative associations: mark ✓ for confirmed matches, and ✗ for eliminations.
              </p>

              {/* Difficulty Selector */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-saathi-ink uppercase tracking-wider mb-2">
                  Select Case Difficulty
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
                <h3 className="text-sm font-bold text-saathi-ink mb-3">Investigation Guide:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-xs font-medium text-saathi-muted">
                    <span className="w-5 h-5 rounded-full bg-saathi-indigo text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <span>Read the clues listed on screen very carefully.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs font-medium text-saathi-muted">
                    <span className="w-5 h-5 rounded-full bg-saathi-indigo text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <span>Tapping cells in the grid cycles: empty ➔ ✓ (Yes) ➔ ✗ (No) ➔ empty.</span>
                  </li>
                  <li className="flex items-start gap-3 text-xs font-medium text-saathi-muted">
                    <span className="w-5 h-5 rounded-full bg-saathi-indigo text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                    <span>Once you've figured it out, select the answers for each character and press Submit.</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={startInvestigation}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-saathi-indigo px-5 text-base font-bold text-white shadow-saathi transition hover:bg-saathi-indigoDark active:scale-[0.98] w-full"
            >
              Start Investigation
            </button>
          </div>
        )}

        {/* PLAYING PHASE */}
        {phase === 'playing' && puzzle && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* HUD Bar */}
              <header className="flex items-center justify-between border-b border-saathi-line pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-saathi-indigo text-xs font-extrabold uppercase">
                    Case #1
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-saathi-muted">
                    <Clock size={12} /> {formatTime(timer)}
                  </span>
                </div>
                
                {/* Hint Button */}
                <button
                  onClick={triggerHint}
                  disabled={hintsLeft <= 0}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                    hintsLeft > 0
                      ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
                      : 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed'
                  }`}
                >
                  <Lightbulb size={13} />
                  <span>{hintsLeft > 0 ? `${hintsLeft} hints` : 'No hints'}</span>
                </button>
              </header>

              {/* Clues Card */}
              <section className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-4 border border-indigo-100 mb-6 shadow-sm">
                <h3 className="text-xs font-bold text-saathi-indigo uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Search size={14} /> The Clues
                </h3>
                <ol className="space-y-2.5">
                  {puzzle.clues.map((clue, idx) => (
                    <li key={idx} className="flex gap-2 bg-white rounded-xl p-3 border border-saathi-line text-xs font-semibold text-saathi-ink shadow-sm leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-saathi-indigo text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{clue}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Interactive Logic Grid */}
              <section className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-saathi-ink uppercase tracking-wider">
                    Elimination Grid
                  </h3>
                  <span className="text-[10px] font-semibold text-saathi-muted">
                    Tap to cycle: Blank ➔ ✓ ➔ ✗
                  </span>
                </div>
                
                {/* Horizontal Scrollable Table */}
                <div className="overflow-x-auto border border-saathi-line rounded-2xl shadow-sm bg-white">
                  <table className="w-full min-w-[320px] border-collapse">
                    <thead>
                      {/* Top Header Row: Category Names */}
                      <tr className="bg-gray-50 border-b border-saathi-line">
                        <th className="sticky left-0 bg-gray-50 z-10 border-r border-saathi-line p-2 text-left min-w-[80px] text-[10px] font-black uppercase text-saathi-muted">
                          Detective
                        </th>
                        {puzzle.categories.map((cat) => (
                          <th
                            key={cat.name}
                            colSpan={cat.items.length}
                            className="border-r border-saathi-line last:border-r-0 p-1 text-center text-[9px] font-black uppercase tracking-wider text-saathi-indigo bg-indigo-50/50"
                          >
                            {cat.name}
                          </th>
                        ))}
                      </tr>
                      {/* Item Names Header Row */}
                      <tr className="border-b border-saathi-line">
                        <th className="sticky left-0 bg-white z-10 border-r border-saathi-line p-2"></th>
                        {puzzle.categories.map((cat) =>
                          cat.items.map((item) => (
                            <th
                              key={item}
                              className="border-r border-saathi-line last:border-r-0 p-2 text-center text-[10px] font-bold text-saathi-ink min-w-[55px] max-w-[70px] truncate"
                              title={item}
                            >
                              {item}
                            </th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {puzzle.characters.map((char) => (
                        <tr key={char} className="border-b border-saathi-line last:border-b-0 hover:bg-gray-50/50">
                          {/* Character Row Headers (Sticky on scroll) */}
                          <td className="sticky left-0 bg-white z-10 border-r border-saathi-line p-2 font-bold text-xs text-saathi-ink shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                            {char}
                          </td>
                          {/* Grid cells */}
                          {puzzle.categories.map((cat) =>
                            cat.items.map((item) => {
                              const cellKey = `${char}-${cat.name}-${item}`;
                              const val = gridState[cellKey] || 'empty';
                              const isHighlighted = highlightedCell === cellKey;

                              return (
                                <td
                                  key={item}
                                  onClick={() => toggleCell(char, cat.name, item)}
                                  className={`border-r border-saathi-line last:border-r-0 h-11 text-center cursor-pointer select-none relative transition-all duration-300 ${
                                    val === 'yes'
                                      ? 'bg-emerald-50/70 text-saathi-green'
                                      : val === 'no'
                                      ? 'bg-red-50/70 text-saathi-red font-bold'
                                      : 'bg-white'
                                  } ${isHighlighted ? 'animate-pulse ring-2 ring-amber-400 z-10' : ''}`}
                                >
                                  {val === 'yes' && <Check size={14} className="mx-auto" />}
                                  {val === 'no' && <X size={14} className="mx-auto" />}
                                  {val === 'empty' && (
                                    <span className="opacity-0 hover:opacity-10 text-[9px] text-gray-300">✓</span>
                                  )}
                                </td>
                              );
                            })
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Answers / Assignments Dropdowns */}
              <section className="bg-white rounded-2xl p-4 border border-saathi-line shadow-card mb-4">
                <h3 className="text-xs font-bold text-saathi-ink uppercase tracking-wider mb-3">
                  Final Findings Form
                </h3>
                <div className="space-y-4">
                  {puzzle.characters.map((char) => (
                    <div key={char} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-saathi-line">
                      <span className="text-xs font-bold text-saathi-ink">{char}</span>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {puzzle.categories.map((cat) => (
                          <div key={cat.name} className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-saathi-muted">{cat.name}:</span>
                            <select
                              value={assignments[`${char}-${cat.name}`] || ''}
                              onChange={(e) => selectAssignment(char, cat.name, e.target.value)}
                              className="bg-white border border-saathi-line rounded-lg text-xs font-semibold p-1.5 focus:outline-none focus:border-saathi-indigo"
                            >
                              <option value="">Select...</option>
                              {cat.items.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-saathi-red text-xs font-bold rounded-xl mb-4 text-center animate-bounce">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Submission Button */}
            <button
              onClick={submitSolution}
              disabled={!isSubmissionReady}
              className={`min-h-12 w-full rounded-2xl font-bold transition text-sm shadow mt-2 ${
                isSubmissionReady
                  ? 'bg-saathi-indigo text-white hover:bg-saathi-indigoDark'
                  : 'bg-gray-100 text-saathi-muted border border-saathi-line cursor-not-allowed'
              }`}
            >
              Submit Findings
            </button>
          </div>
        )}

        {/* RESULTS PHASE */}
        {phase === 'results' && (
          <div className="flex-1 flex flex-col justify-between" style={{ animation: 'brain-scale-in 0.4s ease-out' }}>
            <div className="text-center">
              <header className="mb-6">
                <h2 className="text-2xl font-extrabold text-saathi-ink">🕵️ Mystery Solved!</h2>
                <p className="text-xs font-bold text-saathi-muted mt-1 uppercase tracking-wider">Logic Detective Arena</p>
              </header>

              {/* Score Display */}
              <div className="flex justify-center mb-6">
                <div className="w-28 h-28 border-4 border-saathi-indigo rounded-full flex flex-col items-center justify-center bg-indigo-50/30">
                  <span className="text-3xl font-black text-saathi-indigo">{score}</span>
                  <span className="text-[10px] font-bold text-saathi-muted uppercase">Score</span>
                </div>
              </div>

              {/* Stars display */}
              <div className="flex justify-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={22}
                    className={s <= stars ? 'text-saathi-amber fill-saathi-amber' : 'text-gray-200'}
                  />
                ))}
              </div>

              <div className="mb-6">
                <p className="text-sm font-extrabold text-saathi-ink">
                  {score >= 110
                    ? '🏆 Master Detective!'
                    : score >= 90
                    ? '🔍 Expert Investigator!'
                    : score >= 70
                    ? '👍 Mystery Solved!'
                    : score >= 40
                    ? '📚 Getting Better!'
                    : '🔁 Keep Analyzing!'}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mb-8">
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">⏱️</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {formatTime(timer)}
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Time Taken</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">💡</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {hintsUsed}
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Hints Used</p>
                </div>
                <div className="bg-white border border-saathi-line rounded-2xl p-3 shadow-sm">
                  <span className="text-sm">❌</span>
                  <p className="text-base font-extrabold text-saathi-ink mt-1">
                    {wrongAttempts}
                  </p>
                  <p className="text-[10px] font-bold text-saathi-muted uppercase">Incorrect Submissions</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid gap-3">
              <button
                onClick={startInvestigation}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-saathi-indigo text-white font-bold hover:bg-saathi-indigoDark transition shadow w-full text-sm"
              >
                <RotateCcw size={16} /> New Case
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
