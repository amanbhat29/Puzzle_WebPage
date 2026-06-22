import { puzzles } from '../data/puzzles';

// ─── Constants & Metadata ──────────────────────────────────────────────────

export const ACHIEVEMENTS = [
  {
    id: 'speed_master',
    title: '⚡ Speed Master',
    description: 'Complete Math Reflex Arena with 90% or higher accuracy.',
    emoji: '⚡'
  },
  {
    id: 'memory_expert',
    title: '🧠 Memory Expert',
    description: 'Score 85% or higher accuracy in Memory Flash Challenge.',
    emoji: '🧠'
  },
  {
    id: 'logic_champion',
    title: '🧩 Logic Champion',
    description: 'Complete Rule Discovery Challenge without using hints.',
    emoji: '🧩'
  },
  {
    id: 'accuracy_king',
    title: '🎯 Accuracy King',
    description: 'Maintain 95% or higher overall accuracy (min. 3 puzzle attempts).',
    emoji: '🎯'
  },
  {
    id: 'focus_filter_master',
    title: '⚡ Focus Master',
    description: 'Score 90% or higher accuracy in Focus Filter Challenge.',
    emoji: '⚡'
  },
  {
    id: 'stroop_champion',
    title: '🧠 Stroop Champion',
    description: 'Complete Stroop Challenge on Hard with 90% or higher accuracy.',
    emoji: '🧠'
  },
  {
    id: 'visual_radar_master',
    title: '🎯 Radar Master',
    description: 'Complete Visual Attention Radar on Hard with 90% or higher accuracy.',
    emoji: '🎯'
  }
];

// ─── Public storage operations ─────────────────────────────────────────────

/**
 * Saves a completed puzzle attempt. Calculates streaks and unlocks badges.
 */
export function savePuzzleResult({ puzzleId, score, accuracy, timeTaken, hintsUsed = null, difficulty = 'medium' }) {
  try {
    const history = JSON.parse(localStorage.getItem('cs_puzzle_history') || '[]');
    const puzzle = puzzles.find((p) => p.id === Number(puzzleId));
    if (!puzzle) return;

    const newAttempt = {
      puzzleId: Number(puzzleId),
      puzzleTitle: puzzle.displayName,
      category: puzzle.category,
      score: Math.round(score),
      accuracy: Math.round(accuracy),
      timeTaken: Math.round(timeTaken), // in seconds
      timestamp: Date.now(),
      attemptNumber: history.filter((h) => h.puzzleId === Number(puzzleId)).length + 1,
      hintsUsed: hintsUsed,
      difficulty: difficulty
    };

    history.push(newAttempt);
    localStorage.setItem('cs_puzzle_history', JSON.stringify(history));

    // Update streak and achievements
    updateUserStreak();
    checkAndUnlockAchievements(newAttempt, history);
  } catch (e) {
    console.error('Error saving puzzle result', e);
  }
}

/**
 * Returns raw history of attempts.
 */
export function getPuzzleHistory() {
  try {
    return JSON.parse(localStorage.getItem('cs_puzzle_history') || '[]');
  } catch {
    return [];
  }
}

/**
 * Clears all progress.
 */
export function clearProgress() {
  localStorage.removeItem('cs_puzzle_history');
  localStorage.removeItem('cs_user_streak');
  localStorage.removeItem('cs_unlocked_achievements');
}

/**
 * Computes streaks, cognitive skills, growth rates, and totals.
 */
