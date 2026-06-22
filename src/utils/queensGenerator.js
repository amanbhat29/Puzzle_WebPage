/**
 * Queens Puzzle — Dynamic Board Generator
 *
 * Generates solvable N×N boards with contiguous colored regions.
 * Each board guarantees at least one valid solution where:
 *   • Exactly one queen per row
 *   • Exactly one queen per column
 *   • Exactly one queen per region
 *   • No two queens touch (including diagonally)
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export const DIFFICULTY_CONFIG = {
  easy:   { size: 4, label: "Easy",   emoji: "🟢", hints: 3, baseScore: 100, timeBonus: 60  },
  medium: { size: 5, label: "Medium", emoji: "🟡", hints: 2, baseScore: 200, timeBonus: 90  },
  hard:   { size: 6, label: "Hard",   emoji: "🟠", hints: 1, baseScore: 300, timeBonus: 120 },
  expert: { size: 7, label: "Expert", emoji: "🔴", hints: 1, baseScore: 400, timeBonus: 180 },
  master: { size: 8, label: "Master", emoji: "🟣", hints: 1, baseScore: 500, timeBonus: 240 },
};

export const REGION_COLORS = [
  { name: "violet",  bg: "#EDE9FE", hover: "#DDD6FE", border: "#C4B5FD", accent: "#7C3AED" },
  { name: "emerald", bg: "#D1FAE5", hover: "#A7F3D0", border: "#6EE7B7", accent: "#059669" },
  { name: "amber",   bg: "#FEF3C7", hover: "#FDE68A", border: "#FCD34D", accent: "#D97706" },
  { name: "rose",    bg: "#FFE4E6", hover: "#FECDD3", border: "#FDA4AF", accent: "#E11D48" },
  { name: "sky",     bg: "#E0F2FE", hover: "#BAE6FD", border: "#7DD3FC", accent: "#0284C7" },
  { name: "orange",  bg: "#FFEDD5", hover: "#FED7AA", border: "#FDBA74", accent: "#EA580C" },
  { name: "fuchsia", bg: "#FAE8FF", hover: "#F5D0FE", border: "#E879F9", accent: "#C026D3" },
  { name: "teal",    bg: "#CCFBF1", hover: "#99F6E4", border: "#5EEAD4", accent: "#0D9488" },
];

const DIFFICULTY_BADGE_COLORS = {
  easy:   { bg: "bg-emerald-50",  text: "text-emerald-600", ring: "ring-emerald-200" },
  medium: { bg: "bg-amber-50",    text: "text-amber-600",   ring: "ring-amber-200"   },
  hard:   { bg: "bg-orange-50",   text: "text-orange-600",  ring: "ring-orange-200"  },
  expert: { bg: "bg-red-50",      text: "text-red-600",     ring: "ring-red-200"     },
  master: { bg: "bg-purple-50",   text: "text-purple-600",  ring: "ring-purple-200"  },
};

export function getDifficultyColors(difficulty) {
  return DIFFICULTY_BADGE_COLORS[difficulty] ?? DIFFICULTY_BADGE_COLORS.easy;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Generate a complete board for the given difficulty key. */
export function generateBoard(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) throw new Error(`Unknown difficulty: ${difficulty}`);

  const size = config.size;

  // Try randomised backtracking; fall back to a known placement.
  let queens = generateQueenPlacement(size);
  if (!queens) queens = getDefaultPlacement(size);

  const regions = generateRegions(size, queens);
  const regionColors = shuffle([...REGION_COLORS]).slice(0, size);

  return { size, queens, regions, regionColors };
}

/** Create an empty grid filled with "empty" strings. */
export function createEmptyQueensGrid(size) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => "empty"));
}

/**
 * Find every conflicting cell key ("row-col") given the current grid.
 * A queen is in conflict if it shares a row, column, region, or is
 * adjacent (including diagonally) to another queen.
 */
export function findConflicts(grid, regions, size) {
  const queens = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "queen") queens.push([r, c]);
    }
  }

  const conflicts = new Set();

  // Row conflicts
  for (let r = 0; r < size; r++) {
    const inRow = queens.filter(([qr]) => qr === r);
    if (inRow.length > 1) inRow.forEach(([qr, qc]) => conflicts.add(`${qr}-${qc}`));
  }

  // Column conflicts
  for (let c = 0; c < size; c++) {
    const inCol = queens.filter(([, qc]) => qc === c);
    if (inCol.length > 1) inCol.forEach(([qr, qc]) => conflicts.add(`${qr}-${qc}`));
  }

  // Region conflicts
  const regionMap = {};
  queens.forEach(([r, c]) => {
    const rid = regions[r][c];
    if (!regionMap[rid]) regionMap[rid] = [];
    regionMap[rid].push([r, c]);
  });
  Object.values(regionMap).forEach((list) => {
    if (list.length > 1) list.forEach(([r, c]) => conflicts.add(`${r}-${c}`));
  });

  // Adjacency conflicts (including diagonal)
  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const [r1, c1] = queens[i];
      const [r2, c2] = queens[j];
      if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) {
        conflicts.add(`${r1}-${c1}`);
        conflicts.add(`${r2}-${c2}`);
      }
    }
  }

  return conflicts;
}

/**
 * Check whether the current grid satisfies all win conditions.
 * Does NOT require matching a specific stored solution — any valid
 * placement is accepted.
 */
