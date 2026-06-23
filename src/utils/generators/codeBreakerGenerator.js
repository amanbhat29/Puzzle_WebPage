/**
 * @file codeBreakerGenerator.js
 * @description Dynamic word-to-number code breaker challenge generator for Class Saathi.
 *              Generates encoding rules, example pairs, and target multiple-choice questions.
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

// Word banks grouped by length
const THREE_LETTER_WORDS = ["CAT", "DOG", "BAT", "ANT", "BEE", "FOX", "HEN", "OWL", "PIG", "COW", "RAT", "YAK", "BAD", "CAB", "ACE", "KEY", "JAM", "ICE"];
const FOUR_LETTER_WORDS = ["LION", "BEAR", "FROG", "WOLF", "DEER", "DUCK", "FISH", "BIRD", "GOAT", "HARE", "SEAL", "CRAB", "LAMP", "BOOK", "GATE", "ROSE"];

// Letter index helper: A=1, B=2...
const letterIndex = (char) => char.charCodeAt(0) - 64;

// Vowel checker
const isVowel = (char) => ["A", "E", "I", "O", "U"].includes(char);

// ─── Rule Encoders ────────────────────────────────────────────────────────────

// Rule 1: A=1, B=2... Sum of indexes
const encodeStandardSum = (word) => {
  return word.split("").reduce((sum, char) => sum + letterIndex(char), 0);
};

// Rule 2: Reverse positions A=26, B=25... Z=1
const encodeReverseSum = (word) => {
  return word.split("").reduce((sum, char) => sum + (27 - letterIndex(char)), 0);
};

// Rule 3: Letter index shifted sum (e.g. A=2, B=3...)
const encodeShiftSum = (word, shift) => {
  return word.split("").reduce((sum, char) => sum + (letterIndex(char) + shift), 0);
};

// Rule 4: Vowel-Consonant Count Code (vowels * 10 + consonants)
const encodeVowelConsonant = (word) => {
  const letters = word.split("");
  const vowels = letters.filter(isVowel).length;
  const consonants = letters.length - vowels;
  return vowels * 10 + consonants;
};

// Rule 5: Sum * 2
const encodeDoubleSum = (word) => {
  return encodeStandardSum(word) * 2;
};

// Rule 6: Letter index multiplication (only for short 3-letter words)
const encodeProduct = (word) => {
  return word.split("").reduce((prod, char) => prod * letterIndex(char), 1);
};

// ─── Distractor Builder ───────────────────────────────────────────────────────
const buildOptions = (correct, altValue1, altValue2) => {
  const distractorSet = new Set();
  
  if (altValue1 && altValue1 !== correct && altValue1 > 0) distractorSet.add(altValue1);
  if (altValue2 && altValue2 !== correct && altValue2 > 0) distractorSet.add(altValue2);

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

export function generateCodeBreaker(difficulty = "Medium") {
  const diff = String(difficulty).toLowerCase();
  
  let ruleType = "standard-sum";
  let wordPool = THREE_LETTER_WORDS;
  
  if (diff === "easy") {
    ruleType = pick(["standard-sum", "vowel-consonant-count"]);
    wordPool = THREE_LETTER_WORDS;
  } else if (diff === "hard") {
    ruleType = pick(["double-sum", "product", "reverse-sum"]);
    wordPool = THREE_LETTER_WORDS; // product stays small with 3 letters
  } else {
    // Medium
    ruleType = pick(["reverse-sum", "shift-sum", "vowel-consonant-count"]);
    wordPool = Math.random() < 0.5 ? THREE_LETTER_WORDS : FOUR_LETTER_WORDS;
  }

  // Grab 3 unique words
  const selectedWords = shuffle(wordPool).slice(0, 3);
  const w1 = selectedWords[0];
  const w2 = selectedWords[1];
  const wTarget = selectedWords[2];

  let val1 = 0;
  let val2 = 0;
  let valTarget = 0;
  let ruleDesc = "";
  let explanation = "";
  
  // Alternative values for logical distractors
  let altTarget1 = 0;
  let altTarget2 = 0;

  switch (ruleType) {
    case "standard-sum": {
      val1 = encodeStandardSum(w1);
      val2 = encodeStandardSum(w2);
      valTarget = encodeStandardSum(wTarget);
      
      altTarget1 = encodeReverseSum(wTarget);
      altTarget2 = encodeDoubleSum(wTarget);
      
      ruleDesc = "Sum of alphabetical letter positions (A=1, B=2, C=3...).";
      explanation = `The rule is to sum the letter positions (A=1, B=2, ... Z=26):\n` +
                    `• ${w1} = ${w1.split("").map(c => `${c}(${letterIndex(c)})`).join(" + ")} = ${val1}\n` +
                    `• ${w2} = ${w2.split("").map(c => `${c}(${letterIndex(c)})`).join(" + ")} = ${val2}\n` +
                    `Applying this to ${wTarget}: ${wTarget.split("").map(c => `${c}(${letterIndex(c)})`).join(" + ")} = ${valTarget}.`;
      break;
    }
    case "reverse-sum": {
      val1 = encodeReverseSum(w1);
      val2 = encodeReverseSum(w2);
      valTarget = encodeReverseSum(wTarget);

      altTarget1 = encodeStandardSum(wTarget);
      altTarget2 = encodeDoubleSum(wTarget);

      ruleDesc = "Sum of reverse alphabetical letter positions (A=26, B=25, C=24...).";
      explanation = `The rule is to sum the reverse letter positions (A=26, B=25, ... Z=1, calculated as 27 - position):\n` +
                    `• ${w1} = ${w1.split("").map(c => `${c}(${27 - letterIndex(c)})`).join(" + ")} = ${val1}\n` +
                    `• ${w2} = ${w2.split("").map(c => `${c}(${27 - letterIndex(c)})`).join(" + ")} = ${val2}\n` +
                    `Applying this to ${wTarget}: ${wTarget.split("").map(c => `${c}(${27 - letterIndex(c)})`).join(" + ")} = ${valTarget}.`;
      break;
    }
    case "shift-sum": {
      const shift = pick([1, 2, 3]);
      val1 = encodeShiftSum(w1, shift);
      val2 = encodeShiftSum(w2, shift);
      valTarget = encodeShiftSum(wTarget, shift);

      altTarget1 = encodeStandardSum(wTarget);
      altTarget2 = encodeShiftSum(wTarget, shift + 1);

      ruleDesc = `Sum of alphabetical letter positions shifted by +${shift} (A=${1+shift}, B=${2+shift}...).`;
      explanation = `Each letter position is increased by ${shift} before summing (A=${1+shift}, B=${2+shift}, ...):\n` +
                    `• ${w1} = ${w1.split("").map(c => `${c}(${letterIndex(c)}+${shift})`).join(" + ")} = ${val1}\n` +
                    `• ${w2} = ${w2.split("").map(c => `${c}(${letterIndex(c)}+${shift})`).join(" + ")} = ${val2}\n` +
                    `Applying this to ${wTarget}: ${wTarget.split("").map(c => `${c}(${letterIndex(c)}+${shift})`).join(" + ")} = ${valTarget}.`;
      break;
    }
    case "vowel-consonant-count": {
      val1 = encodeVowelConsonant(w1);
      val2 = encodeVowelConsonant(w2);
      valTarget = encodeVowelConsonant(wTarget);

      altTarget1 = wTarget.length;
      altTarget2 = encodeStandardSum(wTarget);

      ruleDesc = "Number of vowels followed by number of consonants (e.g. 1 vowel, 2 consonants = 12).";
      explanation = `The rule is: (Number of Vowels * 10) + (Number of Consonants):\n` +
                    `• ${w1}: Vowels=${w1.split("").filter(isVowel).length}, Consonants=${w1.length - w1.split("").filter(isVowel).length} -> ${val1}\n` +
                    `• ${w2}: Vowels=${w2.split("").filter(isVowel).length}, Consonants=${w2.length - w2.split("").filter(isVowel).length} -> ${val2}\n` +
                    `Applying this to ${wTarget}: Vowels=${wTarget.split("").filter(isVowel).length}, Consonants=${wTarget.length - wTarget.split("").filter(isVowel).length} -> ${valTarget}.`;
      break;
    }
    case "double-sum": {
      val1 = encodeDoubleSum(w1);
      val2 = encodeDoubleSum(w2);
      valTarget = encodeDoubleSum(wTarget);

      altTarget1 = encodeStandardSum(wTarget);
      altTarget2 = encodeStandardSum(wTarget) * 3;

      ruleDesc = "Double the sum of the standard alphabetical positions (Sum * 2).";
      explanation = `The rule is standard sum of alphabetical positions, then multiply by 2:\n` +
                    `• ${w1} = (${w1.split("").map(c => `${letterIndex(c)}`).join("+")}) * 2 = ${val1}\n` +
                    `• ${w2} = (${w2.split("").map(c => `${letterIndex(c)}`).join("+")}) * 2 = ${val2}\n` +
                    `Applying this to ${wTarget}: (${wTarget.split("").map(c => `${letterIndex(c)}`).join("+")}) * 2 = ${valTarget}.`;
      break;
    }
    case "product": {
      val1 = encodeProduct(w1);
      val2 = encodeProduct(w2);
      valTarget = encodeProduct(wTarget);

      altTarget1 = encodeStandardSum(wTarget);
      altTarget2 = encodeDoubleSum(wTarget);

      ruleDesc = "Product of letter positions (Letter 1 * Letter 2 * Letter 3).";
      explanation = `The rule is to multiply the alphabetical positions of each letter:\n` +
                    `• ${w1} = ${w1.split("").map(c => `${c}(${letterIndex(c)})`).join(" * ")} = ${val1}\n` +
                    `• ${w2} = ${w2.split("").map(c => `${c}(${letterIndex(c)})`).join(" * ")} = ${val2}\n` +
                    `Applying this to ${wTarget}: ${wTarget.split("").map(c => `${c}(${letterIndex(c)})`).join(" * ")} = ${valTarget}.`;
      break;
    }
  }

  return {
    examples: [
      { word: w1, code: val1 },
      { word: w2, code: val2 }
    ],
    targetWord: wTarget,
    answer: String(valTarget),
    options: buildOptions(valTarget, altTarget1, altTarget2),
    rule: ruleDesc,
    explanation,
    question: `Look at the examples below, discover the hidden word encoding rule, and find the value for the target word.`
  };
}