export function getStudentProgress() {
  const history = getPuzzleHistory();
  const streak = getStreakInfo();
  const achievements = getUnlockedAchievements();

  // If no attempts, return default metrics
  if (history.length === 0) {
    return {
      totalCompleted: 0,
      avgAccuracy: 0,
      avgScore: 0,
      totalTimeSpent: 0,
      bestPuzzle: 'None',
      mostPlayedPuzzle: 'None',
      streak,
      achievements,
      skills: { speed: 50, accuracy: 50, memory: 50, attention: 50, reasoning: 50, focus: 50, observation: 50, cognitiveControl: 50, analytical: 50 },
      brainScore: 50,
      growth: { speed: 0, accuracy: 0, memory: 0, reasoning: 0, attention: 0, focus: 0, observation: 0, cognitiveControl: 0, analytical: 0 }
    };
  }

  // Basic totals
  const totalCompleted = history.length;
  const totalScore = history.reduce((sum, h) => sum + h.score, 0);
  const totalAccuracy = history.reduce((sum, h) => sum + h.accuracy, 0);
  const totalTimeSpent = history.reduce((sum, h) => sum + h.timeTaken, 0);

  // Most played & best puzzle
  const puzzleCounts = {};
  const puzzleBestScores = {};
  history.forEach((h) => {
    puzzleCounts[h.puzzleTitle] = (puzzleCounts[h.puzzleTitle] || 0) + 1;
    puzzleBestScores[h.puzzleTitle] = Math.max(puzzleBestScores[h.puzzleTitle] || 0, h.score);
  });

  let mostPlayedPuzzle = 'None';
  let maxPlayCount = 0;
  Object.entries(puzzleCounts).forEach(([title, count]) => {
    if (count > maxPlayCount) {
      maxPlayCount = count;
      mostPlayedPuzzle = title;
    }
  });

  let bestPuzzle = 'None';
  let highestBest = -1;
  Object.entries(puzzleBestScores).forEach(([title, score]) => {
    if (score > highestBest) {
      highestBest = score;
      bestPuzzle = title;
    }
  });

  // Calculate Cognitive skills
  const skills = calculateSkills(history);
  const brainScore = Math.round(
    (skills.speed + skills.accuracy + skills.memory + skills.reasoning + skills.attention + skills.focus + skills.observation + skills.cognitiveControl) / 8
  );

  // Growth rates (compares current attempts vs baseline attempts)
  const growth = calculateGrowth(history);

  return {
    totalCompleted,
    avgAccuracy: Math.round(totalAccuracy / totalCompleted),
    avgScore: Math.round(totalScore / totalCompleted),
    totalTimeSpent,
    bestPuzzle,
    mostPlayedPuzzle,
    streak,
    achievements,
    skills,
    brainScore,
    growth
  };
}

// ─── Streaks Tracker ───────────────────────────────────────────────────────

function updateUserStreak() {
  try {
    const streakData = localStorage.getItem('cs_user_streak');
    let streak = streakData ? JSON.parse(streakData) : { currentStreak: 0, longestStreak: 0, lastAttemptDate: '' };

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streak.lastAttemptDate === todayStr) {
      // Already played today, do not increment streak again
      return;
    } else if (streak.lastAttemptDate === yesterdayStr) {
      // Played yesterday, increment streak
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
    } else {
      // Last play was older or none, reset/start streak
      streak.currentStreak = 1;
      if (streak.longestStreak === 0) {
        streak.longestStreak = 1;
      }
    }

    streak.lastAttemptDate = todayStr;
    localStorage.setItem('cs_user_streak', JSON.stringify(streak));
  } catch (e) {
    console.error('Error updating streak', e);
  }
}

function getStreakInfo() {
  try {
    const streakData = localStorage.getItem('cs_user_streak');
    return streakData ? JSON.parse(streakData) : { currentStreak: 0, longestStreak: 0 };
  } catch {
    return { currentStreak: 0, longestStreak: 0 };
  }
}

// ─── Achievements Locker ───────────────────────────────────────────────────

function getUnlockedAchievements() {
  try {
    const unlocked = JSON.parse(localStorage.getItem('cs_unlocked_achievements') || '[]');
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: unlocked.includes(a.id)
    }));
  } catch {
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false }));
  }
}

function checkAndUnlockAchievements(newAttempt, history) {
  try {
    const unlocked = JSON.parse(localStorage.getItem('cs_unlocked_achievements') || '[]');
    const toUnlock = new Set(unlocked);

    // 1. Speed Master
    if (newAttempt.puzzleId === 6 && newAttempt.accuracy >= 90) {
      toUnlock.add('speed_master');
    }

    // 2. Memory Expert
    if (newAttempt.puzzleId === 9 && newAttempt.accuracy >= 85) {
      toUnlock.add('memory_expert');
    }

    // 3. Logic Champion
    if (newAttempt.puzzleId === 8 && newAttempt.hintsUsed === 0) {
      toUnlock.add('logic_champion');
    }

    // 4. Accuracy King
    const overallAcc = history.reduce((sum, h) => sum + h.accuracy, 0) / history.length;
    if (history.length >= 3 && overallAcc >= 95) {
      toUnlock.add('accuracy_king');
    }

    // 5. Focus Master (New)
    if (newAttempt.puzzleId === 10 && newAttempt.accuracy >= 90) {
      toUnlock.add('focus_filter_master');
    }

    // 6. Stroop Champion (New)
    if (newAttempt.puzzleId === 11 && newAttempt.difficulty === 'hard' && newAttempt.accuracy >= 90) {
      toUnlock.add('stroop_champion');
    }

    // 7. Radar Master (New)
    if (newAttempt.puzzleId === 12 && newAttempt.difficulty === 'hard' && newAttempt.accuracy >= 90) {
      toUnlock.add('visual_radar_master');
    }

    localStorage.setItem('cs_unlocked_achievements', JSON.stringify(Array.from(toUnlock)));
  } catch (e) {
    console.error('Error unlocking achievements', e);
  }
}