export function checkWin(grid, regions, size) {
  const queens = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "queen") queens.push([r, c]);
    }
  }
  if (queens.length !== size) return false;

  // One per row
  if (new Set(queens.map(([r]) => r)).size !== size) return false;
  // One per column
  if (new Set(queens.map(([, c]) => c)).size !== size) return false;
  // One per region
  if (new Set(queens.map(([r, c]) => regions[r][c])).size !== size) return false;

  // No adjacency
  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const [r1, c1] = queens[i];
      const [r2, c2] = queens[j];
      if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) return false;
    }
  }
  return true;
}

/**
 * Return one hint position [row, col] from the stored solution
 * that the player hasn't placed a queen on yet, or null.
 */
export function getHintPosition(grid, solutionQueens) {
  const available = solutionQueens.filter(([r, c]) => grid[r][c] !== "queen");
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// ---------------------------------------------------------------------------
// Queen Placement — Randomised Backtracking
// ---------------------------------------------------------------------------

/**
 * Place N queens on an N×N board such that:
 *   • One queen per row
 *   • One queen per column
 *   • No two queens adjacent (including diagonally)
 *
 * Because each queen is in a distinct row, adjacency only needs to be
 * checked against the immediately preceding row (rows further apart have
 * row-distance ≥ 2 and therefore can never be adjacent).
 *
 * Returns an array of [row, col] pairs, or null on failure.
 */
function generateQueenPlacement(size) {
  const result = new Array(size).fill(-1);
  const usedCols = new Set();

  function isValid(row, col) {
    if (usedCols.has(col)) return false;
    if (row > 0 && Math.abs(result[row - 1] - col) <= 1) return false;
    return true;
  }

  function solve(row) {
    if (row === size) return true;
    const cols = shuffle(Array.from({ length: size }, (_, i) => i));
    for (const col of cols) {
      if (!isValid(row, col)) continue;
      result[row] = col;
      usedCols.add(col);
      if (solve(row + 1)) return true;
      result[row] = -1;
      usedCols.delete(col);
    }
    return false;
  }

  // Try a few times with different random orderings
  for (let attempt = 0; attempt < 50; attempt++) {
    result.fill(-1);
    usedCols.clear();
    if (solve(0)) return result.map((col, row) => [row, col]);
  }
  return null;
}

/** Verified fallback placements for each supported board size. */
function getDefaultPlacement(size) {
  const placements = {
    4: [[0, 1], [1, 3], [2, 0], [3, 2]],
    5: [[0, 0], [1, 2], [2, 4], [3, 1], [4, 3]],
    6: [[0, 1], [1, 3], [2, 5], [3, 0], [4, 2], [5, 4]],
    7: [[0, 0], [1, 2], [2, 4], [3, 6], [4, 1], [5, 3], [6, 5]],
    8: [[0, 0], [1, 2], [2, 4], [3, 6], [4, 1], [5, 3], [6, 5], [7, 7]],
  };
  return placements[size] ?? placements[4];
}

// ---------------------------------------------------------------------------
// Region Generation — Round-Robin BFS Growth
// ---------------------------------------------------------------------------

/**
 * Generate N contiguous regions for an N×N board.
 * Each queen's cell is the seed for its region; regions grow outward
 * in round-robin fashion using randomised BFS so that they end up
 * roughly equal in size but with organic, varied shapes.
 */
function generateRegions(size, queens) {
  const regions = Array.from({ length: size }, () => new Array(size).fill(-1));

  // Seed each region with its queen's cell
  queens.forEach(([row, col], id) => {
    regions[row][col] = id;
  });

  // Frontier queues — one per region
  const frontiers = queens.map(([row, col]) =>
    shuffle(getNeighbors4(row, col, size).filter(([r, c]) => regions[r][c] === -1))
  );

  let remaining = size * size - size;
  let safety = size * size * 12;

  while (remaining > 0 && safety-- > 0) {
    // Shuffle region processing order each round for variety
    const order = shuffle(Array.from({ length: size }, (_, i) => i));
    let grew = false;

    for (const regionId of order) {
      if (frontiers[regionId].length === 0) continue;

      // Occasionally grow 2 cells for more organic shapes
      const growCount = Math.random() < 0.25 ? 2 : 1;

      for (let g = 0; g < growCount && remaining > 0; g++) {
        // Find next unassigned cell in this frontier
        let found = false;
        while (frontiers[regionId].length > 0) {
          const [r, c] = frontiers[regionId].pop();
          if (regions[r][c] === -1) {
            regions[r][c] = regionId;
            remaining--;
            grew = true;
            found = true;

            // Add neighbours of the newly claimed cell
            const newNeighbors = shuffle(
              getNeighbors4(r, c, size).filter(([nr, nc]) => regions[nr][nc] === -1)
            );
            frontiers[regionId].push(...newNeighbors);
            break;
          }
        }
        if (!found) break;
      }
    }

    if (!grew) break;
  }

  // Safety net — assign any stragglers to an adjacent region
  if (remaining > 0) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (regions[r][c] !== -1) continue;
        for (const [nr, nc] of getNeighbors4(r, c, size)) {
          if (regions[nr][nc] !== -1) {
            regions[r][c] = regions[nr][nc];
            remaining--;
            break;
          }
        }
      }
    }
  }

  return regions;
}

/** 4-connected neighbours (up / down / left / right). */
function getNeighbors4(row, col, size) {
  const n = [];
  if (row > 0) n.push([row - 1, col]);
  if (row < size - 1) n.push([row + 1, col]);
  if (col > 0) n.push([row, col - 1]);
  if (col < size - 1) n.push([row, col + 1]);
  return n;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Fisher-Yates shuffle (returns a new array). */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
