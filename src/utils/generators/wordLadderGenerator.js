/**
 * @file wordLadderGenerator.js
 * @description Dynamic word ladder generator for Word Ladder Challenge.
 */

const LADDERS = [
  // ─── EASY LADDERS (3-letter or 4-letter, 3 words total: 1 slot) ──────────
  {
    difficulty: "Easy",
    wordLength: 3,
    path: ["CAT", "COT", "DOT"]
  },
  {
    difficulty: "Easy",
    wordLength: 3,
    path: ["DOG", "LOG", "LEG"]
  },
  {
    difficulty: "Easy",
    wordLength: 3,
    path: ["MAN", "RAN", "RUN"]
  },
  {
    difficulty: "Easy",
    wordLength: 3,
    path: ["HEN", "PEN", "PIN"]
  },
  {
    difficulty: "Easy",
    wordLength: 3,
    path: ["BOY", "TOY", "TOO"]
  },
  {
    difficulty: "Easy",
    wordLength: 3,
    path: ["ICE", "ACE", "ACT"]
  },
  {
    difficulty: "Easy",
    wordLength: 3,
    path: ["WET", "NET", "NOT"]
  },
  {
    difficulty: "Easy",
    wordLength: 4,
    path: ["COLD", "CORD", "CARD"]
  },
  {
    difficulty: "Easy",
    wordLength: 4,
    path: ["EAST", "PAST", "PEST"]
  },
  {
    difficulty: "Easy",
    wordLength: 4,
    path: ["FIRE", "FINE", "LINE"]
  },
  {
    difficulty: "Easy",
    wordLength: 4,
    path: ["WORK", "WORD", "WARD"]
  },
  {
    difficulty: "Easy",
    wordLength: 4,
    path: ["TALL", "TOLL", "TOOL"]
  },

  // ─── MEDIUM LADDERS (3-letter or 4-letter, 4 words total: 2 slots) ───────
  {
    difficulty: "Medium",
    wordLength: 3,
    path: ["CAT", "COT", "COG", "DOG"]
  },
  {
    difficulty: "Medium",
    wordLength: 3,
    path: ["MAN", "RAN", "RUN", "SUN"]
  },
  {
    difficulty: "Medium",
    wordLength: 3,
    path: ["HEN", "PEN", "PIN", "TIN"]
  },
  {
    difficulty: "Medium",
    wordLength: 3,
    path: ["BOY", "TOY", "TON", "TEN"]
  },
  {
    difficulty: "Medium",
    wordLength: 3,
    path: ["FIT", "BIT", "BAT", "CAT"]
  },
  {
    difficulty: "Medium",
    wordLength: 3,
    path: ["SAD", "MAD", "MAP", "CAP"]
  },
  {
    difficulty: "Medium",
    wordLength: 3,
    path: ["WET", "NET", "NOT", "HOT"]
  },
  {
    difficulty: "Medium",
    wordLength: 4,
    path: ["COLD", "CORD", "CARD", "WARD"]
  },
  {
    difficulty: "Medium",
    wordLength: 4,
    path: ["EAST", "PAST", "PEST", "WEST"]
  },
  {
    difficulty: "Medium",
    wordLength: 4,
    path: ["BAKE", "CAKE", "CASE", "CAST"]
  },
  {
    difficulty: "Medium",
    wordLength: 4,
    path: ["WORK", "WORD", "WARD", "CARD"]
  },
  {
    difficulty: "Medium",
    wordLength: 4,
    path: ["TALL", "TOLL", "TOOL", "COOL"]
  },

  // ─── HARD LADDERS (4-letter or 5-letter, 5+ words total: 3+ slots) ───────
  {
    difficulty: "Hard",
    wordLength: 4,
    path: ["COLD", "CORD", "CARD", "WARD", "WARM"]
  },
  {
    difficulty: "Hard",
    wordLength: 4,
    path: ["FIRE", "FINE", "LINE", "LANE", "LAKE"]
  },
  {
    difficulty: "Hard",
    wordLength: 4,
    path: ["BAKE", "CAKE", "CASE", "CAST", "COST"]
  },
  {
    difficulty: "Hard",
    wordLength: 4,
    path: ["WORK", "WORD", "WARD", "CARD", "CARE"]
  },
  {
    difficulty: "Hard",
    wordLength: 4,
    path: ["DOOR", "POOR", "POUR", "SOUR", "SOUP"]
  },
  {
    difficulty: "Hard",
    wordLength: 4,
    path: ["TALL", "TOLL", "TOOL", "COOL", "COAL"]
  },
  {
    difficulty: "Hard",
    wordLength: 4,
    path: ["FISH", "FIST", "FAST", "PAST", "POST"]
  },
  {
    difficulty: "Hard",
    wordLength: 5,
    path: ["SMART", "START", "STATE", "STAGE", "STARE"]
  },
  {
    difficulty: "Hard",
    wordLength: 5,
    path: ["GREEN", "GREET", "GREAT", "TREAT", "TREAD"]
  },
  {
    difficulty: "Hard",
    wordLength: 5,
    path: ["CLOCK", "CLICK", "CHICK", "CHIPS", "SHIPS"]
  },
  {
    difficulty: "Hard",
    wordLength: 5,
    path: ["HOUSE", "MOUSE", "LOUSE", "LOOSE", "GOOSE"]
  },
  {
    difficulty: "Hard",
    wordLength: 5,
    path: ["SLEEP", "STEEP", "STEER", "SHEER", "SHEEP"]
  },
  {
    difficulty: "Hard",
    wordLength: 5,
    path: ["PLANT", "PLANE", "PLACE", "PLATE", "SLATE", "STATE", "STARE"]
  }
];

