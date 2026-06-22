/**
 * @file logicDetectiveGenerator.js
 * @description Dynamic logic grid puzzle generator for Class Saathi Brain Training.
 *              Creates unique detective-style "who has what?" puzzles with
 *              procedurally generated characters, attributes, clues, and solutions.
 */

// ─── Data Pools ────────────────────────────────────────────────────────────────

/** Pool of character names (Indian-themed) */
const NAME_POOL = [
  'Aarav', 'Priya', 'Rohan', 'Sneha', 'Kabir', 'Diya',
  'Arjun', 'Ananya', 'Vivek', 'Meera', 'Raj', 'Neha',
];

/** Attribute category pools — each has ≥ 6 items for variety */
const ATTRIBUTE_POOLS = {
  Pets:   ['Dog', 'Cat', 'Fish', 'Rabbit', 'Parrot', 'Hamster'],
  Colors: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'],
  Sports: ['Cricket', 'Football', 'Tennis', 'Basketball', 'Swimming', 'Badminton'],
  Fruits: ['Apple', 'Mango', 'Banana', 'Grapes', 'Orange', 'Watermelon'],
};

/** Preposition / verb for each category (used when generating natural-language clues) */
const CATEGORY_VERBS = {
  Pets:   { has: 'has a', doesNot: 'does not have a', with: 'with the' },
  Colors: { has: 'likes', doesNot: 'does not like', with: 'who likes' },
  Sports: { has: 'plays', doesNot: 'does not play', with: 'who plays' },
  Fruits: { has: 'loves', doesNot: 'does not love', with: 'who loves' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Shuffle an array (Fisher-Yates) — returns a NEW shuffled copy.
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

/**
 * Pick n random unique elements from an array.
 * @template T
 * @param {T[]} arr
 * @param {number} n
 * @returns {T[]}
 */
const pickN = (arr, n) => shuffle(arr).slice(0, n);

/**
 * Pick one random element from an array.
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generate a random integer between min and max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Solution Builder ──────────────────────────────────────────────────────────

/**
 * Build a random solution by assigning attributes to characters.
 * @param {string[]} characters  — e.g. ['Aarav', 'Priya', 'Rohan']
 * @param {{ name: string, items: string[] }[]} categories
 * @returns {Object<string, Object<string, string>>}
 *   e.g. { Aarav: { Pets: 'Dog' }, Priya: { Pets: 'Cat' }, Rohan: { Pets: 'Fish' } }
 */
const buildSolution = (characters, categories) => {
  const solution = {};
  characters.forEach((char) => {
    solution[char] = {};
  });

  categories.forEach((cat) => {
    // Randomly assign exactly one unique item per character
    const shuffledItems = shuffle(cat.items).slice(0, characters.length);
    characters.forEach((char, idx) => {
      solution[char][cat.name] = shuffledItems[idx];
    });
  });

  return solution;
};

// ─── Clue Generator ────────────────────────────────────────────────────────────

/**
 * @typedef {'direct' | 'negative' | 'comparative' | 'position'} ClueType
 */

/**
 * Generate a direct clue: "Aarav has a Dog"
 * @param {string} character
 * @param {string} categoryName
 * @param {string} value
 * @returns {string}
 */
const makeDirectClue = (character, categoryName, value) => {
  const verb = CATEGORY_VERBS[categoryName]?.has || 'has';
  return `${character} ${verb} ${value}`;
};

/**
 * Generate a negative clue: "Priya does not play Cricket"
 * Picks a value that the character does NOT have.
 * @param {string} character
 * @param {string} categoryName
 * @param {string} actualValue
 * @param {string[]} allItems - All items in this category (already sliced to grid size)
 * @returns {string}
 */
const makeNegativeClue = (character, categoryName, actualValue, allItems) => {
  const others = allItems.filter((item) => item !== actualValue);
  const wrongValue = pick(others);
  const verb = CATEGORY_VERBS[categoryName]?.doesNot || 'does not have';
  return `${character} ${verb} ${wrongValue}`;
};

/**
 * Generate a comparative / linking clue:
 * "The person with the Cat plays Football"
 * Links two categories via the same character.
 * @param {Object<string, Object<string, string>>} solution
 * @param {string} character
 * @param {string} catA - First category name
 * @param {string} catB - Second category name
 * @returns {string}
 */
const makeComparativeClue = (solution, character, catA, catB) => {
  const valA = solution[character][catA];
  const valB = solution[character][catB];
  const withPhrase = CATEGORY_VERBS[catA]?.with || 'with';
  const hasPhrase = CATEGORY_VERBS[catB]?.has || 'has';
  return `The person ${withPhrase} ${valA} ${hasPhrase} ${valB}`;
};

/**
 * Generate a position / elimination clue:
 * "Sneha's favorite color is not Red"
 * (Uses a value that the character does NOT have.)
 * @param {string} character
 * @param {string} categoryName
 * @param {string} actualValue
 * @param {string[]} allItems
 * @returns {string}
 */
const makePositionClue = (character, categoryName, actualValue, allItems) => {
  const others = allItems.filter((item) => item !== actualValue);
  const wrongValue = pick(others);

  // Build a natural phrasing per category
  switch (categoryName) {
    case 'Colors':
      return `${character}'s favorite color is not ${wrongValue}`;
    case 'Pets':
      return `${character}'s pet is not a ${wrongValue}`;
    case 'Sports':
      return `${character} does not play ${wrongValue}`;
    case 'Fruits':
      return `${character}'s favorite fruit is not ${wrongValue}`;
    default:
      return `${character}'s ${categoryName.toLowerCase()} is not ${wrongValue}`;
  }
};

/**
 * Generate a full set of clues from the solution.
 * Guarantees solvability by including at least one direct or linking clue per
 * attribute assignment, then fills remaining slots with negative / position clues.
 *
 * @param {Object<string, Object<string, string>>} solution
 * @param {string[]} characters
 * @param {{ name: string, items: string[] }[]} categories
 * @param {number} targetClueCount
 * @returns {string[]}
 */
const generateClues = (solution, characters, categories, targetClueCount) => {
  const clues = [];
  const usedClues = new Set();

  /**
   * Add a clue if not already present.
   * @param {string} clue
   */
  const addClue = (clue) => {
    if (!usedClues.has(clue)) {
      usedClues.add(clue);
      clues.push(clue);
    }
  };

  // ── Phase 1: Ensure solvability ──
  // For single-category puzzles: add one direct clue per character
  // For multi-category: mix of direct + comparative clues
  if (categories.length === 1) {
    const cat = categories[0];
    // Give direct clues for N-1 characters (last one is deducible)
    const shuffledChars = shuffle(characters);
    shuffledChars.slice(0, characters.length - 1).forEach((char) => {
      addClue(makeDirectClue(char, cat.name, solution[char][cat.name]));
    });
  } else {
    // Multi-category: direct clues for first category, comparative for links
    const [catA, catB] = categories;
    const shuffledChars = shuffle(characters);

    // Direct clues for at least N-1 characters on catA
    shuffledChars.slice(0, characters.length - 1).forEach((char) => {
      addClue(makeDirectClue(char, catA.name, solution[char][catA.name]));
    });

    // Comparative clues linking catA → catB for at least N-1 characters
    shuffle(characters)
      .slice(0, characters.length - 1)
      .forEach((char) => {
        addClue(makeComparativeClue(solution, char, catA.name, catB.name));
      });
  }

  // ── Phase 2: Fill remaining slots with variety clues ──
  let attempts = 0;
  while (clues.length < targetClueCount && attempts < 100) {
    attempts++;
    const char = pick(characters);
    const cat = pick(categories);
    const actualValue = solution[char][cat.name];
    const clueType = pick(['negative', 'position', 'direct', 'negative']);

    let clue;
    switch (clueType) {
      case 'negative':
        clue = makeNegativeClue(char, cat.name, actualValue, cat.items);
        break;
      case 'position':
        clue = makePositionClue(char, cat.name, actualValue, cat.items);
        break;
      case 'direct':
        clue = makeDirectClue(char, cat.name, actualValue);
        break;
      default:
        clue = makeNegativeClue(char, cat.name, actualValue, cat.items);
    }

    addClue(clue);
  }

  return shuffle(clues);
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a complete logic grid mystery puzzle.
 *
 * @param {'easy' | 'medium' | 'hard'} difficulty
 * @returns {{
 *   characters: string[],
 *   categories: { name: string, items: string[] }[],
 *   clues: string[],
 *   solution: Object<string, Object<string, string>>,
 *   gridSize: number
 * }}
 *
 * @example
 *   generateLogicMystery('easy')
 *   // → {
 *   //   characters: ['Aarav', 'Priya', 'Rohan'],
 *   //   categories: [{ name: 'Pets', items: ['Dog', 'Cat', 'Fish'] }],
 *   //   clues: ['Aarav has a Dog', 'Priya does not have a Fish', ...],
 *   //   solution: { Aarav: { Pets: 'Dog' }, Priya: { Pets: 'Cat' }, Rohan: { Pets: 'Fish' } },
 *   //   gridSize: 3
 *   // }
 */
export const generateLogicMystery = (difficulty = 'easy') => {
  // Determine puzzle dimensions based on difficulty
  let numCharacters, numCategories, clueRange;

  switch (difficulty) {
    case 'easy':
      numCharacters = 3;
      numCategories = 1;
      clueRange = [3, 4];
      break;
    case 'medium':
      numCharacters = 3;
      numCategories = 2;
      clueRange = [5, 6];
      break;
    case 'hard':
      numCharacters = 4;
      numCategories = 2;
      clueRange = [6, 8];
      break;
    default:
      numCharacters = 3;
      numCategories = 1;
      clueRange = [3, 4];
  }

  // 1. Pick random characters
  const characters = pickN(NAME_POOL, numCharacters);

  // 2. Pick random attribute categories and slice items to grid size
  const categoryKeys = pickN(Object.keys(ATTRIBUTE_POOLS), numCategories);
  const categories = categoryKeys.map((key) => ({
    name: key,
    items: shuffle(ATTRIBUTE_POOLS[key]).slice(0, numCharacters),
  }));

  // 3. Build the solution
  const solution = buildSolution(characters, categories);

  // 4. Generate clues
  const targetClueCount = randInt(clueRange[0], clueRange[1]);
  const clues = generateClues(solution, characters, categories, targetClueCount);

  return {
    characters,
    categories,
    clues,
    solution,
    gridSize: numCharacters,
  };
};
