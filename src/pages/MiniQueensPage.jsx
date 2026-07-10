import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Crown, HelpCircle, Lightbulb, RefreshCw, Timer, Trophy, Zap } from "lucide-react";
import QueensGameBoard from "../components/boards/QueensGameBoard";
import {
  DIFFICULTY_CONFIG,
  checkWin,
  createEmptyQueensGrid,
  findConflicts,
  generateBoard,
  getDifficultyColors,
  getHintPosition,
} from "../utils/queensGenerator";
import { ACHIEVEMENTS, calculateScore, checkNewAchievements, getUnlockedAchievements } from "../utils/queensScoring";
import { formatTimer } from "../utils/format";
import { savePuzzleResult } from "../utils/storage";
import { getUniqueQuestion } from "../utils/nonRepeatingGenerator";

// ═══════════════════════════════════════════════════════════════════════════
// MiniQueensPage — Full game page with difficulty selection, game play,
//                  and success screen.
// ═══════════════════════════════════════════════════════════════════════════

export default function MiniQueensPage() {
  const navigate = useNavigate();

  // ── Core state ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState("select"); // "select" | "playing" | "success"
  const [difficulty, setDifficulty] = useState(null);
  const [board, setBoard] = useState(null);
  const [grid, setGrid] = useState(null);

  // ── Game metrics ────────────────────────────────────────────────────────
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  // ── UI state ────────────────────────────────────────────────────────────
  const [conflicts, setConflicts] = useState(new Set());
  const [hintCell, setHintCell] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [boardKey, setBoardKey] = useState(0); // forces board re-mount for animation
  const [achievementToasts, setAchievementToasts] = useState([]);
  const [boardDisabled, setBoardDisabled] = useState(false);

  // ── Success state ───────────────────────────────────────────────────────
  const [finalScore, setFinalScore] = useState(0);
  const [earnedAchievements, setEarnedAchievements] = useState([]);

  const hintTimerRef = useRef(null);

  // ── Timer tick ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isTimerRunning) return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isTimerRunning]);

  // ── Cleanup hint timer on unmount ───────────────────────────────────────
  useEffect(() => () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); }, []);

  // ── Derived values ──────────────────────────────────────────────────────
  const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : null;

  const queensPlaced = useMemo(() => {
    if (!grid) return 0;
    return grid.flat().filter((c) => c === "queen").length;
  }, [grid]);

  const progress = config ? Math.round((queensPlaced / config.size) * 100) : 0;

  // ── Game lifecycle ──────────────────────────────────────────────────────

  const startGame = useCallback((diff) => {
    const cfg = DIFFICULTY_CONFIG[diff];
    const newBoard = getUniqueQuestion("mini-queens", () => generateBoard(diff), (b) => b.queens.join(","));
    setDifficulty(diff);
    setBoard(newBoard);
    setGrid(createEmptyQueensGrid(cfg.size));
    setTimer(0);
    setIsTimerRunning(true);
    setMistakes(0);
    setHintsUsed(0);
    setConflicts(new Set());
    setHintCell(null);
    setShowRules(false);
    setBoardKey((k) => k + 1);
    setBoardDisabled(false);
    setPhase("playing");
  }, []);

  const generateNewBoard = useCallback(() => {
    if (!difficulty) return;
    const cfg = DIFFICULTY_CONFIG[difficulty];
    const newBoard = getUniqueQuestion("mini-queens", () => generateBoard(difficulty), (b) => b.queens.join(","));
    setBoard(newBoard);
    setGrid(createEmptyQueensGrid(cfg.size));
    setTimer(0);
    setMistakes(0);
    setHintsUsed(0);
    setConflicts(new Set());
    setHintCell(null);
    setBoardKey((k) => k + 1);
    setBoardDisabled(false);
    setIsTimerRunning(true);
  }, [difficulty]);

  const handleWin = useCallback(() => {
    setIsTimerRunning(false);
    setBoardDisabled(true);
    const score = calculateScore(difficulty, timer, mistakes, hintsUsed);
    setFinalScore(score);
    const newAchievements = checkNewAchievements(difficulty, timer, mistakes, hintsUsed);
    setEarnedAchievements(newAchievements);

    // Save puzzle result in LocalStorage
    savePuzzleResult({
      puzzleId: 1,
      score: score,
      accuracy: 100, // Solved successfully
      timeTaken: timer
    });

    // Show achievement toasts sequentially
    newAchievements.forEach((a, i) => {
      setTimeout(() => {
        setAchievementToasts((prev) => [...prev, a]);
        setTimeout(() => setAchievementToasts((prev) => prev.filter((t) => t.id !== a.id)), 3500);
      }, i * 800);
    });

    // Slight delay before showing success screen for dramatic effect
    setTimeout(() => setPhase("success"), newAchievements.length > 0 ? 1200 : 600);
  }, [difficulty, timer, mistakes, hintsUsed]);

  // ── Cell interaction ────────────────────────────────────────────────────

  const handleCellClick = useCallback(
    (row, col) => {
      if (!grid || !board || boardDisabled) return;

      const current = grid[row][col];
      let next;
      if (current === "empty") next = "queen";
      else if (current === "queen") next = "marker";
      else next = "empty";

      const newGrid = grid.map((r) => [...r]);
      newGrid[row][col] = next;
      setGrid(newGrid);

      const newConflicts = findConflicts(newGrid, board.regions, board.size);

      // Mistake: placing a queen that is itself in conflict
      if (next === "queen" && newConflicts.has(`${row}-${col}`)) {
        setMistakes((m) => m + 1);
      }

      setConflicts(newConflicts);

      // Win check (only when placing a queen and no conflicts remain)
      if (next === "queen" && newConflicts.size === 0 && checkWin(newGrid, board.regions, board.size)) {
        handleWin();
      }
    },
    [grid, board, boardDisabled, handleWin]
  );

  // ── Hint ────────────────────────────────────────────────────────────────

  const useHint = useCallback(() => {
    if (!board || !grid || !config || boardDisabled) return;
    if (hintsUsed >= config.hints) return;

    const pos = getHintPosition(grid, board.queens);
    if (!pos) return;

    setHintsUsed((h) => h + 1);
    setHintCell(pos);
    setBoardDisabled(true);

    // Auto-place queen after glow animation
    hintTimerRef.current = setTimeout(() => {
      const [r, c] = pos;
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = "queen";

        const newConflicts = findConflicts(next, board.regions, board.size);
        setConflicts(newConflicts);

        if (newConflicts.size === 0 && checkWin(next, board.regions, board.size)) {
          setTimeout(() => handleWin(), 300);
        }

        return next;
      });
      setHintCell(null);
      setBoardDisabled(false);
    }, 1500);
  }, [board, grid, config, hintsUsed, boardDisabled, handleWin]);

  // ═══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <main className="saathi-screen">
      <div className="phone-frame relative flex flex-col">
        {/* Achievement Toasts */}
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2">
          {achievementToasts.map((a) => (
            <div key={a.id} className="queens-achievement-toast pointer-events-auto flex items-center gap-2 rounded-2xl bg-white px-5 py-3 shadow-lg ring-1 ring-saathi-line">
              <span className="text-xl">{a.icon}</span>
              <div>
                <p className="text-xs font-extrabold text-saathi-ink">{a.name}</p>
                <p className="text-[10px] font-semibold text-saathi-muted">{a.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Phase: Difficulty Selection */}
        {phase === "select" && <DifficultySelector onSelect={startGame} onBack={() => navigate("/")} />}

        {/* Phase: Playing */}
        {phase === "playing" && board && grid && config && (
          <>
            <GameHeader difficulty={difficulty} onBack={() => setPhase("select")} />
            <GameHUD
              difficulty={difficulty}
              size={board.size}
              timer={timer}
              queensPlaced={queensPlaced}
              totalQueens={board.size}
              mistakes={mistakes}
              progress={progress}
            />
            <div className="flex-1 overflow-y-auto px-4 pb-32 pt-3">
              <div key={boardKey}>
                <QueensGameBoard
                  board={board}
                  grid={grid}
                  onCellClick={handleCellClick}
                  conflicts={conflicts}
                  hintCell={hintCell}
                  disabled={boardDisabled}
                />
              </div>

              {/* Action buttons */}
              <div className="mx-auto mt-4 flex max-w-[420px] flex-wrap items-center justify-center gap-2">
                <ActionButton icon={<RefreshCw size={15} />} label="New Board" onClick={generateNewBoard} accent />
                <ActionButton
                  icon={<Lightbulb size={15} />}
                  label={`Hint (${Math.max(0, config.hints - hintsUsed)})`}
                  onClick={useHint}
                  disabled={hintsUsed >= config.hints || boardDisabled}
                />
                <ActionButton
                  icon={showRules ? <ChevronUp size={15} /> : <HelpCircle size={15} />}
                  label="Rules"
                  onClick={() => setShowRules((s) => !s)}
                />
              </div>

              {/* Rules panel */}
              {showRules && <RulesPanel />}
            </div>
          </>
        )}

        {/* Phase: Success */}
        {phase === "success" && (
          <SuccessScreen
            score={finalScore}
            difficulty={difficulty}
            timer={timer}
            mistakes={mistakes}
            hintsUsed={hintsUsed}
            achievements={earnedAchievements}
            onPlayAgain={() => startGame(difficulty)}
            onNewBoard={() => { generateNewBoard(); setPhase("playing"); }}
            onBack={() => navigate("/")}
            onChangeDifficulty={() => setPhase("select")}
          />
        )}
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════

// ── Difficulty Selector ──────────────────────────────────────────────────

function DifficultySelector({ onSelect, onBack }) {
  const unlocked = getUnlockedAchievements();

  return (
    <div className="flex flex-1 flex-col px-4 pb-8 pt-6">
      <button onClick={onBack} className="mb-4 inline-flex w-fit items-center gap-1.5 text-sm font-extrabold text-saathi-ink transition hover:text-saathi-green">
        <ArrowLeft size={17} /> Back to Puzzles
      </button>

      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 shadow-sm">
          <Crown size={28} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-saathi-ink">Mini Queens Challenge</h1>
        <p className="mt-1.5 text-sm font-semibold text-saathi-muted">Place queens on a dynamic board with colored regions</p>
      </div>

      <div className="grid gap-3">
        {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => {
          const colors = getDifficultyColors(key);
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`group flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md hover:ring-2 ${colors.ring}`}
            >
              <div className="flex items-center gap-3">
                <span className={`grid h-10 w-10 place-items-center rounded-xl text-lg ${colors.bg}`}>
                  {cfg.emoji}
                </span>
                <div className="text-left">
                  <p className={`text-sm font-extrabold ${colors.text}`}>{cfg.label}</p>
                  <p className="text-xs font-semibold text-saathi-muted">{cfg.size}×{cfg.size} Grid • {cfg.hints} Hint{cfg.hints > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${colors.bg} ${colors.text}`}>
                  {cfg.baseScore} pts
                </span>
                <ChevronDown size={16} className="rotate-[-90deg] text-saathi-muted transition group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Unlocked achievements preview */}
      {unlocked.size > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-center text-xs font-bold text-saathi-muted">Your Achievements</p>
          <div className="flex flex-wrap justify-center gap-2">
            {ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                {a.icon} {a.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Game Header ──────────────────────────────────────────────────────────

function GameHeader({ difficulty, onBack }) {
  const colors = getDifficultyColors(difficulty);
  const cfg = DIFFICULTY_CONFIG[difficulty];

  return (
    <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-saathi-ink transition hover:text-saathi-green">
        <ArrowLeft size={17} /> Back
      </button>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors.bg} ${colors.text}`}>
          {cfg?.label} {cfg?.size}×{cfg?.size}
        </span>
      </div>
    </header>
  );
}

// ── Game HUD ─────────────────────────────────────────────────────────────

function GameHUD({ difficulty, size, timer, queensPlaced, totalQueens, mistakes, progress }) {
  const colors = getDifficultyColors(difficulty);

  return (
    <div className="border-b border-saathi-line bg-gradient-to-r from-saathi-mintSoft to-white px-4 py-3">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        <HUDStat icon={<Timer size={13} />} value={formatTimer(timer)} label="Time" />
        <HUDStat icon={<Crown size={13} />} value={`${queensPlaced}/${totalQueens}`} label="Queens" />
        <HUDStat icon={<Zap size={13} />} value={mistakes} label="Mistakes" highlight={mistakes > 0} />
        <HUDStat icon={<Trophy size={13} />} value={`${progress}%`} label="Progress" />
      </div>
      {/* Progress bar */}
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: progress === 100 ? "#059669" : "#3f9674",
          }}
        />
      </div>
    </div>
  );
}

function HUDStat({ icon, value, label, highlight = false }) {
  return (
    <div className="text-center">
      <div className={`flex items-center justify-center gap-1 text-sm font-extrabold ${highlight ? "text-red-500" : "text-saathi-ink"}`}>
        <span className="text-saathi-muted">{icon}</span>
        {value}
      </div>
      <p className="text-[10px] font-bold text-saathi-muted">{label}</p>
    </div>
  );
}

// ── Action Buttons ───────────────────────────────────────────────────────

function ActionButton({ icon, label, onClick, disabled = false, accent = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm transition
        ${accent
          ? "bg-saathi-green text-white hover:bg-saathi-greenDark active:scale-95 disabled:bg-saathi-muted"
          : "bg-white text-saathi-ink ring-1 ring-saathi-line hover:ring-saathi-green hover:text-saathi-green active:scale-95 disabled:text-saathi-muted disabled:ring-saathi-line"
        }
        disabled:cursor-not-allowed
      `}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Rules Panel ──────────────────────────────────────────────────────────

function RulesPanel() {
  const rules = [
    { emoji: "👑", text: "Place exactly one queen in each row" },
    { emoji: "📏", text: "Place exactly one queen in each column" },
    { emoji: "🎨", text: "Place exactly one queen in each colored region" },
    { emoji: "🚫", text: "Queens cannot touch each other, even diagonally" },
  ];

  const interactions = [
    { action: "1st Click", result: "Place Queen 👑" },
    { action: "2nd Click", result: "Place Marker ✕" },
    { action: "3rd Click", result: "Clear Cell" },
  ];

  return (
    <div className="queens-board-enter mx-auto mt-3 max-w-[420px] rounded-2xl bg-white p-4 shadow-sm ring-1 ring-saathi-line">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-saathi-muted">Puzzle Rules</p>
      <div className="grid gap-2">
        {rules.map((rule) => (
          <div key={rule.text} className="flex items-start gap-2 rounded-xl bg-saathi-mintSoft px-3 py-2">
            <span className="text-sm">{rule.emoji}</span>
            <span className="text-xs font-bold text-saathi-ink">{rule.text}</span>
          </div>
        ))}
      </div>
      <p className="mb-2 mt-4 text-xs font-extrabold uppercase tracking-wide text-saathi-muted">How to Play</p>
      <div className="grid grid-cols-3 gap-2">
        {interactions.map((i) => (
          <div key={i.action} className="rounded-xl bg-gray-50 px-2 py-2 text-center">
            <p className="text-[10px] font-bold text-saathi-muted">{i.action}</p>
            <p className="mt-0.5 text-xs font-extrabold text-saathi-ink">{i.result}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Success Screen ───────────────────────────────────────────────────────

function SuccessScreen({ score, difficulty, timer, mistakes, hintsUsed, achievements, onPlayAgain, onNewBoard, onBack, onChangeDifficulty }) {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const colors = getDifficultyColors(difficulty);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8 pt-6 text-center">
      {/* Success icon */}
      <div className="queens-success-bounce mb-4 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 shadow-md">
        <span className="text-4xl">🎉</span>
      </div>

      <h1 className="text-3xl font-extrabold text-saathi-ink">Puzzle Solved!</h1>
      <p className="mt-1 text-sm font-semibold text-saathi-muted">Congratulations! You conquered the {cfg?.label} challenge.</p>

      {/* Score card */}
      <div className="mt-5 w-full max-w-sm rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/60 to-white p-5 shadow-card">
        <p className="text-xs font-extrabold uppercase text-amber-600">Score Earned</p>
        <p className="queens-score-pop mt-2 text-5xl font-extrabold text-saathi-ink">{score}</p>
        <p className="mt-1 text-xs font-semibold text-saathi-muted">points</p>
      </div>

      {/* Stats grid */}
      <div className="mt-4 grid w-full max-w-sm grid-cols-2 gap-3">
        <StatCard label="Difficulty" value={cfg?.label} icon={cfg?.emoji} />
        <StatCard label="Time" value={formatTimer(timer)} icon="⏱️" />
        <StatCard label="Mistakes" value={mistakes} icon={mistakes === 0 ? "✅" : "❌"} />
        <StatCard label="Hints Used" value={`${hintsUsed}/${cfg?.hints}`} icon="💡" />
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mt-4 w-full max-w-sm">
          <p className="mb-2 text-xs font-bold text-saathi-muted">Achievements Unlocked</p>
          <div className="flex flex-wrap justify-center gap-2">
            {achievements.map((a) => (
              <span key={a.id} className="queens-achievement-badge inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200 shadow-sm">
                {a.icon} {a.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-6 grid w-full max-w-sm gap-3">
        <button onClick={onPlayAgain} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-saathi-green px-5 text-sm font-bold text-white shadow-saathi transition hover:bg-saathi-greenDark active:scale-[0.97]">
          <RefreshCw size={16} /> Play Again
        </button>
        <button onClick={onNewBoard} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-saathi-line bg-white px-5 text-sm font-bold text-saathi-ink shadow-sm transition hover:border-saathi-green hover:text-saathi-green active:scale-[0.97]">
          <Zap size={16} /> Generate New Board
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onChangeDifficulty} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-saathi-line bg-white text-xs font-bold text-saathi-ink shadow-sm transition hover:border-saathi-green hover:text-saathi-green">
            Change Difficulty
          </button>
          <button onClick={onBack} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-saathi-line bg-white text-xs font-bold text-saathi-ink shadow-sm transition hover:border-saathi-green hover:text-saathi-green">
            Back to Puzzles
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-saathi-line bg-white p-3 shadow-sm">
      <p className="text-lg">{icon}</p>
      <p className="mt-1 text-lg font-extrabold text-saathi-ink">{value}</p>
      <p className="text-[10px] font-bold text-saathi-muted">{label}</p>
    </div>
  );
}