// ─── Skills Rating Math ────────────────────────────────────────────────────

function calculateSkills(history) {
  const getAvg = (filterFn, defaultVal = 50) => {
    const filtered = history.filter(filterFn);
    if (filtered.length === 0) return defaultVal;
    return Math.round(filtered.reduce((sum, h) => sum + h.accuracy, 0) / filtered.length);
  };

  // Speed: Math Reflex is the only speed game
  const speed = getAvg((h) => h.puzzleId === 6, 50);

  // Overall Accuracy across all attempts
  const accuracy = Math.round(history.reduce((sum, h) => sum + h.accuracy, 0) / history.length);

  // Memory: Memory Flash (9) + Visual Attention Radar (12)
  const memory = getAvg((h) => [9, 12].includes(h.puzzleId), 50);

  // Reasoning: Logic category puzzles (id 1, 2, 3, 4, 5) and Rule Discovery (id 8)
  const reasoning = getAvg((h) => h.category === 'logic' || h.puzzleId === 8, 50);

  // Attention: Focus Filter (10) + Visual Attention Radar (12) + Memory Flash (9)
  const attention = getAvg((h) => [9, 10, 12].includes(h.puzzleId), 50);

  // Focus: Focus Filter (10) + Stroop (11)
  const focus = getAvg((h) => [10, 11].includes(h.puzzleId), 50);

  // Observation: Visual Attention Radar (12)
  const observation = getAvg((h) => h.puzzleId === 12, 50);

  // Cognitive Control: Stroop Challenge (11)
  const cognitiveControl = getAvg((h) => h.puzzleId === 11, 50);

  // Analytical thinking: Queens (1), Space Fuel (5), and Rule Discovery (8)
  const analytical = getAvg((h) => [1, 5, 8].includes(h.puzzleId), 50);

  return { speed, accuracy, memory, attention, reasoning, focus, observation, cognitiveControl, analytical };
}

// ─── Growth Calculation (Current vs Baseline) ──────────────────────────────

function calculateGrowth(history) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
  
  let currentGroup = history.filter((h) => h.timestamp >= sevenDaysAgo);
  let baselineGroup = history.filter((h) => h.timestamp < sevenDaysAgo);

  // Fallback if no baseline exists (e.g. all attempts are today/this week)
  if (baselineGroup.length === 0 && history.length >= 2) {
    // Split chronologically: first half as baseline, second half as current
    const mid = Math.floor(history.length / 2);
    baselineGroup = history.slice(0, mid);
    currentGroup = history.slice(mid);
  }

  // If we still can't form groups to compare, return zero growths
  if (baselineGroup.length === 0 || currentGroup.length === 0) {
    return { speed: 0, accuracy: 0, memory: 0, reasoning: 0, attention: 0, focus: 0, observation: 0, cognitiveControl: 0, analytical: 0 };
  }

  const baselineSkills = calculateSkills(baselineGroup);
  const currentSkills = calculateSkills(currentGroup);

  const diff = (curr, base) => {
    // Net growth percentage (clamped for visual display)
    return Math.round(curr - base);
  };

  return {
    speed: diff(currentSkills.speed, baselineSkills.speed),
    accuracy: diff(currentSkills.accuracy, baselineSkills.accuracy),
    memory: diff(currentSkills.memory, baselineSkills.memory),
    reasoning: diff(currentSkills.reasoning, baselineSkills.reasoning),
    attention: diff(currentSkills.attention, baselineSkills.attention),
    focus: diff(currentSkills.focus, baselineSkills.focus),
    observation: diff(currentSkills.observation, baselineSkills.observation),
    cognitiveControl: diff(currentSkills.cognitiveControl, baselineSkills.cognitiveControl),
    analytical: diff(currentSkills.analytical, baselineSkills.analytical)
  };
}
