/**
 * Helper to ensure that generated questions are unique and do not repeat the last 5.
 * Persists history in localStorage to survive page refreshes.
 *
 * @param {string} puzzleId - The unique ID or type of the puzzle.
 * @param {Function} generateFn - Function that generates a new question.
 * @param {Function} [getSignatureFn] - Function to get a unique signature string for a question.
 * @returns {any} A unique, non-repeating question object.
 */
export function getUniqueQuestion(puzzleId, generateFn, getSignatureFn = (q) => JSON.stringify(q)) {
  const maxAttempts = 100;
  let attempts = 0;
  
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(`cs_question_history_${puzzleId}`) || '[]');
  } catch (e) {
    console.error(`Error reading history for puzzle ${puzzleId}:`, e);
  }

  // Ensure history contains only valid elements
  if (!Array.isArray(history)) {
    history = [];
  }

  while (attempts < maxAttempts) {
    const question = generateFn();
    const signature = getSignatureFn(question);
    
    if (!history.includes(signature)) {
      history.push(signature);
      if (history.length > 5) {
        history.shift();
      }
      try {
        localStorage.setItem(`cs_question_history_${puzzleId}`, JSON.stringify(history));
      } catch (e) {
        console.error(`Error writing history for puzzle ${puzzleId}:`, e);
      }
      return question;
    }
    attempts++;
  }
  
  // Fallback if we fail to generate a unique one
  return generateFn();
}
