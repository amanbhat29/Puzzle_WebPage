/**
 * @file numberMatrixGenerator.js
 * @description Dynamic number matrix generator for Class Saathi.
 *              Generates 3x3 matrices with mathematical and logical connections.
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

// Helper to build smart distractors
const buildOptions = (correct) => {
  const distractorSet = new Set();
  const offsets = [1, -1, 2, -2, 5, -5, 10, -10];
  const shuffledOffsets = shuffle(offsets);

  for (const offset of shuffledOffsets) {
    const d = correct + offset;
    if (d !== correct && d > 0) {
      distractorSet.add(d);
    }
    if (distractorSet.size >= 3) break;
  }

  // Fallbacks
  let fallback = 3;
  while (distractorSet.size < 3) {
    distractorSet.add(correct + fallback);
    fallback++;
  }

  const distractors = Array.from(distractorSet).slice(0, 3);
  const allValues = shuffle([correct, ...distractors]);
  const ids = ["a", "b", "c", "d"];

  return allValues.map((val, idx) => ({
    id: ids[idx],
    text: String(val)
  }));
};

export function generateNumberMatrix(difficulty = "Medium") {
  const diff = String(difficulty).toLowerCase();
  
  let patternType = "row-add";
  
  if (diff === "easy") {
    patternType = pick(["row-add", "row-subtract", "row-ap"]);
  } else if (diff === "hard") {
    patternType = pick(["col-mult", "row-squares", "row-mixed-hard"]);
  } else {
    // Medium
    patternType = pick(["row-mult", "col-add", "row-mixed-med"]);
  }

  const matrix = Array.from({ length: 3 }, () => [0, 0, 0]);
  let explanation = "";
  let rule = "";

  switch (patternType) {
    case "row-add": {
      // Row[i][0] + Row[i][1] = Row[i][2]
      rule = "Each row follows: First column + Second column = Third column.";
      for (let i = 0; i < 3; i++) {
        matrix[i][0] = randInt(2, 20);
        matrix[i][1] = randInt(2, 20);
        matrix[i][2] = matrix[i][0] + matrix[i][1];
      }
      explanation = `Look at the rows: \n` +
                    `Row 1: ${matrix[0][0]} + ${matrix[0][1]} = ${matrix[0][2]}\n` +
                    `Row 2: ${matrix[1][0]} + ${matrix[1][1]} = ${matrix[1][2]}\n` +
                    `Row 3: ${matrix[2][0]} + ${matrix[2][1]} = ${matrix[2][2]}.`;
      break;
    }
    case "row-subtract": {
      // Row[i][0] - Row[i][1] = Row[i][2]
      rule = "Each row follows: First column - Second column = Third column.";
      for (let i = 0; i < 3; i++) {
        matrix[i][1] = randInt(2, 15);
        matrix[i][2] = randInt(2, 15);
        matrix[i][0] = matrix[i][1] + matrix[i][2];
      }
      explanation = `Look at the rows: \n` +
                    `Row 1: ${matrix[0][0]} - ${matrix[0][1]} = ${matrix[0][2]}\n` +
                    `Row 2: ${matrix[1][0]} - ${matrix[1][1]} = ${matrix[1][2]}\n` +
                    `Row 3: ${matrix[2][0]} - ${matrix[2][1]} = ${matrix[2][2]}.`;
      break;
    }
    case "row-ap": {
      // Arithmetic Progression: R[i][1] - R[i][0] = R[i][2] - R[i][1]
      rule = "Constant addition difference across columns in each row.";
      for (let i = 0; i < 3; i++) {
        const step = randInt(2, 8);
        matrix[i][0] = randInt(1, 15);
        matrix[i][1] = matrix[i][0] + step;
        matrix[i][2] = matrix[i][1] + step;
      }
      explanation = `Look at the rows:\n` +
                    `Row 1: ${matrix[0][0]} (+${matrix[0][1] - matrix[0][0]}) -> ${matrix[0][1]} (+${matrix[0][1] - matrix[0][0]}) -> ${matrix[0][2]}\n` +
                    `Row 2: ${matrix[1][0]} (+${matrix[1][1] - matrix[1][0]}) -> ${matrix[1][1]} (+${matrix[1][1] - matrix[1][0]}) -> ${matrix[1][2]}\n` +
                    `Row 3: ${matrix[2][0]} (+${matrix[2][1] - matrix[2][0]}) -> ${matrix[2][1]} (+${matrix[2][1] - matrix[2][0]}) -> ${matrix[2][2]}.`;
      break;
    }
    case "row-mult": {
      // Row[i][0] * Row[i][1] = Row[i][2]
      rule = "Each row follows: First column * Second column = Third column.";
      for (let i = 0; i < 3; i++) {
        matrix[i][0] = randInt(2, 9);
        matrix[i][1] = randInt(2, 9);
        matrix[i][2] = matrix[i][0] * matrix[i][1];
      }
      explanation = `Look at the rows:\n` +
                    `Row 1: ${matrix[0][0]} * ${matrix[0][1]} = ${matrix[0][2]}\n` +
                    `Row 2: ${matrix[1][0]} * ${matrix[1][1]} = ${matrix[1][2]}\n` +
                    `Row 3: ${matrix[2][0]} * ${matrix[2][1]} = ${matrix[2][2]}.`;
      break;
    }
    case "col-add": {
      // Col[0][i] + Col[1][i] = Col[2][i]
      rule = "Each column follows: Row 1 + Row 2 = Row 3.";
      for (let j = 0; j < 3; j++) {
        matrix[0][j] = randInt(2, 20);
        matrix[1][j] = randInt(2, 20);
        matrix[2][j] = matrix[0][j] + matrix[1][j];
      }
      explanation = `Look at the columns:\n` +
                    `Col 1: ${matrix[0][0]} + ${matrix[1][0]} = ${matrix[2][0]}\n` +
                    `Col 2: ${matrix[0][1]} + ${matrix[1][1]} = ${matrix[2][1]}\n` +
                    `Col 3: ${matrix[0][2]} + ${matrix[1][2]} = ${matrix[2][2]}.`;
      break;
    }
    case "row-mixed-med": {
      // R[i][0] * 2 + R[i][1] = R[i][2]
      rule = "Multiply the first column by 2 and add the second column to get the third column.";
      for (let i = 0; i < 3; i++) {
        matrix[i][0] = randInt(2, 8);
        matrix[i][1] = randInt(1, 10);
        matrix[i][2] = matrix[i][0] * 2 + matrix[i][1];
      }
      explanation = `Look at the rows:\n` +
                    `Row 1: (${matrix[0][0]} * 2) + ${matrix[0][1]} = ${matrix[0][2]}\n` +
                    `Row 2: (${matrix[1][0]} * 2) + ${matrix[1][1]} = ${matrix[1][2]}\n` +
                    `Row 3: (${matrix[2][0]} * 2) + ${matrix[2][1]} = ${matrix[2][2]}.`;
      break;
    }
    case "col-mult": {
      // Col[0][i] * Col[1][i] = Col[2][i]
      rule = "Each column follows: Row 1 * Row 2 = Row 3.";
      for (let j = 0; j < 3; j++) {
        matrix[0][j] = randInt(2, 9);
        matrix[1][j] = randInt(2, 9);
        matrix[2][j] = matrix[0][j] * matrix[1][j];
      }
      explanation = `Look at the columns:\n` +
                    `Col 1: ${matrix[0][0]} * ${matrix[1][0]} = ${matrix[2][0]}\n` +
                    `Col 2: ${matrix[0][1]} * ${matrix[1][1]} = ${matrix[2][1]}\n` +
                    `Col 3: ${matrix[0][2]} * ${matrix[1][2]} = ${matrix[2][2]}.`;
      break;
    }
    case "row-squares": {
      // Row[i][0]^2 + Row[i][1] = Row[i][2]
      rule = "Square of column 1 + column 2 = column 3.";
      for (let i = 0; i < 3; i++) {
        matrix[i][0] = randInt(2, 6);
        matrix[i][1] = randInt(1, 12);
        matrix[i][2] = (matrix[i][0] * matrix[i][0]) + matrix[i][1];
      }
      explanation = `Look at the rows:\n` +
                    `Row 1: ${matrix[0][0]}² + ${matrix[0][1]} = ${matrix[0][2]}\n` +
                    `Row 2: ${matrix[1][0]}² + ${matrix[1][1]} = ${matrix[1][2]}\n` +
                    `Row 3: ${matrix[2][0]}² + ${matrix[2][1]} = ${matrix[2][2]}.`;
      break;
    }
    case "row-mixed-hard": {
      // Row[i][0] * Row[i][1] - 5 = Row[i][2]
      rule = "First column * Second column - 5 = Third column.";
      for (let i = 0; i < 3; i++) {
        matrix[i][0] = randInt(3, 8);
        matrix[i][1] = randInt(3, 8);
        matrix[i][2] = matrix[i][0] * matrix[i][1] - 5;
      }
      explanation = `Look at the rows:\n` +
                    `Row 1: (${matrix[0][0]} * ${matrix[0][1]}) - 5 = ${matrix[0][2]}\n` +
                    `Row 2: (${matrix[1][0]} * ${matrix[1][1]}) - 5 = ${matrix[1][2]}\n` +
                    `Row 3: (${matrix[2][0]} * ${matrix[2][1]}) - 5 = ${matrix[2][2]}.`;
      break;
    }
  }

  const correctAnswer = matrix[2][2];
  
  // Format matrix with hidden bottom-right corner
  const displayMatrix = [
    [matrix[0][0], matrix[0][1], matrix[0][2]],
    [matrix[1][0], matrix[1][1], matrix[1][2]],
    [matrix[2][0], matrix[2][1], "?"]
  ];

  return {
    matrix: displayMatrix,
    rawMatrix: matrix,
    answer: String(correctAnswer),
    options: buildOptions(correctAnswer),
    rule,
    explanation,
    question: "Analyze the mathematical pattern in the matrix and find the missing value (?) in the bottom-right corner."
  };
}
