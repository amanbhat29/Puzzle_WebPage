/**
 * @file patternDetectionGenerator.js
 * @description Dynamic pattern/sequence generator for Class Saathi upgraded Pattern Detection.
 *              Generates Number, Shape, Symbol, Position, and Logic patterns.
 */

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[j], copy[i]] = [copy[i], copy[j]];
  }
  return copy;
};

// Alphabet array
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Helper to build smart multiple-choice options for numbers
const buildNumberOptions = (correct, diff) => {
  const distractorSet = new Set();
  const offsets = [
    diff ? diff : 2,
    diff ? -diff : -2,
    1,
    -1,
    2,
    -2,
    3,
    -3,
    5,
    -5
  ];

  const shuffledOffsets = shuffle(offsets);
  for (const offset of shuffledOffsets) {
    const d = correct + offset;
    if (d !== correct && d >= 0) {
      distractorSet.add(d);
    }
    if (distractorSet.size >= 3) break;
  }

  // Fallbacks
  let fallback = 4;
  while (distractorSet.size < 3) {
    distractorSet.add(correct + fallback);
    fallback++;
  }

  const distractors = Array.from(distractorSet).slice(0, 3);
  const allValues = shuffle([correct, ...distractors]);
  const ids = ["a", "b", "c", "d"];

  return allValues.map((val, i) => ({
    id: ids[i],
    text: String(val)
  }));
};

// Helper to build options for text/characters/emojis
const buildTextOptions = (correct, allPossible) => {
  const distractors = shuffle(allPossible.filter((item) => String(item) !== String(correct))).slice(0, 3);
  const allValues = shuffle([correct, ...distractors]);
  const ids = ["a", "b", "c", "d"];

  return allValues.map((val, i) => ({
    id: ids[i],
    text: String(val)
  }));
};

// Helper to build options for grids
const buildGridOptions = (correctGrid) => {
  // A grid is represented as [1, 0, 0, 0], [0, 1, 0, 0], etc.
  // There are only 4 possible single-dot 2x2 grid configurations:
  const allPossible = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
  
  // We want to make sure correctGrid is in the array, and map to options.
  const ids = ["a", "b", "c", "d"];
  
  // We can just shuffle the 4 possibilities
  const shuffledGrids = shuffle(allPossible);
  
  // Find which index contains the correct grid, or ensure it's in the list
  // Actually, they are unique, so shuffledGrids has exactly the 4 states.
  return shuffledGrids.map((grid, i) => ({
    id: ids[i],
    grid: grid,
    text: grid.join("-") // Fallback string representation
  }));
};

// ─── Generators ─────────────────────────────────────────────────────────────

// 1. Number Patterns
const generateNumberArithmetic = () => {
  const start = randInt(1, 20);
  const diff = randInt(2, 10) * (Math.random() < 0.3 ? -1 : 1);
  const terms = [];
  
  for (let i = 0; i < 5; i++) {
    const val = start + diff * i;
    terms.push(val);
  }

  // Ensure positive values
  if (terms.some(v => v < 0)) {
    return generateNumberArithmetic();
  }

  const answer = terms[4];
  const sequence = [...terms.slice(0, -1), "?"];

  return {
    sequence,
    answer: String(answer),
    options: buildNumberOptions(answer, diff),
    rule: diff > 0 ? `Add +${diff} every time.` : `Subtract ${Math.abs(diff)} every time.`,
    explanation: `The sequence follows an arithmetic pattern where we ${diff > 0 ? `add ${diff}` : `subtract ${Math.abs(diff)}`} to get the next term: ${terms.slice(0, -1).join(" -> ")} -> ${answer}.`,
    layoutType: "text"
  };
};

const generateNumberGeometric = () => {
  const start = randInt(1, 5);
  const mult = pick([2, 3, 5]);
  const terms = [];
  
  for (let i = 0; i < 5; i++) {
    terms.push(start * Math.pow(mult, i));
  }

  const answer = terms[4];
  const sequence = [...terms.slice(0, -1), "?"];

  return {
    sequence,
    answer: String(answer),
    options: buildNumberOptions(answer, mult),
    rule: `Multiply by ${mult} every time.`,
    explanation: `Each number in the sequence is multiplied by ${mult} to get the next term: ${terms.slice(0, -1).join(" -> ")} -> ${answer}.`,
    layoutType: "text"
  };
};

