import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { savePuzzleResult } from "../utils/storage";

const defaultAttempt = {
  answer: null,
  elapsedSeconds: 0
};

const AttemptContext = createContext(null);

export function AttemptProvider({ children }) {
  const [attempts, setAttempts] = useState({});

  const getAttempt = useCallback((puzzleId) => attempts[puzzleId] ?? defaultAttempt, [attempts]);

  const startAttempt = useCallback((puzzleId) => {
    setAttempts((current) => ({
      ...current,
      [puzzleId]: {
        ...defaultAttempt,
        ...current[puzzleId],
        startedAt: current[puzzleId]?.startedAt ?? Date.now()
      }
    }));
  }, []);

  const updateAnswer = useCallback((puzzleId, answer) => {
    setAttempts((current) => ({
      ...current,
      [puzzleId]: {
        ...defaultAttempt,
        ...current[puzzleId],
        answer
      }
    }));
  }, []);

  const submitAttempt = useCallback((puzzleId, elapsedSeconds, isCorrect) => {
    setAttempts((current) => {
      const updated = {
        ...current,
        [puzzleId]: {
          ...defaultAttempt,
          ...current[puzzleId],
          elapsedSeconds,
          isCorrect,
          submittedAt: Date.now()
        }
      };

      // Log attempt to progress analytics
      savePuzzleResult({
        puzzleId,
        score: isCorrect ? 10 : 0,
        accuracy: isCorrect ? 100 : 0,
        timeTaken: elapsedSeconds
      });

      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      attempts,
      getAttempt,
      startAttempt,
      updateAnswer,
      submitAttempt
    }),
    [attempts, getAttempt, updateAnswer, startAttempt, submitAttempt]
  );

  return <AttemptContext.Provider value={value}>{children}</AttemptContext.Provider>;
}

export function useAttempt() {
  const context = useContext(AttemptContext);
  if (!context) {
    throw new Error("useAttempt must be used inside AttemptProvider");
  }
  return context;
}
