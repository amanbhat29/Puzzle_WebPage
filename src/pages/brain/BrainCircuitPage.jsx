import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Brain, Search, Eye, Trophy, Star, Medal, ChevronRight, RotateCcw, CheckCircle, XCircle, Target, Clock } from 'lucide-react';
import { generateBrainCircuitRound, calculateBrainReport } from '../../utils/generators/brainCircuitGenerator';
import { formatTimer } from '../../utils/format';
import BrainReportCard from '../../components/BrainReportCard';

// ═══════════════════════════════════════════════════════════════════════════
// BrainCircuitPage — Flagship 4-round cognitive assessment circuit.
// Self-contained page with all rounds implemented inline.
// ═══════════════════════════════════════════════════════════════════════════

export default function BrainCircuitPage() {
  const navigate = useNavigate();

  // ── Core State ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('intro'); // 'intro' | 'round1' | 'round2' | 'round3' | 'round4' | 'report'
  const [roundConfigs, setRoundConfigs] = useState({}); // Stores generated configs for all 4 rounds
  const [roundResults, setRoundResults] = useState([]); // Stores results for report calculation
  const [report, setReport] = useState(null);

  // ── Global timer across playing ──────────────────────────────────────────
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const [timerLeft, setTimerLeft] = useState(0); // active countdown for round
  const [totalRoundTime, setTotalRoundTime] = useState(0);

  // ── Round 1 (Math) State ────────────────────────────────────────────────
  const [r1Index, setR1Index] = useState(0);
  const [r1Input, setR1Input] = useState('');
  const [r1CorrectCount, setR1CorrectCount] = useState(0);
  const [r1ResponseTimes, setR1ResponseTimes] = useState([]);
  const [r1StartTime, setR1StartTime] = useState(0);
  const [r1Feedback, setR1Feedback] = useState(null); // 'correct' | 'wrong'
  const [r1ShowCorrect, setR1ShowCorrect] = useState('');

  // ── Round 2 (Memory) State ──────────────────────────────────────────────
  const [r2SubPhase, setR2SubPhase] = useState('display'); // 'display' | 'recall' | 'feedback'
  const [r2SelectedSlot, setR2SelectedSlot] = useState(0);
  const [r2RecalledItems, setR2RecalledItems] = useState([]);
  const [r2PaletteItems, setR2PaletteItems] = useState([]);
  const [r2StartTime, setR2StartTime] = useState(0);
  const [r2CorrectCount, setR2CorrectCount] = useState(0);
  const [r2RoundTime, setR2RoundTime] = useState(0);

  // ── Round 3 (Logic) State ───────────────────────────────────────────────
  const [r3Assignments, setR3Assignments] = useState({}); // key: 'char-category' -> item value
  const [r3StartTime, setR3StartTime] = useState(0);
  const [r3Feedback, setR3Feedback] = useState(null); // 'checking' | 'shown'
  const [r3CorrectCount, setR3CorrectCount] = useState(0);
  const [r3TimeTaken, setR3TimeTaken] = useState(0);

  // ── Round 4 (Pattern) State ─────────────────────────────────────────────
  const [r4Index, setR4Index] = useState(0);
  const [r4SelectedOption, setR4SelectedOption] = useState(null);
  const [r4CorrectCount, setR4CorrectCount] = useState(0);
  const [r4ResponseTimes, setR4ResponseTimes] = useState([]);
  const [r4StartTime, setR4StartTime] = useState(0);

  // General Refs
  const countdownIntervalRef = useRef(null);

  // ── Initialize Circuit ──────────────────────────────────────────────────
  const startCircuit = () => {
    // Generate configs for all 4 rounds upfront
    const r1 = generateBrainCircuitRound(1);
    const r2 = generateBrainCircuitRound(2);
    const r3 = generateBrainCircuitRound(3);
    const r4 = generateBrainCircuitRound(4);

    setRoundConfigs({ 1: r1, 2: r2, 3: r3, 4: r4 });
    setRoundResults([]);
    setReport(null);
    setCurrentRoundNumber(1);

    // Setup Round 1 Math
    setR1Index(0);
    setR1Input('');
    setR1CorrectCount(0);
    setR1ResponseTimes([]);
    setR1Feedback(null);
    setR1ShowCorrect('');

    setPhase('round1');
    loadRoundTimer(r1);
    setR1StartTime(Date.now());
  };

  // ── Load countdown timer for current round ─────────────────────────────
  const loadRoundTimer = (config) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    setTimerLeft(config.timeLimit);
    setTotalRoundTime(config.timeLimit);

    countdownIntervalRef.current = setInterval(() => {
      setTimerLeft((prev) => {
        if (prev <= 100) {
          clearInterval(countdownIntervalRef.current);
          handleRoundTimeout(config.roundNumber);
          return 0;
        }
        return prev - 100;
      });
    }, 100);
  };

  // ── Handle Timeout ──────────────────────────────────────────────────────
  const handleRoundTimeout = (roundNum) => {
    if (roundNum === 1) {
      // End Round 1 Math
      submitRound1Results(true);
    } else if (roundNum === 2) {
      // Force submit memory
      submitRound2Results(true);
    } else if (roundNum === 3) {
      // Force submit logic
      submitRound3Results(true);
    } else if (roundNum === 4) {
      // End Round 4 Pattern
      submitRound4Results(true);
    }
  };

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // ── ROUND 1: Math Sprint Helpers ────────────────────────────────────────
  const handleR1NumpadClick = (val) => {
    if (r1Feedback) return;
    if (val === '⌫') {
      setR1Input((prev) => prev.slice(0, -1));
    } else if (val === '−') {
      if (r1Input === '') setR1Input('−');
    } else {
      if (r1Input === '−') setR1Input('-' + val);
      else setR1Input((prev) => prev + val);
    }
  };

  // Auto-check on input
  useEffect(() => {
    if (phase !== 'round1' || r1Feedback || !roundConfigs[1]) return;
    const currentQ = roundConfigs[1].questions[r1Index];
    if (!currentQ) return;

    const parsedInput = parseInt(r1Input.replace('−', '-'), 10);
    if (!isNaN(parsedInput) && parsedInput === currentQ.answer) {
      handleR1AnswerSubmit(true);
    }
  }, [r1Input, r1Index, phase, roundConfigs]);

  const handleR1AnswerSubmit = (isAutoCorrect = false) => {
    if (r1Feedback) return;
    const currentQ = roundConfigs[1].questions[r1Index];
    const parsedInput = parseInt(r1Input.replace('−', '-'), 10);
    const isCorrect = isAutoCorrect || (parsedInput === currentQ.answer);

    const timeSpent = Date.now() - r1StartTime;
    setR1ResponseTimes((prev) => [...prev, timeSpent]);

    if (isCorrect) {
      setR1CorrectCount((prev) => prev + 1);
      setR1Feedback('correct');
    } else {
      setR1Feedback('wrong');
      setR1ShowCorrect(`Correct Answer: ${currentQ.answer}`);
    }

    setTimeout(() => {
      setR1Feedback(null);
      setR1ShowCorrect('');
      setR1Input('');
      
      if (r1Index + 1 < 5) {
        setR1Index((prev) => prev + 1);
        setR1StartTime(Date.now());
      } else {
        submitRound1Results(false);
      }
    }, isCorrect ? 250 : 1200);
  };

  const submitRound1Results = (isTimeout = false) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    // Add dummy response times for unanswered questions if timeout
    const finalTimes = [...r1ResponseTimes];
    while (finalTimes.length < 5) {
      finalTimes.push(12000); // 12 seconds max baseline
    }

    const result = {
      roundNumber: 1,
      type: 'math',
      correct: r1CorrectCount,
      total: 5,
      responseTimes: finalTimes,
      timeTaken: totalRoundTime - timerLeft,
    };

    setRoundResults((prev) => [...prev, result]);
    
    // Auto advance to Round 2 (Memory)
    setCurrentRoundNumber(2);
    setPhase('round2');
    
    // Setup Round 2 Memory
    const r2Config = roundConfigs[2] || generateBrainCircuitRound(2);
    setR2SubPhase('display');
    setR2SelectedSlot(0);
    setR2RecalledItems(Array(r2Config.board.totalItems).fill(null));
    
    // Shuffle palette
    const palette = [...r2Config.board.items];
    for (let i = palette.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [palette[i], palette[j]] = [palette[j], palette[i]];
    }
    setR2PaletteItems(palette);

    // Load Memory display timer
    setTimerLeft(3000); // 3s display
    setTotalRoundTime(3000);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    let localTime = 3000;
    countdownIntervalRef.current = setInterval(() => {
      localTime -= 100;
      setTimerLeft(localTime);
      if (localTime <= 0) {
        clearInterval(countdownIntervalRef.current);
        setR2SubPhase('recall');
        setR2StartTime(Date.now());
        // Start playing recall timer
        loadRoundTimer(r2Config);
      }
    }, 100);
  };


  // ── ROUND 2: Memory Flash Helpers ────────────────────────────────────────
  const assignR2Palette = (item) => {
    if (r2SubPhase !== 'recall') return;
    setR2RecalledItems((prev) => {
      const updated = [...prev];
      const existing = updated.findIndex((ri) => ri && ri.id === item.id);
      if (existing !== -1) updated[existing] = null;
      updated[r2SelectedSlot] = item;
      return updated;
    });

    setR2SelectedSlot((prev) => (prev + 1) % roundConfigs[2].board.totalItems);
  };

  const clearR2Slot = (idx, e) => {
    e.stopPropagation();
    if (r2SubPhase !== 'recall') return;
    setR2RecalledItems((prev) => {
      const updated = [...prev];
      updated[idx] = null;
      return updated;
    });
    setR2SelectedSlot(idx);
  };

  const checkR2Answer = () => {
    if (r2SubPhase !== 'recall') return;
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const timeTaken = Date.now() - r2StartTime;
    setR2RoundTime(timeTaken);

    let correct = 0;
    roundConfigs[2].board.items.forEach((item, idx) => {
      const recalled = r2RecalledItems[idx];
      if (recalled && recalled.id === item.id) correct++;
    });

    setR2CorrectCount(correct);
    setR2SubPhase('feedback');

    // Auto-advance to round 3 after 2s
    setTimeout(() => {
      submitRound2Results(false, correct, timeTaken);
    }, 2500);
  };

  const submitRound2Results = (isTimeout = false, correctVal = 0, timeVal = 0) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const correct = isTimeout ? 0 : correctVal;
    const timeTaken = isTimeout ? roundConfigs[2].timeLimit : timeVal;

    const result = {
      roundNumber: 2,
      type: 'memory',
      correct,
      total: roundConfigs[2].board.totalItems,
      responseTimes: [timeTaken],
      timeTaken,
    };

    setRoundResults((prev) => [...prev, result]);

    // Setup Round 3 Logic
    setCurrentRoundNumber(3);
    setPhase('round3');
    
    const r3Config = roundConfigs[3] || generateBrainCircuitRound(3);
    const initialAssignments = {};
    r3Config.mystery.characters.forEach((char) => {
      r3Config.mystery.categories.forEach((cat) => {
        initialAssignments[`${char}-${cat.name}`] = '';
      });
    });
    setR3Assignments(initialAssignments);
    setR3Feedback(null);
    setR3StartTime(Date.now());
    loadRoundTimer(r3Config);
  };

  // ── ROUND 3: Logic Detective Helpers ─────────────────────────────────────
  const handleR3Select = (char, catName, val) => {
    if (r3Feedback) return;
    setR3Assignments((prev) => ({
      ...prev,
      [`${char}-${catName}`]: val,
    }));
  };

  const checkR3Solution = () => {
    if (r3Feedback) return;
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const timeTaken = Date.now() - r3StartTime;
    setR3TimeTaken(timeTaken);

    let correct = 0;
    let total = 0;
    const mystery = roundConfigs[3].mystery;

    mystery.characters.forEach((char) => {
      mystery.categories.forEach((cat) => {
        total++;
        if (assignmentsMatch(char, cat.name)) {
          correct++;
        }
      });
    });

    setR3CorrectCount(correct);
    setR3Feedback('shown');

    setTimeout(() => {
      submitRound3Results(false, correct, total, timeTaken);
    }, 3000);
  };

  const assignmentsMatch = (char, catName) => {
    const correctVal = roundConfigs[3].mystery.solution[char][catName];
    const studentVal = r3Assignments[`${char}-${catName}`];
    return studentVal === correctVal;
  };

  const isR3Ready = useMemo(() => {
    if (!roundConfigs[3]) return false;
    return roundConfigs[3].mystery.characters.every((char) =>
      roundConfigs[3].mystery.categories.every((cat) => r3Assignments[`${char}-${cat.name}`] !== '')
    );
  }, [roundConfigs, r3Assignments]);

  const submitRound3Results = (isTimeout = false, correctVal = 0, totalVal = 3, timeVal = 0) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const correct = isTimeout ? 0 : correctVal;
    const total = isTimeout ? 3 : totalVal;
    const timeTaken = isTimeout ? roundConfigs[3].timeLimit : timeVal;

    const result = {
      roundNumber: 3,
      type: 'logic',
      correct,
      total,
      responseTimes: [timeTaken],
      timeTaken,
    };

    setRoundResults((prev) => [...prev, result]);

    // Setup Round 4 Pattern
    setCurrentRoundNumber(4);
    setPhase('round4');

    setR4Index(0);
    setR4SelectedOption(null);
    setR4CorrectCount(0);
    setR4ResponseTimes([]);
    setR4StartTime(Date.now());
    loadRoundTimer(roundConfigs[4] || generateBrainCircuitRound(4));
  };

  // ── ROUND 4: Pattern Spotter Helpers ─────────────────────────────────────
  const selectR4Option = (opt) => {
    if (r4SelectedOption) return;
    setR4SelectedOption(opt);

    const timeSpent = Date.now() - r4StartTime;
    setR4ResponseTimes((prev) => [...prev, timeSpent]);

    const challenge = roundConfigs[4].challenges[r4Index];
    const isCorrect = String(opt.text) === String(challenge.answer);
    if (isCorrect) setR4CorrectCount((prev) => prev + 1);

    setTimeout(() => {
      setR4SelectedOption(null);
      if (r4Index + 1 < 3) {
        setR4Index((prev) => prev + 1);
        setR4StartTime(Date.now());
      } else {
        submitRound4Results(false, isCorrect ? r4CorrectCount + 1 : r4CorrectCount);
      }
    }, 1500);
  };

  const submitRound4Results = (isTimeout = false, finalCorrect = null) => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const correct = isTimeout ? 0 : (finalCorrect !== null ? finalCorrect : r4CorrectCount);
    
    const finalTimes = [...r4ResponseTimes];
    while (finalTimes.length < 3) {
      finalTimes.push(30000); // 30s baseline
    }

    const result = {
      roundNumber: 4,
      type: 'pattern',
      correct,
      total: 3,
      responseTimes: finalTimes,
      timeTaken: totalRoundTime - timerLeft,
    };

    const updatedResults = [...roundResults, result];
    setRoundResults(updatedResults);

    // Compute Brain Report
    const rep = calculateBrainReport(updatedResults);
    setReport(rep);
    setPhase('report');
  };


  // ── Render Items Helper ─────────────────────────────────────────────────
  const renderItemContent = (item) => {
    if (!item) return null;
    if (item.type === 'color') {
      return (
        <div className="w-10 h-10 rounded-full shadow-inner" style={{ backgroundColor: item.value }} />
      );
    }
    return (
      <span className="text-2xl font-black" style={{ color: item.displayColor }}>
        {item.value}
      </span>
    );
  };

  // Stepper Header helper
  const renderStepper = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center relative px-2">
        {/* Connector lines */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-4 h-0.5 bg-emerald-400 -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${((currentRoundNumber - 1) / 3) * 100}%` }}
        />

        {[1, 2, 3, 4].map((rNum) => {
          const isCompleted = currentRoundNumber > rNum;
          const isActive = currentRoundNumber === rNum;
          
          return (
            <div 
              key={rNum} 
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all ${
                isCompleted 
                  ? 'bg-emerald-400 text-white' 
                  : isActive 
                  ? 'bg-saathi-indigo text-white ring-4 ring-indigo-100 scale-110 shadow-md animate-pulse'
                  : 'bg-white text-saathi-muted border border-saathi-line'
              }`}
            >
              {isCompleted ? '✓' : rNum}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] font-black text-saathi-muted uppercase mt-2 px-1">
        <span>Math</span>
        <span>Memory</span>
        <span>Logic</span>
        <span>Pattern</span>
      </div>
    </div>
  );

  return (
    <main className="saathi-screen">
      <div className="phone-frame px-4 py-6 flex flex-col justify-between overflow-y-auto">
        
        {/* INTRO PHASE */}
        {phase === 'intro' && (
          <div className="flex-1 flex flex-col justify-between" style={{ animation: 'brain-fade-in-up 0.5s ease-out' }}>
            <div>
              <header className="flex items-center gap-3 mb-6">
                <button 
                  onClick={() => navigate('/')} 
                  className="p-2 rounded-xl hover:bg-saathi-line transition text-saathi-ink"
                  aria-label="Back"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <p className="text-xs font-bold text-saathi-indigo">Class Saathi Flagship Challenge</p>
                  <h1 className="text-2xl font-extrabold text-saathi-ink">
                    🚀 Brain Training Circuit
                  </h1>
                </div>
              </header>

              <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 rounded-2xl p-5 border border-indigo-100 shadow-sm mb-6">
                <p className="text-sm font-semibold text-saathi-ink leading-relaxed">
                  Welcome to the ultimate cognitive assessment. Complete <b>4 rapid-fire rounds</b> covering math, memory, logic, and patterns to unlock your personalized <b>Brain Report card</b>.
                </p>
              </div>

              {/* Round Previews */}
              <div className="space-y-3 mb-6">
                {[
                  { r: 1, t: '⚡ Round 1: Math Sprint', d: 'Solve 5 rapid arithmetic calculations.', color: 'text-amber-500 bg-amber-50' },
                  { r: 2, t: '🧠 Round 2: Memory Flash', d: 'Memorize visual items and recall positions.', color: 'text-saathi-indigo bg-indigo-50' },
                  { r: 3, t: '🕵️ Round 3: Logic Detective', d: 'Solve a mini logic grid mystery.', color: 'text-saathi-green bg-emerald-50' },
                  { r: 4, t: '🔍 Round 4: Rule Discovery', d: 'Find rules in 3 sequence challenges.', color: 'text-saathi-cyan bg-cyan-50' },
                ].map((item) => (
                  <div key={item.r} className="flex gap-4 items-center bg-white rounded-xl p-3 border border-saathi-line shadow-sm">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${item.color}`}>
                      R{item.r}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-saathi-ink">{item.t}</h4>
                      <p className="text-[11px] text-saathi-muted font-semibold mt-0.5">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startCircuit}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-saathi-indigo text-white font-bold hover:bg-saathi-indigoDark transition shadow w-full text-base"
            >
              Begin Circuit <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ROUND 1: Math Sprint */}
        {phase === 'round1' && roundConfigs[1] && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {renderStepper()}

              {/* Top HUD */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-saathi-ink">Question {r1Index + 1} of 5</span>
                <span className="text-xs font-bold text-saathi-red flex items-center gap-1">
                  <Clock size={14} /> {(timerLeft / 1000).toFixed(1)}s
                </span>
              </div>

              {/* Question Screen */}
              <div className={`bg-white rounded-2xl p-8 border border-saathi-line shadow-card text-center mb-6 relative overflow-hidden transition-colors duration-200 ${
                r1Feedback === 'correct' ? 'bg-emerald-50/50 border-saathi-green' : r1Feedback === 'wrong' ? 'bg-red-50/50 border-saathi-red' : ''
              }`}>
                <p className="text-[10px] font-bold text-saathi-muted uppercase tracking-wider mb-2">Solve the expression</p>
                <h3 className="text-4xl sm:text-5xl font-black text-saathi-ink tracking-tight">
                  {roundConfigs[1].questions[r1Index]?.expression}
                </h3>
                
                {/* Blinking input display */}
                <div className="mt-4 min-h-[40px] flex items-center justify-center gap-1">
                  <span className="text-2xl font-black text-saathi-indigo">{r1Input}</span>
                  {!r1Feedback && <span className="w-1.5 h-6 bg-saathi-indigo animate-pulse" />}
                </div>

                {r1ShowCorrect && (
                  <p className="text-xs font-bold text-saathi-red mt-2 animate-bounce">{r1ShowCorrect}</p>
                )}
              </div>
            </div>

            {/* Numpad */}
            <div>
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '−', 0, '⌫'].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleR1NumpadClick(String(num))}
                    className="w-full aspect-[4/3] rounded-xl bg-white border border-saathi-line text-lg font-bold text-saathi-ink flex items-center justify-center hover:bg-indigo-50 active:scale-95 transition-all shadow-sm"
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleR1AnswerSubmit(false)}
                disabled={r1Input === '' || r1Feedback}
                className="min-h-11 w-full rounded-xl bg-saathi-indigo text-white font-bold text-sm shadow hover:bg-saathi-indigoDark disabled:opacity-50"
              >
                Submit Answer
              </button>
            </div>
          </div>
        )}

        {/* ROUND 2: Memory Flash */}
        {phase === 'round2' && roundConfigs[2] && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {renderStepper()}

              {/* Top HUD */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-saathi-ink">
                  {r2SubPhase === 'display' ? 'Observe & Memorize!' : 'Recall Positions'}
                </span>
                <span className="text-xs font-bold text-saathi-red flex items-center gap-1">
                  <Clock size={14} /> {(timerLeft / 1000).toFixed(1)}s
                </span>
              </div>

              {/* Grid Layout */}
              <div 
                className="grid gap-3 max-w-sm mx-auto mb-6"
                style={{ gridTemplateColumns: `repeat(${roundConfigs[2].board.gridCols}, minmax(0, 1fr))` }}
              >
                {roundConfigs[2].board.items.map((item, idx) => {
                  const isSelected = r2SelectedSlot === idx && r2SubPhase === 'recall';
                  const recalled = r2RecalledItems[idx];
                  const isCorrect = recalled && recalled.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => r2SubPhase === 'recall' && setR2SelectedSlot(idx)}
                      className={`aspect-square rounded-2xl border-2 flex items-center justify-center p-3 relative cursor-pointer select-none transition-all duration-200 ${
                        r2SubPhase === 'display'
                          ? 'bg-white border-saathi-line'
                          : r2SubPhase === 'recall'
                          ? isSelected
                            ? 'bg-indigo-50 border-saathi-indigo ring-2 ring-saathi-indigo/25 scale-[1.02] shadow'
                            : recalled
                            ? 'bg-white border-indigo-200 shadow-sm'
                            : 'bg-gray-50 border-dashed border-gray-300'
                          : isCorrect // feedback
                          ? 'bg-emerald-50 border-saathi-green'
                          : 'bg-red-50 border-saathi-red'
                      }`}
                    >
                      {r2SubPhase === 'display' ? (
                        renderItemContent(item)
                      ) : r2SubPhase === 'recall' ? (
                        recalled ? (
                          <>
                            {renderItemContent(recalled)}
                            <button
                              onClick={(e) => clearR2Slot(idx, e)}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gray-400 text-white flex items-center justify-center text-[9px] font-bold"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-300">?</span>
                        )
                      ) : (
                        // Feedback Mode
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          {recalled ? renderItemContent(recalled) : <span className="text-sm text-gray-400">∅</span>}
                          <div className="absolute bottom-1 right-1">
                            {isCorrect ? <CheckCircle size={14} className="text-saathi-green" /> : <XCircle size={14} className="text-saathi-red" />}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recall Palette */}
            {r2SubPhase === 'recall' && (
              <div>
                <p className="text-[10px] font-bold text-saathi-muted uppercase tracking-wider mb-2 text-center">
                  Select item for active slot
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {r2PaletteItems.map((item) => {
                    const isUsed = r2RecalledItems.some((ri) => ri && ri.id === item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => assignR2Palette(item)}
                        disabled={isUsed}
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                          isUsed
                            ? 'bg-gray-100 border-saathi-line opacity-30 cursor-not-allowed'
                            : 'bg-white border-saathi-line hover:border-saathi-indigo hover:scale-105 active:scale-95 shadow-sm'
                        }`}
                      >
                        {renderItemContent(item)}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={checkR2Answer}
                  disabled={r2RecalledItems.some((ri) => ri === null)}
                  className={`min-h-12 w-full rounded-2xl font-bold transition text-sm shadow ${
                    r2RecalledItems.some((ri) => ri === null)
                      ? 'bg-gray-100 text-saathi-muted border border-saathi-line cursor-not-allowed'
                      : 'bg-saathi-indigo text-white hover:bg-saathi-indigoDark'
                  }`}
                >
                  Verify Pattern
                </button>
              </div>
            )}

            {r2SubPhase === 'feedback' && (
              <div className="text-center font-bold text-saathi-ink text-sm p-4 bg-gray-50 rounded-2xl border border-saathi-line">
                Round Complete: <span className="text-saathi-indigo">{r2CorrectCount} / 6</span> Correct items verified.
              </div>
            )}
          </div>
        )}

        {/* ROUND 3: Logic Detective */}
        {phase === 'round3' && roundConfigs[3] && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto">
            <div>
              {renderStepper()}

              {/* Top HUD */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-saathi-ink">Detective findings</span>
                <span className="text-xs font-bold text-saathi-red flex items-center gap-1">
                  <Clock size={14} /> {(timerLeft / 1000).toFixed(1)}s
                </span>
              </div>

              {/* Clues Card */}
              <section className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-4 border border-indigo-100 mb-6 shadow-sm">
                <h3 className="text-xs font-bold text-saathi-indigo uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Search size={14} /> The Mystery Clues
                </h3>
                <ul className="space-y-2">
                  {roundConfigs[3].mystery.clues.map((clue, idx) => (
                    <li key={idx} className="flex gap-2 text-xs font-medium text-saathi-ink leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-saathi-indigo rounded-full shrink-0 mt-1.5" />
                      <span>{clue}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Answers Grid */}
              <section className="space-y-3">
                {roundConfigs[3].mystery.characters.map((char) => (
                  <div key={char} className="p-3 bg-white rounded-xl border border-saathi-line shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-saathi-ink">{char}</span>
                      {r3Feedback === 'shown' && (
                        <span>
                          {roundConfigs[3].mystery.categories.every(cat => assignmentsMatch(char, cat.name)) ? (
                            <CheckCircle size={16} className="text-saathi-green" />
                          ) : (
                            <XCircle size={16} className="text-saathi-red" />
                          )}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {roundConfigs[3].mystery.categories.map((cat) => {
                        const correctVal = roundConfigs[3].mystery.solution[char][cat.name];
                        const studentVal = r3Assignments[`${char}-${cat.name}`];
                        const isCorrect = studentVal === correctVal;

                        return (
                          <div key={cat.name} className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-saathi-muted">{cat.name}</span>
                            <select
                              value={studentVal || ''}
                              onChange={(e) => handleR3Select(char, cat.name, e.target.value)}
                              disabled={r3Feedback === 'shown'}
                              className={`bg-gray-50 border rounded-lg text-xs font-semibold p-1.5 focus:outline-none ${
                                r3Feedback === 'shown'
                                  ? isCorrect
                                    ? 'border-saathi-green bg-emerald-50/20 text-saathi-green'
                                    : 'border-saathi-red bg-red-50/20 text-saathi-red'
                                  : 'border-saathi-line focus:border-saathi-indigo'
                              }`}
                            >
                              <option value="">Choose...</option>
                              {cat.items.map((item) => (
                                <option key={item} value={item}>{item}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            </div>

            {/* Action buttons */}
            <div className="mt-6">
              {!r3Feedback ? (
                <button
                  onClick={checkR3Solution}
                  disabled={!isR3Ready}
                  className={`min-h-12 w-full rounded-2xl font-bold transition text-sm shadow ${
                    isR3Ready
                      ? 'bg-saathi-indigo text-white hover:bg-saathi-indigoDark'
                      : 'bg-gray-100 text-saathi-muted border border-saathi-line cursor-not-allowed'
                  }`}
                >
                  Submit Case
                </button>
              ) : (
                <div className="text-center text-xs font-bold text-saathi-muted uppercase">
                  Checking findings...
                </div>
              )}
            </div>
          </div>
        )}

        {/* ROUND 4: Pattern Spotter */}
        {phase === 'round4' && roundConfigs[4] && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {renderStepper()}

              {/* Top HUD */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-saathi-ink">Challenge {r4Index + 1} of 3</span>
                <span className="text-xs font-bold text-saathi-red flex items-center gap-1">
                  <Clock size={14} /> {(timerLeft / 1000).toFixed(1)}s
                </span>
              </div>

              {/* Challenge Display */}
              <div className="bg-white rounded-2xl p-6 border border-saathi-line shadow-card text-center mb-6">
                <p className="text-[10px] font-bold text-saathi-muted uppercase tracking-wider mb-4">Complete the sequence</p>
                <div className="flex gap-2 justify-center items-center flex-wrap">
                  {roundConfigs[4].challenges[r4Index]?.sequence.map((term, idx) => {
                    const isQuestion = term === '?';
                    return (
                      <div
                        key={idx}
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center text-lg font-extrabold shadow-sm ${
                          isQuestion ? 'bg-indigo-50 border-saathi-indigo border-dashed text-saathi-indigo scale-105 animate-pulse' : 'bg-white border-saathi-line text-saathi-ink'
                        }`}
                      >
                        {term}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {roundConfigs[4].challenges[r4Index]?.options.map((opt) => {
                  const isSelected = r4SelectedOption && r4SelectedOption.id === opt.id;
                  const challenge = roundConfigs[4].challenges[r4Index];
                  const isCorrect = String(opt.text) === String(challenge.answer);
                  
                  let optStyle = 'bg-white border-saathi-line text-saathi-ink hover:border-saathi-indigo';
                  let icon = null;

                  if (r4SelectedOption) {
                    if (isCorrect) {
                      optStyle = 'bg-emerald-50 border-saathi-green text-saathi-green scale-[1.02]';
                      icon = <CheckCircle size={15} />;
                    } else if (isSelected) {
                      optStyle = 'bg-red-50 border-saathi-red text-saathi-red scale-[0.98]';
                      icon = <XCircle size={15} />;
                    } else {
                      optStyle = 'bg-gray-50 border-saathi-line text-gray-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectR4Option(opt)}
                      disabled={r4SelectedOption !== null}
                      className={`p-4 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-1.5 transition-all duration-200 ${optStyle}`}
                    >
                      {icon}
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {r4SelectedOption && (
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center text-xs font-bold text-saathi-ink animate-brain-slide-in-right">
                Rule: {roundConfigs[4].challenges[r4Index]?.rule}
              </div>
            )}
          </div>
        )}

        {/* REPORT PHASE */}
        {phase === 'report' && report && (
          <div className="flex-1 flex flex-col justify-between" style={{ animation: 'brain-scale-in 0.4s ease-out' }}>
            <div className="flex-1 overflow-y-auto pr-1 mb-4">
              <BrainReportCard report={report} />
            </div>
            
            {/* Buttons */}
            <div className="grid gap-3">
              <button
                onClick={startCircuit}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-saathi-indigo text-white font-bold hover:bg-saathi-indigoDark transition shadow w-full text-sm"
              >
                <RotateCcw size={16} /> Retry Circuit
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