// Common word pools of different lengths to be used as distractors
const COMMON_WORDS_3 = [
  "CAT", "COT", "DOG", "LOG", "LEG", "MAN", "RAN", "RUN", "HEN", "PEN", "PIN", "TIN",
  "BOY", "TOY", "TOO", "ZOO", "FIT", "BIT", "BAT", "SAD", "MAD", "MAP", "CAP", "WET",
  "NET", "NOT", "HOT", "FLY", "FRY", "DRY", "CRY", "ICE", "ACE", "ACT", "ART", "PIG",
  "COW", "BUS", "CAR", "KEY", "SKY", "RED", "BIG", "BAD", "NEW", "OLD", "DAY", "GET",
  "LET", "USE", "TRY", "OUR", "BOX", "FOX", "JAM", "HAM", "MAP", "GAP", "TAP"
];

const COMMON_WORDS_4 = [
  "COLD", "CORD", "CARD", "WARD", "WARM", "EAST", "PAST", "PEST", "WEST", "LION", "LINE",
  "LATE", "GATE", "FIRE", "FINE", "LANE", "LAKE", "BAKE", "CAKE", "CASE", "CAST", "COST",
  "WORK", "WORD", "CARE", "DOOR", "POOR", "POUR", "SOUR", "SOUP", "TALL", "TOLL", "TOOL",
  "COOL", "COAL", "BLUE", "CLUE", "BLUR", "SLUR", "SPUR", "FISH", "FIST", "FAST", "POST",
  "STAR", "MOON", "SHIP", "BOAT", "ROAD", "WIND", "SAND", "LAND", "TIME", "DATE", "YEAR",
  "LIFE", "LOVE", "HOPE", "MIND", "GOLD", "HOLD", "FOLD", "SOLD", "BOLD", "TOLD"
];

const COMMON_WORDS_5 = [
  "SMART", "START", "STATE", "STAGE", "STARE", "GREEN", "GREET", "GREAT", "TREAT", "TREAD",
  "BRAIN", "GRAIN", "DRAIN", "TRAIN", "CLOCK", "CLICK", "CHICK", "CHIPS", "SHIPS", "HOUSE",
  "MOUSE", "LOUSE", "LOOSE", "GOOSE", "SLEEP", "STEEP", "STEER", "SHEER", "SHEEP", "PLANT",
  "PLANE", "PLACE", "PLATE", "SLATE", "SPACE", "PEACE", "WATER", "EARTH", "STONE", "STOVE",
  "SHARE", "WRITE", "WROTE", "ROUTE", "CRANE", "BRAND", "STAND", "GRAND", "TABLE", "CHAIR",
  "LIGHT", "NIGHT", "SOUND", "MUSIC", "WORLD", "YOUNG", "HEART", "PLAZA", "SHARK", "SNAKE"
];

