export const puzzles = [
  {
    id: 1,
    title: "Mini Queens Challenge",
    displayName: "Mini Queens Challenge",
    difficulty: "Hard",
    type: "mini-queens",
    category: "logic",
    description: "Place one queen in each row without any queen attacking another queen.",
    estimatedTime: "3 minutes",
    question: "Place 4 queens so none of them attack each other.",
    size: 4,
    solution: [
      [0, 1, 0, 0],
      [0, 0, 0, 1],
      [1, 0, 0, 0],
      [0, 0, 1, 0]
    ],
    rules: ["One queen per row", "One queen per column", "No queens on the same diagonal"],
    explanation: "A queen attacks in the same row, same column, and diagonally. This solution places exactly one queen in every row and column, with no diagonal attacks."
  },
  {
    id: 3,
    title: "Pattern Detection",
    displayName: "Pattern Detection",
    difficulty: "Easy",
    type: "pattern-detection",
    category: "logic",
    description: "Train pattern recognition, sequence detection, and logical thinking.",
    estimatedTime: "2 minutes",
    question: "Complete the sequence by finding the next element."
  },
  {
    id: 16,
    title: "Elimination Grid Challenge",
    displayName: "Elimination Grid Challenge",
    difficulty: "Medium",
    type: "elimination-grid",
    category: "logic",
    description: "Develop deductive reasoning and logical thinking by solving elimination grid clues.",
    estimatedTime: "3 minutes",
    question: "Analyze the clues and eliminate possibilities to deduce the correct match."
  },
  {
    id: 17,
    title: "Number Logic Matrix",
    displayName: "Number Logic Matrix",
    difficulty: "Medium",
    type: "number-matrix",
    category: "logic",
    description: "Identify patterns and mathematical logic inside number matrices to find the missing cell.",
    estimatedTime: "3 minutes",
    question: "Find the missing number in the matrix pattern."
  },
  {
    id: 18,
    title: "Code Breaker Challenge",
    displayName: "Code Breaker Challenge",
    difficulty: "Medium",
    type: "code-breaker",
    category: "logic",
    description: "Discover hidden rule encodings and apply them to decode target word codes.",
    estimatedTime: "3 minutes",
    question: "Crack the secret code based on the examples."
  },
  {
    id: 19,
    title: "Mystery Word Detective",
    displayName: "Mystery Word Detective",
    difficulty: "Medium",
    type: "word-detective",
    category: "logic",
    description: "Crack the mystery word using deductive reasoning and step-by-step clues.",
    estimatedTime: "3 minutes",
    question: "Deduce the mystery word from the clues provided."
  },
  {
    id: 20,
    title: "Word Ladder Challenge",
    displayName: "Word Ladder Challenge",
    difficulty: "Medium",
    type: "word-ladder",
    category: "logic",
    description: "Transform one word into another by changing one letter at a time.",
    estimatedTime: "3 minutes",
    question: "Fill in the missing words to complete the word ladder."
  },

  // ── Brain Training & Cognitive Skills Puzzles ──
  {
    id: 6,
    title: "Math Reflex Arena",
    displayName: "Math Reflex Arena",
    difficulty: "Medium",
    type: "math-reflex",
    category: "brain",
    description: "Race against the clock solving rapid-fire math challenges to sharpen your mental calculation speed.",
    estimatedTime: "1 minute",
    icon: "⚡",
    route: "/brain/math-reflex",
    skills: ["Calculation Speed", "Accuracy", "Mental Math"]
  },
  {
    id: 8,
    title: "Rule Discovery Challenge",
    displayName: "Rule Discovery Challenge",
    difficulty: "Medium",
    type: "rule-discovery",
    category: "brain",
    description: "Discover hidden rules and patterns in sequences to predict what comes next.",
    estimatedTime: "3 minutes",
    icon: "🔍",
    route: "/brain/rule-discovery",
    skills: ["Pattern Recognition", "Analytical Thinking", "Reasoning"]
  },
  {
    id: 9,
    title: "Memory Flash Challenge",
    displayName: "Memory Flash Challenge",
    difficulty: "Medium",
    type: "memory-flash",
    category: "brain",
    description: "Memorize flashing patterns of shapes, colors, and numbers — then recreate them from memory.",
    estimatedTime: "2 minutes",
    icon: "🧠",
    route: "/brain/memory-flash",
    skills: ["Memory", "Attention", "Recall Speed"]
  },
  {
    id: 10,
    title: "Focus Filter Challenge",
    displayName: "Focus Filter Challenge",
    difficulty: "Medium",
    type: "focus-filter",
    category: "brain",
    description: "Train your selective attention and concentration by filtering out target objects from active distractors.",
    estimatedTime: "2 minutes",
    icon: "👁️",
    route: "/brain/focus-filter",
    skills: ["Attention", "Focus"]
  },
  {
    id: 11,
    title: "Stroop Challenge",
    displayName: "Stroop Challenge",
    difficulty: "Medium",
    type: "stroop",
    category: "brain",
    description: "Overcome color-word interference and boost your cognitive control by matching target ink colors.",
    estimatedTime: "2 minutes",
    icon: "🎨",
    route: "/brain/stroop",
    skills: ["Cognitive Control", "Focus"]
  },
  {
    id: 12,
    title: "Visual Attention Radar",
    displayName: "Visual Attention Radar",
    difficulty: "Medium",
    type: "visual-radar",
    category: "brain",
    description: "Scan the active radar screen, remember the objects, and answer fast-paced recall questions.",
    estimatedTime: "2 minutes",
    icon: "📡",
    route: "/brain/visual-radar",
    skills: ["Observation", "Visual Attention", "Short-Term Memory"]
  },
  {
    id: 13,
    title: "Shape Rotation Challenge",
    displayName: "Shape Rotation Challenge",
    difficulty: "Medium",
    type: "shape-rotation",
    category: "brain",
    description: "Measure mental rotation and spatial reasoning by identifying the correct rotated shape.",
    estimatedTime: "2 minutes",
    icon: "🔄",
    route: "/brain/shape-rotation",
    skills: ["Mental Rotation", "Spatial Reasoning"]
  },
  {
    id: 14,
    title: "Direction Navigator Challenge",
    displayName: "Direction Navigator Challenge",
    difficulty: "Medium",
    type: "direction-navigator",
    category: "brain",
    description: "Measure spatial orientation and direction sense by tracking paths on a compass grid.",
    estimatedTime: "2 minutes",
    icon: "🧭",
    route: "/brain/direction-navigator",
    skills: ["Direction Sense", "Spatial Orientation"]
  },
  {
    id: 15,
    title: "Mirror & Rotation Detective",
    displayName: "Mirror & Rotation Detective",
    difficulty: "Medium",
    type: "mirror-detective",
    category: "brain",
    description: "Measure object orientation and visual transformation through mirrors and rotations.",
    estimatedTime: "2 minutes",
    icon: "🪞",
    route: "/brain/mirror-detective",
    skills: ["Visual Processing", "Object Orientation"]
  }
];

export function getPuzzleById(id) {
  return puzzles.find((puzzle) => puzzle.id === Number(id));
}

/**
 * Returns all puzzles belonging to the specified category.
 * @param {"logic"|"brain"} category
 */
export function getPuzzlesByCategory(category) {
  return puzzles.filter((puzzle) => puzzle.category === category);
}