const generateNumberSquaresCubes = (type) => {
  const start = randInt(1, 5);
  const terms = [];
  const isCube = type === "cube" || (type === "random" && Math.random() < 0.4);

  for (let i = 0; i < 5; i++) {
    const n = start + i;
    terms.push(isCube ? n * n * n : n * n);
  }

  const answer = terms[4];
  const sequence = [...terms.slice(0, -1), "?"];

  return {
    sequence,
    answer: String(answer),
    options: buildNumberOptions(answer, isCube ? 9 : 5),
    rule: isCube ? "Sequence of consecutive cube numbers." : "Sequence of consecutive square numbers.",
    explanation: isCube 
      ? `Each term is the cube (n³) of consecutive integers starting from ${start}: ${start}³=${terms[0]}, ${start+1}³=${terms[1]}... The next is ${start+4}³ = ${answer}.`
      : `Each term is the square (n²) of consecutive integers starting from ${start}: ${start}²=${terms[0]}, ${start+1}²=${terms[1]}... The next is ${start+4}² = ${answer}.`,
    layoutType: "text"
  };
};

const generateNumberAlternating = () => {
  const startA = randInt(1, 10);
  const startB = randInt(10, 20);
  const diffA = randInt(2, 4);
  const diffB = -randInt(1, 3);
  
  const terms = [];
  for (let i = 0; i < 7; i++) {
    if (i % 2 === 0) {
      terms.push(startA + diffA * Math.floor(i / 2));
    } else {
      terms.push(startB + diffB * Math.floor(i / 2));
    }
  }

  const answer = terms[6];
  const sequence = [...terms.slice(0, -1), "?"];

  return {
    sequence,
    answer: String(answer),
    options: buildNumberOptions(answer, diffA),
    rule: `Two alternating sequences: odd terms add +${diffA}, even terms add ${diffB}.`,
    explanation: `This is an alternating sequence. The odd elements (1st, 3rd, 5th) increase by ${diffA} (${terms[0]} -> ${terms[2]} -> ${terms[4]}), and the even elements (2nd, 4th, 6th) decrease by ${Math.abs(diffB)} (${terms[1]} -> ${terms[3]} -> ${terms[5]}). The next term is ${terms[4]} + ${diffA} = ${answer}.`,
    layoutType: "text"
  };
};

const generateNumberMixed = () => {
  const start = randInt(1, 6);
  const mult = 2;
  const offset = pick([1, -1, 2, -2]);
  
  const terms = [start];
  for (let i = 1; i < 5; i++) {
    terms.push(terms[i-1] * mult + offset);
  }

  const answer = terms[4];
  const sequence = [...terms.slice(0, -1), "?"];

  return {
    sequence,
    answer: String(answer),
    options: buildNumberOptions(answer, 3),
    rule: `Multiply by ${mult} and add/subtract ${Math.abs(offset)} at each step.`,
    explanation: `Each number is multiplied by ${mult} and then we add ${offset} to get the next: ${terms.slice(0, -1).join(" -> ")} -> ${answer}.`,
    layoutType: "text"
  };
};

// 2. Shape Patterns
const generateShapePattern = (isAlternateOnly = false) => {
  const shapes = ["🔺", "🔴", "⬜", "⬛", "🔷", "🔶", "🟢", "🟡"];
  const selectedShapes = shuffle(shapes).slice(0, isAlternateOnly ? 2 : pick([2, 3]));
  const cycleLen = selectedShapes.length;
  
  const terms = [];
  for (let i = 0; i < 6; i++) {
    terms.push(selectedShapes[i % cycleLen]);
  }

  const answer = terms[5];
  const sequence = [...terms.slice(0, -1), "?"];

  return {
    sequence,
    answer: String(answer),
    options: buildTextOptions(answer, shapes),
    rule: cycleLen === 2 
      ? `Alternate between ${selectedShapes[0]} and ${selectedShapes[1]}.`
      : `Repeating cycle of ${cycleLen} shapes: ${selectedShapes.join(" -> ")}.`,
    explanation: `The shapes repeat in a cycle of length ${cycleLen}: ${selectedShapes.join(" -> ")}. Following this sequence, the next element is ${answer}.`,
    layoutType: "shape"
  };
};

// 3. Symbol Patterns
const generateSymbolPattern = () => {
  const symPiles = [
    ["★", "☆"],
    ["▲", "▼"],
    ["☀️", "🌙", "☁️"],
    ["🍎", "🍌"],
    ["🍕", "🍔", "🍟"]
  ];
  
  const selectedPile = pick(symPiles);
  const cycleLen = selectedPile.length;
  
  const terms = [];
  for (let i = 0; i < 6; i++) {
    terms.push(selectedPile[i % cycleLen]);
  }

  const answer = terms[5];
  const sequence = [...terms.slice(0, -1), "?"];

  return {
    sequence,
    answer: String(answer),
    options: buildTextOptions(answer, selectedPile.concat(["✨", "🎈", "🔑"])),
    rule: `Repeating cycle of symbols: ${selectedPile.join(" -> ")}.`,
    explanation: `The symbols repeat in a repeating cycle: ${selectedPile.join(" -> ")}. The next symbol is ${answer}.`,
    layoutType: "symbol"
  };
};