// Helper to shuffle array in place
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Check if two words differ by exactly 1 letter
function isOneLetterDiff(wordA, wordB) {
  if (wordA.length !== wordB.length) return false;
  let diff = 0;
  for (let i = 0; i < wordA.length; i++) {
    if (wordA[i] !== wordB[i]) diff++;
  }
  return diff === 1;
}

/**
 * Generate 5 Word Ladder challenges for a session.
 * @param {"Easy"|"Medium"|"Hard"} difficulty
 */
export function generateWordLadders(difficulty = "Medium") {
  // Filter ladders matching difficulty
  const targetLadders = LADDERS.filter((l) => l.difficulty === difficulty);
  
  // Shuffle and pick 5 (or less if not enough, and duplicate if needed)
  let chosenLadders = shuffleArray(targetLadders);
  if (chosenLadders.length > 5) {
    chosenLadders = chosenLadders.slice(0, 5);
  } else {
    // Fill up to 5 by duplicating
    while (chosenLadders.length < 5) {
      chosenLadders.push(...shuffleArray(targetLadders));
    }
    chosenLadders = chosenLadders.slice(0, 5);
  }
  
  const challenges = chosenLadders.map((ladder, idx) => {
    const path = ladder.path;
    const len = path.length;
    const startWord = path[0];
    const endWord = path[len - 1];
    
    // Choose the distractor pool based on word length
    let pool = COMMON_WORDS_4;
    if (ladder.wordLength === 3) pool = COMMON_WORDS_3;
    if (ladder.wordLength === 5) pool = COMMON_WORDS_5;
    
    // Generate levels.
    // Level 0 is Start Word (filled).
    // Levels 1 to len-2 are empty slots.
    // Level len-1 is End Word (filled).
    const levels = path.map((correctWord, lIdx) => {
      const isStart = lIdx === 0;
      const isEnd = lIdx === len - 1;
      const isSlot = !isStart && !isEnd;
      
      if (!isSlot) {
        return {
          index: lIdx,
          word: correctWord,
          isSlot: false
        };
      }
      
      // For slots, we generate 4 options
      // 1 correct option: correctWord
      // 3 distractors
      const prevWord = path[lIdx - 1];
      
      // Filter out all words from the ladder path itself
      const safePool = pool.filter((w) => !path.includes(w));
      
      // Find words in safePool that are a 1-letter change from the previous word
      const similarDistractors = safePool.filter((w) => isOneLetterDiff(prevWord, w));
      
      // Pick up to 2 similar distractors to make the game smart and challenging
      let selectedDistractors = shuffleArray(similarDistractors).slice(0, 2);
      
      // Fill the remaining distractor slots with random words from safePool
      const remainingPool = safePool.filter((w) => !selectedDistractors.includes(w) && w !== correctWord);
      const randomDistractors = shuffleArray(remainingPool).slice(0, 3 - selectedDistractors.length);
      
      selectedDistractors = [...selectedDistractors, ...randomDistractors];
      
      // Build option cards
      const options = [
        { id: "correct", text: correctWord },
        ...selectedDistractors.map((d, dIdx) => ({ id: `dist-${dIdx}`, text: d }))
      ];
      
      const shuffledOptions = shuffleArray(options).map((opt, oIdx) => ({
        ...opt,
        id: `opt-${oIdx + 1}`
      }));
      
      return {
        index: lIdx,
        word: "", // Filled by user
        correctWord: correctWord,
        isSlot: true,
        options: shuffledOptions
      };
    });
    
    return {
      round: idx + 1,
      startWord,
      endWord,
      path,
      levels, // Includes start, slots, and end levels
      wordLength: ladder.wordLength,
      difficulty: ladder.difficulty
    };
  });
  
  return challenges;
}
