/**
 * @file memoryGenerator.js
 * @description Dynamic memory board generator for Class Saathi Brain Training.
 *              Creates random memory boards with shapes, colors, numbers, and symbols.
 *              Players memorise the board and then recall the items.
 */

// ─── Item Pools ────────────────────────────────────────────────────────────────

/** Unicode shape glyphs */
const SHAPES = ['▲', '■', '●', '◆', '★', '⬟', '⬡'];

/** Saathi design-token colours */
const COLORS = [
  '#ef5543', // saathi-red
  '#3f9674', // saathi-green
  '#6366f1', // saathi-indigo
  '#f7b331', // saathi-amber
  '#06b6d4', // saathi-cyan
  '#8b5cf6', // saathi-violet
  '#8ccdf7', // saathi-blue
];

/** Single-digit numerals */
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Decorative symbols */
const SYMBOLS = ['♠', '♣', '♥', '♦', '✿', '☀', '⚡'];

/** All item types with their pools */
const TYPE_POOLS = {
  shape:  SHAPES,
  color:  COLORS,
  number: NUMBERS,
  symbol: SYMBOLS,
};

/** Display colours for non-color item types (one per type for visual distinction) */
const TYPE_DISPLAY_COLORS = {
  shape:  COLORS,
  number: COLORS,
  symbol: COLORS,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Random integer between min and max (inclusive).
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
 * Shuffle an array (Fisher-Yates) — returns a new copy.
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// ─── Item Generator ────────────────────────────────────────────────────────────

/**
 * Generate a single random memory item.
 *
 * @param {number} id - Unique item ID
 * @returns {{ id: number, type: string, value: string, displayColor: string }}
 */
const generateItem = (id) => {
  const typeKeys = Object.keys(TYPE_POOLS);
  const type = pick(typeKeys);
  const pool = TYPE_POOLS[type];
  const value = pick(pool);

  // For 'color' type, the value IS the colour, so displayColor = value
  // For other types, pick a random display colour
  let displayColor;
  if (type === 'color') {
    displayColor = value;
  } else {
    displayColor = pick(TYPE_DISPLAY_COLORS[type]);
  }

  return { id, type, value, displayColor };
};

// ─── Difficulty Configuration ──────────────────────────────────────────────────

/**
 * Get board configuration for the given difficulty.
 * @param {'easy' | 'medium' | 'hard'} difficulty
 * @returns {{ totalItems: number, displayTime: number, gridCols: number }}
 */
const getDifficultyConfig = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return { totalItems: 4, displayTime: 4000, gridCols: 2 };
    case 'medium':
      return { totalItems: 6, displayTime: 3000, gridCols: 3 };
    case 'hard':
      return { totalItems: 9, displayTime: 2500, gridCols: 3 };
    default:
      return { totalItems: 4, displayTime: 4000, gridCols: 2 };
  }
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a memory board at the specified difficulty.
 *
 * Each item on the board has a type (shape / color / number / symbol),
 * a value, and a display colour. The board is meant to be shown for
 * `displayTime` milliseconds, then hidden — the player must recall it.
 *
 * @param {'easy' | 'medium' | 'hard'} difficulty
 * @returns {{
 *   items: { id: number, type: string, value: string, displayColor: string }[],
 *   displayTime: number,
 *   gridCols: number,
 *   totalItems: number
 * }}
 *
 * @example
 *   generateMemoryBoard('easy')
 *   // → {
 *   //   items: [
 *   //     { id: 0, type: 'shape', value: '▲', displayColor: '#ef5543' },
 *   //     { id: 1, type: 'number', value: '7', displayColor: '#6366f1' },
 *   //     { id: 2, type: 'symbol', value: '♥', displayColor: '#3f9674' },
 *   //     { id: 3, type: 'color', value: '#f7b331', displayColor: '#f7b331' }
 *   //   ],
 *   //   displayTime: 4000,
 *   //   gridCols: 2,
 *   //   totalItems: 4
 *   // }
 */
export const generateMemoryBoard = (difficulty = 'easy') => {
  const config = getDifficultyConfig(difficulty);
  const items = [];

  for (let i = 0; i < config.totalItems; i++) {
    items.push(generateItem(i));
  }

  return {
    items,
    displayTime: config.displayTime,
    gridCols: config.gridCols,
    totalItems: config.totalItems,
  };
};
