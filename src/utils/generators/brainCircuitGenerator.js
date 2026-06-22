/**
 * @file brainCircuitGenerator.js
 * @description Brain Circuit mode orchestrator for Class Saathi Brain Training.
 *              Generates multi-round challenge configs by delegating to the
 *              individual puzzle generators, and computes a comprehensive brain report
 *              from the player's results.
 */

import { generateMathQuestion } from './mathGenerator';
import { generateMemoryBoard } from './memoryGenerator';
import { generateLogicMystery } from './logicDetectiveGenerator';
import { generatePatternChallenge } from './patternGenerator';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Clamp a value between 0 and 100.
 * @param {number} val
 * @returns {number}
 */
const clamp = (val) => Math.max(0, Math.min(100, Math.round(val)));

/**
 * Compute the arithmetic mean of an array of numbers.
 * Returns 0 for empty arrays.
 * @param {number[]} arr
 * @returns {number}
 */
const mean = (arr) => (arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length);

/**
 * Compute the standard deviation of an array of numbers.
 * @param {number[]} arr
 * @returns {number}
 */
const stdDev = (arr) => {
  if (arr.length <= 1) return 0;
  const avg = mean(arr);
  const variance = arr.reduce((s, v) => s + (v - avg) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
};

// ─── Round Generator ───────────────────────────────────────────────────────────

/**
 * Generate the configuration for a single Brain Circuit round.
 *
 * Round mapping:
 *   1 → Math (5 medium questions)
 *   2 → Memory (1 medium board)
 *   3 → Logic (1 easy mystery)
 *   4 → Pattern (3 medium challenges)
 *
 * @param {number} roundNumber - 1-based round number (1–4)
 * @returns {{
 *   roundNumber: number,
 *   type: string,
 *   title: string,
 *   description: string,
 *   timeLimit: number,
 *   questions?: object[],
 *   board?: object,
 *   mystery?: object,
 *   challenges?: object[]
 * }}
 *
 * @example
 *   const round1 = generateBrainCircuitRound(1);
 *   // → { roundNumber: 1, type: 'math', title: 'Speed Math', questions: [...5], ... }
 */
export const generateBrainCircuitRound = (roundNumber) => {
  switch (roundNumber) {
    // ── Round 1: Math Sprint ──
    case 1: {
      const questions = [];
      for (let i = 0; i < 5; i++) {
        questions.push({
          id: i,
          ...generateMathQuestion('medium'),
        });
      }
      return {
        roundNumber: 1,
        type: 'math',
        title: 'Speed Math',
        description: 'Solve 5 math problems as fast as you can!',
        timeLimit: 60000, // 60 seconds total
        questions,
      };
    }

    // ── Round 2: Memory Challenge ──
    case 2: {
      const board = generateMemoryBoard('medium');
      return {
        roundNumber: 2,
        type: 'memory',
        title: 'Memory Flash',
        description: 'Memorise the board, then recall what you saw!',
        timeLimit: 30000, // 30 seconds for recall phase
        board,
      };
    }

    // ── Round 3: Logic Detective ──
    case 3: {
      const mystery = generateLogicMystery('easy');
      return {
        roundNumber: 3,
        type: 'logic',
        title: 'Logic Detective',
        description: 'Use the clues to solve the mystery!',
        timeLimit: 120000, // 2 minutes
        mystery,
      };
    }

    // ── Round 4: Pattern Recognition ──
    case 4: {
      const challenges = [];
      for (let i = 0; i < 3; i++) {
        challenges.push({
          id: i,
          ...generatePatternChallenge('medium'),
        });
      }
      return {
        roundNumber: 4,
        type: 'pattern',
        title: 'Pattern Spotter',
        description: 'Find the pattern and predict the next term!',
        timeLimit: 90000, // 90 seconds
        challenges,
      };
    }

    default:
      throw new Error(`Invalid round number: ${roundNumber}. Must be 1–4.`);
  }
};

// ─── Brain Report Calculator ───────────────────────────────────────────────────

/**
 * @typedef {Object} RoundResult
 * @property {number} roundNumber    - Which round (1–4)
 * @property {string} type           - 'math' | 'memory' | 'logic' | 'pattern'
 * @property {number} correct        - Number of correct answers
 * @property {number} total          - Total questions / items
 * @property {number[]} responseTimes - Array of response times in ms (per question)
 * @property {number} timeTaken      - Total time taken for the round in ms
 */

/**
 * Calculate a comprehensive brain performance report from round results.
 *
 * Scoring breakdown:
 *   - **Speed Score**: Based on average response time in the math round.
 *     Faster → higher score. Baseline: 10s per question = 0, 1s = 100.
 *   - **Accuracy Score**: Overall % correct across all rounds.
 *   - **Memory Score**: Recall accuracy from the memory round (round 2).
 *   - **Reasoning Score**: Average accuracy of logic (round 3) + pattern (round 4).
 *   - **Attention Score**: Consistency — low variance in response times → higher score.
 *   - **Overall Score**: Weighted average of all five sub-scores.
 *
 * @param {RoundResult[]} roundResults - Array of results from each completed round.
 * @returns {{
 *   speedScore: number,
 *   accuracyScore: number,
 *   memoryScore: number,
 *   reasoningScore: number,
 *   attentionScore: number,
 *   overallScore: number,
 *   xpEarned: number,
 *   stars: number,
 *   level: string
 * }}
 *
 * @example
 *   const report = calculateBrainReport([
 *     { roundNumber: 1, type: 'math',    correct: 4, total: 5, responseTimes: [2000,3000,2500,1800,4000], timeTaken: 13300 },
 *     { roundNumber: 2, type: 'memory',  correct: 5, total: 6, responseTimes: [5000], timeTaken: 5000 },
 *     { roundNumber: 3, type: 'logic',   correct: 1, total: 1, responseTimes: [45000], timeTaken: 45000 },
 *     { roundNumber: 4, type: 'pattern', correct: 2, total: 3, responseTimes: [8000,6000,7000], timeTaken: 21000 },
 *   ]);
 *   // → { speedScore: 74, accuracyScore: 80, memoryScore: 83, ... }
 */
export const calculateBrainReport = (roundResults) => {
  // ── Gather per-round data ──

  const mathResult = roundResults.find((r) => r.type === 'math');
  const memoryResult = roundResults.find((r) => r.type === 'memory');
  const logicResult = roundResults.find((r) => r.type === 'logic');
  const patternResult = roundResults.find((r) => r.type === 'pattern');

  // ── Speed Score (based on math round response times) ──
  // Baseline: avg <= 1000ms → 100, avg >= 10000ms → 0, linear between
  let speedScore = 50; // default if no math round
  if (mathResult && mathResult.responseTimes.length > 0) {
    const avgRT = mean(mathResult.responseTimes);
    // Map [1000ms, 10000ms] → [100, 0]
    speedScore = clamp(((10000 - avgRT) / 9000) * 100);
  }

  // ── Accuracy Score (overall correct / total across all rounds) ──
  let totalCorrect = 0;
  let totalQuestions = 0;
  roundResults.forEach((r) => {
    totalCorrect += r.correct || 0;
    totalQuestions += r.total || 0;
  });
  const accuracyScore = totalQuestions > 0
    ? clamp((totalCorrect / totalQuestions) * 100)
    : 0;

  // ── Memory Score (memory round recall accuracy) ──
  let memoryScore = 0;
  if (memoryResult) {
    memoryScore = memoryResult.total > 0
      ? clamp((memoryResult.correct / memoryResult.total) * 100)
      : 0;
  }

  // ── Reasoning Score (logic + pattern average accuracy) ──
  const reasoningScores = [];
  if (logicResult && logicResult.total > 0) {
    reasoningScores.push((logicResult.correct / logicResult.total) * 100);
  }
  if (patternResult && patternResult.total > 0) {
    reasoningScores.push((patternResult.correct / patternResult.total) * 100);
  }
  const reasoningScore = reasoningScores.length > 0
    ? clamp(mean(reasoningScores))
    : 0;

  // ── Attention Score (consistency — low variance in response times) ──
  // Collect all response times across rounds
  const allResponseTimes = roundResults.flatMap((r) => r.responseTimes || []);
  let attentionScore = 50; // default
  if (allResponseTimes.length > 1) {
    const sd = stdDev(allResponseTimes);
    const avgRT = mean(allResponseTimes);

    // Coefficient of variation (CV) — lower = more consistent
    // CV 0 → 100, CV >= 1.0 → 0, linear between
    const cv = avgRT > 0 ? sd / avgRT : 0;
    attentionScore = clamp((1 - cv) * 100);
  }

  // ── Overall Score (weighted average) ──
  // Weights: speed 20%, accuracy 25%, memory 20%, reasoning 20%, attention 15%
  const overallScore = clamp(
    speedScore * 0.20 +
    accuracyScore * 0.25 +
    memoryScore * 0.20 +
    reasoningScore * 0.20 +
    attentionScore * 0.15
  );

  // ── XP Earned ──
  // Base: 50 XP + up to 150 bonus based on score
  const xpEarned = Math.round(50 + (overallScore / 100) * 150);

  // ── Stars (1–5) ──
  let stars;
  if (overallScore >= 90) stars = 5;
  else if (overallScore >= 75) stars = 4;
  else if (overallScore >= 55) stars = 3;
  else if (overallScore >= 35) stars = 2;
  else stars = 1;

  // ── Level ──
  let level;
  if (overallScore >= 85) level = 'Expert';
  else if (overallScore >= 65) level = 'Advanced';
  else if (overallScore >= 40) level = 'Intermediate';
  else level = 'Beginner';

  return {
    speedScore,
    accuracyScore,
    memoryScore,
    reasoningScore,
    attentionScore,
    overallScore,
    xpEarned,
    stars,
    level,
  };
};
