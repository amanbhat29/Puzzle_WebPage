/**
 * @file mathGenerator.js
 * @description Dynamic math question generator for Class Saathi Brain Training.
 *              Produces infinite unique arithmetic questions at three difficulty levels.
 *              All questions are generated procedurally — no static question banks.
 */

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generate a random integer between min and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Pick a random element from an array.
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Shuffle an array in-place (Fisher-Yates) and return it.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// ─── Easy Difficulty ───────────────────────────────────────────────────────────

/**
 * Generate an easy question: single-digit operands (1-9), operations +, -, ×.
 * Subtraction is guaranteed non-negative.
 * @returns {{ expression: string, answer: number, operation: string }}
 */
const generateEasy = () => {
  const operation = pick(['+', '-', '×']);

  let a, b, answer, expression;

  switch (operation) {
    case '+':
      a = randInt(1, 9);
      b = randInt(1, 9);
      answer = a + b;
      expression = `${a} + ${b}`;
      break;

    case '-':
      // Ensure a >= b so result is never negative
      a = randInt(1, 9);
      b = randInt(1, a);
      answer = a - b;
      expression = `${a} - ${b}`;
      break;

    case '×':
      a = randInt(1, 9);
      b = randInt(1, 9);
      answer = a * b;
      expression = `${a} × ${b}`;
      break;

    default:
      break;
  }

  return { expression, answer, operation };
};

// ─── Medium Difficulty ─────────────────────────────────────────────────────────

/**
 * Generate a medium question: double-digit operands (10-99), operations +, -, ×, ÷.
 * Division always produces a clean integer (no remainders).
 * Subtraction is guaranteed non-negative.
 * @returns {{ expression: string, answer: number, operation: string }}
 */
const generateMedium = () => {
  const operation = pick(['+', '-', '×', '÷']);

  let a, b, answer, expression;

  switch (operation) {
    case '+':
      a = randInt(10, 99);
      b = randInt(10, 99);
      answer = a + b;
      expression = `${a} + ${b}`;
      break;

    case '-':
      a = randInt(10, 99);
      b = randInt(10, a);
      answer = a - b;
      expression = `${a} - ${b}`;
      break;

    case '×':
      // Keep factors reasonable (10-30) to avoid huge products
      a = randInt(10, 30);
      b = randInt(2, 12);
      answer = a * b;
      expression = `${a} × ${b}`;
      break;

    case '÷':
      // Build a clean division: pick divisor & quotient, then compute dividend
      b = randInt(2, 12);                       // divisor
      const quotient = randInt(10, 50);          // result
      a = b * quotient;                          // dividend (always divisible)
      answer = quotient;
      expression = `${a} ÷ ${b}`;
      break;

    default:
      break;
  }

  return { expression, answer, operation };
};

// ─── Hard Difficulty ───────────────────────────────────────────────────────────

/**
 * Generate a hard question: multi-step with parentheses.
 * Formats:
 *   (a + b) × c
 *   a × b - c       (guaranteed non-negative)
 *   (a - b) + c × d  (guaranteed non-negative intermediate)
 * @returns {{ expression: string, answer: number, operation: string }}
 */
const generateHard = () => {
  const format = pick(['addMul', 'mulSub', 'subAddMul']);

  let expression, answer;

  switch (format) {
    case 'addMul': {
      // (a + b) × c
      const a = randInt(2, 15);
      const b = randInt(2, 15);
      const c = randInt(2, 9);
      answer = (a + b) * c;
      expression = `(${a} + ${b}) × ${c}`;
      return { expression, answer, operation: 'multi-step' };
    }

    case 'mulSub': {
      // a × b - c, guaranteed >= 0
      const a = randInt(3, 12);
      const b = randInt(3, 12);
      const product = a * b;
      const c = randInt(1, product); // never exceeds product
      answer = product - c;
      expression = `${a} × ${b} - ${c}`;
      return { expression, answer, operation: 'multi-step' };
    }

    case 'subAddMul': {
      // (a - b) + c × d, with a >= b
      const a = randInt(10, 30);
      const b = randInt(1, a - 1); // guarantees a - b > 0
      const c = randInt(2, 8);
      const d = randInt(2, 8);
      answer = (a - b) + c * d;
      expression = `(${a} - ${b}) + ${c} × ${d}`;
      return { expression, answer, operation: 'multi-step' };
    }

    default:
      break;
  }
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a single math question at the specified difficulty.
 *
 * @param {'easy' | 'medium' | 'hard'} difficulty - The difficulty tier.
 * @returns {{ expression: string, answer: number, operation: string }}
 *
 * @example
 *   generateMathQuestion('easy')
 *   // → { expression: '7 + 3', answer: 10, operation: '+' }
 *
 *   generateMathQuestion('medium')
 *   // → { expression: '48 ÷ 6', answer: 8, operation: '÷' }
 *
 *   generateMathQuestion('hard')
 *   // → { expression: '(5 + 8) × 3', answer: 39, operation: 'multi-step' }
 */
export const generateMathQuestion = (difficulty = 'easy') => {
  switch (difficulty) {
    case 'easy':
      return generateEasy();
    case 'medium':
      return generateMedium();
    case 'hard':
      return generateHard();
    default:
      return generateEasy();
  }
};
