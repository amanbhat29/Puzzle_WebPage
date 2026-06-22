/**
 * Queens Puzzle — Scoring Engine & Achievement System
 *
 * Calculates final scores based on difficulty, time, mistakes, and hints.
 * Manages lightweight achievement badges persisted in localStorage.
 */

import { DIFFICULTY_CONFIG } from "./queensGenerator";

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Calculate the final score for a completed puzzle.
 *
 * Formula:
 *   baseScore
 *   − (mistakes × 10)
 *   − (hintsUsed × 25)
 *   + timeBonus (if solved within the target time)
 *
 * Score is clamped to a minimum of 10.
 */
export function calculateScore(difficulty, timeSeconds, mistakes, hintsUsed) {
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) return 0;

  let score = config.baseScore;

  // Mistake penalty
  score -= mistakes * 10;

  // Hint penalty
  score -= hintsUsed * 25;

  // Time bonus: full bonus if completed within target, linearly decreasing after
  if (timeSeconds <= config.timeBonus) {
    score += Math.round(config.baseScore * 0.5);
  } else if (timeSeconds <= config.timeBonus * 2) {
    const fraction = 1 - (timeSeconds - config.timeBonus) / config.timeBonus;
    score += Math.round(config.baseScore * 0.5 * fraction);
  }

  return Math.max(10, score);
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export const ACHIEVEMENTS = [
  { id: "first_victory",     icon: "🏆", name: "First Victory",     description: "Solve your first Queens puzzle" },
  { id: "speed_solver",      icon: "⚡", name: "Speed Solver",      description: "Solve a puzzle in under 60 seconds" },
  { id: "zero_mistakes",     icon: "🎯", name: "Zero Mistakes",     description: "Solve a puzzle without any mistakes" },
  { id: "strategic_thinker", icon: "🧠", name: "Strategic Thinker", description: "Solve a puzzle without using hints" },
  { id: "master_solver",     icon: "👑", name: "Master Solver",     description: "Solve a Master (8×8) puzzle" },
  { id: "speed_master",      icon: "🚀", name: "Speed Master",      description: "Solve Hard or above in under 90 seconds" },
  { id: "perfectionist",     icon: "💎", name: "Perfectionist",     description: "Solve with zero mistakes and zero hints" },
];

const STORAGE_KEY = "queens_achievements";

/** Return the Set of already-unlocked achievement IDs from localStorage. */
export function getUnlockedAchievements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

/** Persist a newly unlocked achievement. */
export function saveAchievement(id) {
  const unlocked = getUnlockedAchievements();
  unlocked.add(id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
  } catch {
    /* localStorage unavailable — silently ignore */
  }
}

/**
 * Given the results of a completed puzzle, determine which achievements
 * are newly earned (not previously unlocked).
 *
 * Returns an array of achievement objects.
 */
export function checkNewAchievements(difficulty, timeSeconds, mistakes, hintsUsed) {
  const unlocked = getUnlockedAchievements();
  const earned = [];

  function earn(id) {
    if (!unlocked.has(id)) {
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      if (achievement) {
        earned.push(achievement);
        saveAchievement(id);
      }
    }
  }

  // First Victory — always earned on first solve
  earn("first_victory");

  // Speed Solver — under 60 seconds
  if (timeSeconds < 60) earn("speed_solver");

  // Zero Mistakes
  if (mistakes === 0) earn("zero_mistakes");

  // Strategic Thinker — no hints
  if (hintsUsed === 0) earn("strategic_thinker");

  // Master Solver — 8×8
  if (difficulty === "master") earn("master_solver");

  // Speed Master — Hard+ in under 90s
  if (["hard", "expert", "master"].includes(difficulty) && timeSeconds < 90) {
    earn("speed_master");
  }

  // Perfectionist — zero mistakes AND zero hints
  if (mistakes === 0 && hintsUsed === 0) earn("perfectionist");

  return earned;
}
