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
    rewardXp: 2,
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
    id: 2,
    title: "Color Balance Challenge",
    displayName: "Color Balance Challenge",
    difficulty: "Medium",
    type: "color-balance",
    category: "logic",
    description: "Fill the grid using Blue and Yellow colors.",
    estimatedTime: "3 minutes",
    rewardXp: 2,
    question: "Fill every cell so each row and column stays balanced.",
    size: 4,
    solution: [
      ["B", "B", "Y", "Y"],
      ["Y", "Y", "B", "B"],
      ["B", "Y", "B", "Y"],
      ["Y", "B", "Y", "B"]
    ],
    rules: [
      "Each row has 2 Blue and 2 Yellow cells",
      "Each column has 2 Blue and 2 Yellow cells",
      "No three same colors touch in a row or column"
    ],
    explanation: "Every row and column must contain two Blue and two Yellow cells. The completed grid also avoids three matching colors in a line."
  },
  {
    id: 3,
    title: "Pattern Detective",
    displayName: "Pattern Detective",
    difficulty: "Easy",
    type: "pattern-detective",
    category: "logic",
    description: "Find the missing pattern.",
    estimatedTime: "1 minute",
    rewardXp: 2,
    question: "Which option completes the pattern?",
    pattern: ["▲", "▲▲", "▲▲▲", "?"],
    options: [
      { id: "a", label: "A", text: "▲▲▲▲" },
      { id: "b", label: "B", text: "▲▲" },
      { id: "c", label: "C", text: "▲▲▲▲▲" },
      { id: "d", label: "D", text: "▲" }
    ],
    correctOptionId: "a",
    explanation: "The number of triangles increases by one in every step."
  },
  {
    id: 4,
    title: "Treasure Hunt Maze",
    displayName: "Treasure Hunt Maze",
    difficulty: "Medium",
    type: "treasure-maze",
    category: "logic",
    description: "Guide the explorer through the maze and reach the treasure chest.",
    estimatedTime: "2 minutes",
    rewardXp: 2,
    question: "Move the explorer to the treasure without crossing blocked cells.",
    size: 4,
    start: [0, 0],
    goal: [3, 3],
    obstacles: [
      [1, 1],
      [1, 2],
      [2, 2]
    ],
    rules: ["Reach the treasure chest", "Avoid obstacles", "Cannot move through blocked cells", "Track moves taken"],
    explanation: "The explorer must move around the blocked cells and land on the treasure chest. Arrow buttons and keyboard arrows both move one cell at a time."
  },
  {
    id: 5,
    title: "Space Fuel Mission",
    displayName: "Space Fuel Mission",
    difficulty: "Medium-Hard",
    type: "space-fuel",
    category: "logic",
    description: "Guide the rocket to the destination planet while collecting all fuel cells.",
    estimatedTime: "3 minutes",
    rewardXp: 2,
    question: "Collect every fuel cell, then reach the planet.",
    size: 4,
    start: [0, 0],
    goal: [3, 3],
    fuelCells: [
      [0, 1],
      [1, 1],
      [2, 2]
    ],
    rules: ["Collect every fuel cell", "Reach the destination planet", "Rocket cannot finish before collecting all fuel", "Track moves taken"],
    explanation: "The rocket must visit every fuel cell before landing on the destination planet. Once all fuel is collected, the planet completes the mission."
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
    rewardXp: 3,
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
    rewardXp: 3,
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
    rewardXp: 3,
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
    rewardXp: 3,
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
    rewardXp: 3,
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
    rewardXp: 3,
    icon: "📡",
    route: "/brain/visual-radar",
    skills: ["Observation", "Visual Attention", "Short-Term Memory"]
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

