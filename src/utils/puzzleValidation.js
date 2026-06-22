export function createEmptyGrid(size, fill = 0) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => fill));
}

export function validatePuzzle(puzzle, answer) {
  if (puzzle.type === "mini-queens") return validateQueens(answer, puzzle.size);
  if (puzzle.type === "color-balance") return validateColorBalance(answer, puzzle.size);
  if (puzzle.type === "pattern-detective") return answer === puzzle.correctOptionId;
  if (puzzle.type === "treasure-maze") return isSamePoint(answer?.position, puzzle.goal);
  if (puzzle.type === "space-fuel") return isSamePoint(answer?.position, puzzle.goal) && answer?.collectedFuel?.length === puzzle.fuelCells.length;
  return false;
}

export function hasAnswer(puzzle, answer) {
  if (!answer) return false;
  if (puzzle.type === "pattern-detective") return Boolean(answer);
  if (puzzle.type === "mini-queens") return answer.flat().filter(Boolean).length === puzzle.size;
  if (puzzle.type === "color-balance") return answer.flat().every(Boolean);
  if (puzzle.type === "treasure-maze") return isSamePoint(answer.position, puzzle.goal);
  if (puzzle.type === "space-fuel") return isSamePoint(answer.position, puzzle.goal) && answer.collectedFuel.length === puzzle.fuelCells.length;
  return false;
}

export function createMovementAnswer(puzzle) {
  const collectedFuel = puzzle.type === "space-fuel" && isPointInList(puzzle.start, puzzle.fuelCells) ? [pointKey(puzzle.start)] : [];
  return {
    position: puzzle.start,
    moves: 0,
    path: [puzzle.start],
    collectedFuel
  };
}

export function moveOnGrid(puzzle, answer, direction) {
  const current = answer ?? createMovementAnswer(puzzle);
  const [row, col] = current.position;
  const deltas = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1]
  };
  const [rowDelta, colDelta] = deltas[direction];
  const next = [row + rowDelta, col + colDelta];

  if (!isInsideGrid(next, puzzle.size) || isPointInList(next, puzzle.obstacles ?? [])) {
    return current;
  }

  const collectedFuel = new Set(current.collectedFuel ?? []);
  if (puzzle.type === "space-fuel" && isPointInList(next, puzzle.fuelCells)) {
    collectedFuel.add(pointKey(next));
  }

  return {
    ...current,
    position: next,
    moves: current.moves + 1,
    path: [...(current.path ?? []), next],
    collectedFuel: Array.from(collectedFuel)
  };
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

export function validateColorBalance(grid, size) {
  if (!grid) return false;

  for (let index = 0; index < size; index += 1) {
    const row = grid[index];
    const column = grid.map((line) => line[index]);
    if (!isBalancedLine(row) || !isBalancedLine(column)) return false;
    if (hasThreeInARow(row) || hasThreeInARow(column)) return false;
  }

  return true;
}

function isBalancedLine(line) {
  return line.filter((cell) => cell === "B").length === 2 && line.filter((cell) => cell === "Y").length === 2;
}

function hasThreeInARow(line) {
  return line.some((cell, index) => index < line.length - 2 && cell && cell === line[index + 1] && cell === line[index + 2]);
}

export function pointKey(point) {
  return `${point[0]}-${point[1]}`;
}

export function isSamePoint(pointA, pointB) {
  return Boolean(pointA && pointB && pointA[0] === pointB[0] && pointA[1] === pointB[1]);
}

export function isPointInList(point, list) {
  return list.some((item) => isSamePoint(point, item));
}

function isInsideGrid(point, size) {
  return point[0] >= 0 && point[0] < size && point[1] >= 0 && point[1] < size;
}
