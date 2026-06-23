/**
 * @file eliminationGridGenerator.js
 * @description Dynamic elimination grid / deductive logic generator for Class Saathi.
 *              Generates a consistent set of positive/negative clues with a guaranteed unique solution.
 */

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Vocabulary lists
const NAMES_POOL = ["Alex", "Blake", "Charlie", "Dan", "Emma", "Fiona", "Grace", "Henry"];
const CATEGORIES = [
  {
    name: "fruits",
    items: ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig"],
    verb: "likes",
    negativeVerb: "does not like"
  },
  {
    name: "colors",
    items: ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"],
    verb: "prefers",
    negativeVerb: "does not prefer"
  },
  {
    name: "animals",
    items: ["Dog", "Cat", "Parrot", "Rabbit", "Hamster", "Goldfish"],
    verb: "owns",
    negativeVerb: "does not own"
  }
];

/**
 * Deduces assignments using a basic constraint satisfaction solver.
 * Returns true if grid has a unique solution matching the true mapping.
 */
function solveGrid(clues, names, items) {
  const N = names.length;
  // grid[r][c] represent possibilities: true = possible, false = eliminated
  const grid = Array.from({ length: N }, () => Array.from({ length: N }, () => true));

  // Apply clues
  for (const clue of clues) {
    const r = names.indexOf(clue.name);
    const c = items.indexOf(clue.item);

    if (clue.type === "positive") {
      // Set this cell to true, and eliminate others in row and column
      for (let j = 0; j < N; j++) {
        if (j !== c) grid[r][j] = false;
      }
      for (let i = 0; i < N; i++) {
        if (i !== r) grid[i][c] = false;
      }
    } else if (clue.type === "negative") {
      grid[r][c] = false;
    }
  }

  // Deduce iteratively
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 20) {
    changed = false;
    iterations++;

    // Row check: if a row has only one possible item
    for (let r = 0; r < N; r++) {
      let possibleCols = [];
      for (let c = 0; c < N; c++) {
        if (grid[r][c]) possibleCols.push(c);
      }
      if (possibleCols.length === 1) {
        const c = possibleCols[0];
        // Eliminate this item for all other rows
        for (let i = 0; i < N; i++) {
          if (i !== r && grid[i][c]) {
            grid[i][c] = false;
            changed = true;
          }
        }
      }
    }

    // Column check: if a column has only one possible owner
    for (let c = 0; c < N; c++) {
      let possibleRows = [];
      for (let r = 0; r < N; r++) {
        if (grid[r][c]) possibleRows.push(r);
      }
      if (possibleRows.length === 1) {
        const r = possibleRows[0];
        // Eliminate other items for this row
        for (let j = 0; j < N; j++) {
          if (j !== c && grid[r][j]) {
            grid[r][j] = false;
            changed = true;
          }
        }
      }
    }
  }

  // Verify if it is fully solved (exactly one true in each row and column)
  for (let r = 0; r < N; r++) {
    let rowCount = 0;
    for (let c = 0; c < N; c++) {
      if (grid[r][c]) rowCount++;
    }
    if (rowCount !== 1) return false;
  }

  return true;
}

export function generateEliminationGrid(difficulty = "Medium") {
  const diff = String(difficulty).toLowerCase();
  
  // Choose entity count based on difficulty
  let N = 4;
  if (diff === "easy") N = 3;
  else if (diff === "hard") N = 5;

  // Pick names and items
  const names = shuffle(NAMES_POOL).slice(0, N);
  const category = pick(CATEGORIES);
  const items = shuffle(category.items).slice(0, N);

  // Form a random true assignment
  const trueMapping = {}; // name -> item
  names.forEach((name, idx) => {
    trueMapping[name] = items[idx];
  });

  // Keep generating clues until a unique solution is reached
  const clues = [];
  const clueStrings = [];
  const addedClues = new Set();

  let solved = false;
  let attempts = 0;

  while (!solved && attempts < 100) {
    attempts++;
    
    // Pick a random name
    const name = pick(names);
    const item = trueMapping[name];
    
    // Pick positive or negative clue
    const isPositive = Math.random() < 0.45;
    
    if (isPositive) {
      const clueKey = `pos-${name}`;
      if (!addedClues.has(clueKey)) {
        clues.push({ type: "positive", name, item });
        clueStrings.push(`${name} ${category.verb} ${item}.`);
        addedClues.add(clueKey);
      }
    } else {
      // Pick an item that is NOT correct for this name
      const wrongItem = pick(items.filter((itm) => itm !== item));
      const clueKey = `neg-${name}-${wrongItem}`;
      if (!addedClues.has(clueKey)) {
        clues.push({ type: "negative", name, item: wrongItem });
        clueStrings.push(`${name} ${category.negativeVerb} ${wrongItem}.`);
        addedClues.add(clueKey);
      }
    }

    // Check if the current clue set is enough to uniquely solve the grid
    solved = solveGrid(clues, names, items);
  }

  // If we couldn't solve or generated too many clues, restart
  if (!solved || clueStrings.length > N * 2) {
    return generateEliminationGrid(difficulty);
  }

  // Choose a random person to ask about
  const targetName = pick(names);
  const correctAnswer = trueMapping[targetName];

  // Distractors are other items in the list
  const distractors = items.filter((itm) => itm !== correctAnswer);
  const optionsList = shuffle([correctAnswer, ...distractors].slice(0, 4));
  
  // Format options
  const ids = ["a", "b", "c", "d"];
  const options = optionsList.map((val, idx) => ({
    id: ids[idx],
    text: val
  }));

  // Build explanation
  const explanationParts = clueStrings.map(c => `• ${c}`);
  explanationParts.push(`By logical elimination:`);
  names.forEach((n) => {
    explanationParts.push(`- ${n} likes ${trueMapping[n]}`);
  });
  explanationParts.push(`Therefore, ${targetName} ${category.verb} ${correctAnswer}.`);

  return {
    clues: clueStrings,
    question: `Which of the following ${category.name.slice(0, -1)} does ${targetName} prefer/like/own?`,
    rawQuestion: `Based on the clues, which ${category.name.slice(0, -1)} does ${targetName} match with?`,
    answer: correctAnswer,
    options,
    rule: "Eliminate impossible combinations using the clues.",
    explanation: explanationParts.join("\n"),
    targetEntity: targetName,
    verb: category.verb
  };
}
