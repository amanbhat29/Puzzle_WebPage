export function createEmptyGrid(size, fill = 0) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => fill));
}

export function validatePuzzle(puzzle, answer) {
  if (puzzle.type === "mini-queens") return validateQueens(answer, puzzle.size);
  if (puzzle.type === "pattern-detection" || puzzle.type === "pattern-detective") {
    // For upgraded Pattern Detection, checking validation is handled inside the custom game loop,
    // but we can return whether the latest answer in the attempt context is marked as correct.
    return typeof answer === 'object' && answer !== null ? Boolean(answer.accuracy >= 100) : Boolean(answer);
  }
  return false;
}

export function hasAnswer(puzzle, answer) {
  if (!answer) return false;
  if (puzzle.type === "pattern-detection" || puzzle.type === "pattern-detective") return Boolean(answer);
  if (puzzle.type === "mini-queens") return answer.flat().filter(Boolean).length === puzzle.size;
  return false;
}

export function validateQueens(grid, size) {
  if (!grid) return false;
  const queens = [];

  for (let row = 0; row < size; row += 1) {
    const rowCount = grid[row].filter(Boolean).length;
    if (rowCount !== 1) return false;

    for (let col = 0; col < size; col += 1) {
      if (grid[row][col]) queens.push([row, col]);
    }
  }

  for (let col = 0; col < size; col += 1) {
    let colCount = 0;
    for (let row = 0; row < size; row += 1) {
      if (grid[row][col]) colCount += 1;
    }
    if (colCount !== 1) return false;
  }

  for (let i = 0; i < queens.length; i += 1) {
    for (let j = i + 1; j < queens.length; j += 1) {
      const [rowA, colA] = queens[i];
      const [rowB, colB] = queens[j];
      if (Math.abs(rowA - rowB) === Math.abs(colA - colB)) return false;
    }
  }

  return queens.length === size;
}