// 4. Position Patterns
const generatePositionRotation = () => {
  const arrowsClockwise = ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️"];
  const isClockwise = Math.random() < 0.5;
  const isStep2 = Math.random() < 0.5; // rotate by 45 deg vs 90 deg
  
  const step = (isClockwise ? 1 : -1) * (isStep2 ? 2 : 1);
  const startIdx = randInt(0, 7);
  
  const terms = [];
  for (let i = 0; i < 5; i++) {
    // Wrap around index
    let idx = (startIdx + i * step) % 8;
    if (idx < 0) idx += 8;
    terms.push(arrowsClockwise[idx]);
  }

  const answer = terms[4];
  const sequence = [...terms.slice(0, -1), "?"];

  const deg = isStep2 ? "90°" : "45°";
  const dir = isClockwise ? "clockwise" : "counter-clockwise";

  return {
    sequence,
    answer: String(answer),
    options: buildTextOptions(answer, arrowsClockwise),
    rule: `Rotate the arrow ${deg} ${dir} at each step.`,
    explanation: `The arrow rotates ${dir} by ${deg} at each step: ${terms.slice(0, -1).join(" -> ")} -> ${answer}.`,
    layoutType: "symbol"
  };
};

const generatePositionGrid = () => {
  // A grid represented as a 4-element array:
  // [0: Top-Left, 1: Top-Right, 2: Bottom-Left, 3: Bottom-Right]
  // Clockwise order of indices: 0 -> 1 -> 3 -> 2 -> 0
  const cwPath = [0, 1, 3, 2];
  const isClockwise = Math.random() < 0.5;
  const path = isClockwise ? cwPath : [...cwPath].reverse();
  
  const startIdx = randInt(0, 3);
  const terms = [];
  
  for (let i = 0; i < 5; i++) {
    const idx = path[(startIdx + i) % 4];
    const grid = [0, 0, 0, 0];
    grid[idx] = 1; // place dot
    terms.push(grid);
  }

  const answer = terms[4];
  const sequence = [...terms.slice(0, -1), "?"];
  
  const gridOptions = buildGridOptions(answer);
  const dirText = isClockwise ? "clockwise" : "counter-clockwise";

  // Find quadrant name for the correct answer
  const correctIdx = answer.indexOf(1);
  const quadrantNames = ["Top Left", "Top Right", "Bottom Left", "Bottom Right"];
  const correctName = quadrantNames[correctIdx];

  return {
    sequence,
    answer: correctName, // Standardized string for validation
    correctGrid: answer, // Save correct grid state for grid rendering
    options: gridOptions,
    rule: `Dot moves ${dirText} around the grid corners.`,
    explanation: `The red dot moves ${dirText} around the corners of the 2x2 grid. In the next step, it occupies the ${correctName} corner.`,
    layoutType: "grid"
  };
};

// 5. Logic Sequences
const generateLogicIncrement = () => {
  const start = randInt(1, 10);
  const terms = [start];
  
  for (let i = 1; i < 5; i++) {
    terms.push(terms[i-1] + i); // difference is +1, +2, +3, +4
  }

  const answer = terms[4];
  const sequence = [...terms.slice(0, -1), "?"];

  return {
    sequence,
    answer: String(answer),
    options: buildNumberOptions(answer, 4),
    rule: `Increment the added difference by +1 at each step (+1, +2, +3, +4...).`,
    explanation: `The difference between numbers increases by 1 each time: ${terms[0]} (+1) -> ${terms[1]} (+2) -> ${terms[2]} (+3) -> ${terms[3]} (+4) -> ${answer}.`,
    layoutType: "text"
  };
};

const generateLogicAlphabet = (type) => {
  const isIncrement = type === "increment";
  const isBackward = type === "backward";
  
  let terms = [];
  let ruleText = "";
  let explanationText = "";
  
  if (isIncrement) {
    // A, B, D, G, ? (+1, +2, +3, +4)
    const startOffset = randInt(0, 8); // Start between A and I
    let curIdx = startOffset;
    for (let i = 0; i < 5; i++) {
      curIdx = (curIdx + i) % 26;
      terms.push(ALPHABET[curIdx]);
    }
    ruleText = "Increment the alphabetical jump by +1 at each step (+1, +2, +3, +4...).";
    explanationText = `The alphabetical jump increases by 1 each time: ${terms[0]} (+1) -> ${terms[1]} (+2) -> ${terms[2]} (+3) -> ${terms[3]} (+4) -> ${terms[4]}.`;
  } else if (isBackward) {
    // Z, X, V, T, ? (-2)
    const step = randInt(1, 3);
    const startOffset = randInt(15, 25); // Start at high end
    for (let i = 0; i < 5; i++) {
      let idx = startOffset - i * step;
      if (idx < 0) idx = 0;
      terms.push(ALPHABET[idx]);
    }
    ruleText = `Step backward in the alphabet by ${step} letters at each step.`;
    explanationText = `We count backward in the alphabet by ${step} letters: ${terms.slice(0, -1).join(" -> ")} -> ${terms[4]}.`;
  } else {
    // A, C, E, G, ? (+2)
    const step = randInt(2, 4);
    const startOffset = randInt(0, 10);
    for (let i = 0; i < 5; i++) {
      terms.push(ALPHABET[startOffset + i * step]);
    }
    ruleText = `Step forward in the alphabet by ${step} letters at each step.`;
    explanationText = `We step forward in the alphabet by ${step} letters at each step: ${terms.slice(0, -1).join(" -> ")} -> ${terms[4]}.`;
  }

  const answer = terms[4];
  const sequence = [...terms.slice(0, -1), "?"];

  return {
    sequence,
    answer: String(answer),
    options: buildTextOptions(answer, ALPHABET),
    rule: ruleText,
    explanation: explanationText,
    layoutType: "text"
  };
};

// ─── Main Generator API ──────────────────────────────────────────────────────

/**
 * Generates a dynamic sequence question for the Pattern Detection puzzle
 * based on selected difficulty.
 *
 * @param {"Easy" | "Medium" | "Hard"} difficulty
 * @returns {{
 *   sequence: Array,
 *   answer: string,
 *   correctGrid?: number[],
 *   options: Array<{ id: string, text: string, grid?: number[] }>,
 *   rule: string,
 *   explanation: string,
 *   layoutType: "text" | "shape" | "symbol" | "grid",
 *   category: string
 * }}
 */
export const generatePatternQuestion = (difficulty = "Medium") => {
  const diff = String(difficulty).toLowerCase();
  
  if (diff === "easy") {
    // Easy: Arithmetic, Shape alternate, Symbol alternate, Alphabet simple skip
    const choice = pick(["arithmetic", "shape", "symbol", "alphabet-simple"]);
    switch (choice) {
      case "arithmetic":
        return { ...generateNumberArithmetic(), category: "Number Pattern" };
      case "shape":
        return { ...generateShapePattern(true), category: "Shape Pattern" };
      case "symbol":
        return { ...generateSymbolPattern(), category: "Symbol Pattern" };
      case "alphabet-simple":
        return { ...generateLogicAlphabet("simple"), category: "Logic Sequence" };
    }
  } else if (diff === "hard") {
    // Hard: Squares/Cubes, Alternating numbers, Mixed numbers, Position Grid (fast), Alphabet complex increments
    const choice = pick(["squares-cubes", "alternating", "mixed", "grid", "alphabet-increment"]);
    switch (choice) {
      case "squares-cubes":
        return { ...generateNumberSquaresCubes("random"), category: "Number Pattern" };
      case "alternating":
        return { ...generateNumberAlternating(), category: "Number Pattern" };
      case "mixed":
        return { ...generateNumberMixed(), category: "Number Pattern" };
      case "grid":
        return { ...generatePositionGrid(), category: "Position Pattern" };
      case "alphabet-increment":
        return { ...generateLogicAlphabet("increment"), category: "Logic Sequence" };
    }
  } else {
    // Medium (Default): Geometric, Alternate numbers, Cycle shapes, Position arrows, Logic Increments, Alphabet backward
    const choice = pick(["geometric", "alternating", "shape-cycle", "arrows", "logic-increment", "alphabet-backward"]);
    switch (choice) {
      case "geometric":
        return { ...generateNumberGeometric(), category: "Number Pattern" };
      case "alternating":
        return { ...generateNumberAlternating(), category: "Number Pattern" };
      case "shape-cycle":
        return { ...generateShapePattern(false), category: "Shape Pattern" };
      case "arrows":
        return { ...generatePositionRotation(), category: "Position Pattern" };
      case "logic-increment":
        return { ...generateLogicIncrement(), category: "Logic Sequence" };
      case "alphabet-backward":
        return { ...generateLogicAlphabet("backward"), category: "Logic Sequence" };
    }
  }

  // Fallback
  return { ...generateNumberArithmetic(), category: "Number Pattern" };
};
