import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Clock, Target, Trophy, Flame, Play, Sparkles, 
  HelpCircle, Lightbulb, BookOpen, ShieldAlert, Award
} from "lucide-react";
import DifficultySelector from "./DifficultySelector";
import PrimaryButton from "./PrimaryButton";

// Puzzle Metadata for Overview, Badges, Previews, and Quotes
const PUZZLE_META = {
  "pattern-detection": {
    objective: "Identify and predict repeating sequences of shapes, numbers, or spatial patterns.",
    skills: ["Pattern Recognition", "Logical Thinking", "Sequencing", "Analytical Reasoning", "Critical Thinking"],
    time: "2-3 Minutes",
    tip: "Look closely at the differences between consecutive elements to spot the rule.",
    rules: [
      "Observe the sequence of elements from left to right.",
      "Identify the repeating, alternating, or scaling pattern.",
      "Select the option that logically completes the sequence."
    ],
    preview: {
      title: "Sample Sequence",
      elements: ["🔺", "🔵", "🔺", "🔵", "❓"],
      question: "Which shape comes next?"
    },
    quote: "Patterns are the language of logic. Observe carefully."
  },
  "elimination-grid": {
    objective: "Use deductive logic to match categories and eliminate incorrect combinations.",
    skills: ["Deductive Reasoning", "Logic", "Structured Planning", "Problem Solving", "Critical Thinking"],
    time: "3-4 Minutes",
    tip: "Read negative clues first to cross out invalid matches in the grid.",
    rules: [
      "Read the positive and negative logic clues carefully.",
      "Eliminate incorrect matches systematically (e.g. if A is not X).",
      "Deduce the final correct pairing through process of elimination."
    ],
    preview: {
      title: "Sample Deduction",
      clues: [
        "Aarav plays Cricket.",
        "Priya does not play Football."
      ],
      question: "Who plays Tennis?"
    },
    quote: "Eliminate the impossible, and whatever remains must be the truth."
  },
  "number-matrix": {
    objective: "Discover the mathematical rules governing rows and columns in a number grid.",
    skills: ["Mathematical Logic", "Pattern Recognition", "Analytical Thinking", "Quantitative Reasoning", "Logic"],
    time: "3 Minutes",
    tip: "Test row sums, column sums, or step multipliers to find the grid rule.",
    rules: [
      "Examine numbers across rows and down columns.",
      "Look for math operations (addition, subtraction, multiplication, etc.).",
      "Find the rule that works for all rows and columns to solve for the '?'."
    ],
    preview: {
      title: "Sample Matrix",
      matrix: [
        ["2", "4", "6"],
        ["3", "6", "9"],
        ["4", "8", "?"]
      ],
      question: "What number replaces the question mark?"
    },
    quote: "Numbers always follow rules. Find the math connections."
  },
  "code-breaker": {
    objective: "Decipher the hidden encryption rules by analyzing encoded word-number pairs.",
    skills: ["Pattern Recognition", "Decryption", "Logical Thinking", "Problem Solving", "Analytical Thinking"],
    time: "3 Minutes",
    tip: "Count the letters, add their alphabet positions, or check starting letters.",
    rules: [
      "Study the example words and their matching code numbers.",
      "Find the encryption pattern (sum of letters, positions, length, etc.).",
      "Apply the deciphered logic to decode the final target word."
    ],
    preview: {
      title: "Sample Code",
      examples: [
        "CAT = 24",
        "DOG = 26"
      ],
      question: "BAT = ?"
    },
    quote: "Every cipher has a key. Analyze the examples to unlock it."
  },
  "word-detective": {
    objective: "Deduce the mystery word by connecting clues that narrow down its meaning.",
    skills: ["Vocabulary", "Reading Comprehension", "Deductive Reasoning", "Critical Thinking", "Word Association"],
    time: "3 Minutes",
    tip: "You can submit an answer after any clue. Early correct answers earn more points!",
    rules: [
      "Read clues revealed one-by-one, from general to specific.",
      "Select the correct word from the options as soon as you deduce it.",
      "Earn a higher score by answering correctly with fewer clues revealed."
    ],
    preview: {
      title: "Sample Clues",
      clues: [
        "Clue 1: I work in hospitals.",
        "Clue 2: I prescribe medicines."
      ],
      question: "Who am I? (Doctor / Pilot)"
    },
    quote: "Link semantic clues together to unveil the hidden word."
  },
  "word-ladder": {
    objective: "Change exactly one letter at each step to bridge the starting and ending words.",
    skills: ["Spelling", "Pattern Recognition", "Vocabulary", "Logical Transitions", "Word Association"],
    time: "3 Minutes",
    tip: "Look at both the word above and the word below to find the correct transition.",
    rules: [
      "Transform the start word into the end word step-by-step.",
      "Change exactly one letter at each level to form a new word.",
      "Each intermediate step must form a valid, real English word."
    ],
    preview: {
      title: "Sample Ladder",
      ladder: ["COLD", "CORD", "CARD", "?", "WARM"],
      question: "What is the missing word? (WARD / WOOD)"
    },
    quote: "One letter shifts everything. Walk up the ladder of logic."
  }
};

const DIFFICULTY_META = {
  "Easy": {
    desc: "Simple puzzles, basic reasoning, and straightforward connections.",
    bg: "bg-emerald-50 text-saathi-green border-emerald-200"
  },
  "Medium": {
    desc: "Mixed logic, moderate complexity, and multi-step deduction.",
    bg: "bg-amber-50 text-amber-600 border-amber-200"
  },
  "Hard": {
    desc: "Advanced reasoning, challenging patterns, and complex relationships.",
    bg: "bg-red-50 text-saathi-red border-red-200"
  }
};

export default function PuzzleIntroduction({ type, difficulty, setDifficulty, onStart, onBack, title }) {
  const meta = PUZZLE_META[type] || PUZZLE_META["pattern-detection"];
  const diffMeta = DIFFICULTY_META[difficulty] || DIFFICULTY_META["Medium"];

  // ── Illustration Animation States ──────────────────────────────────────
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationFrame((prev) => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between text-left pb-10">
      {/* CSS Injected Styles for Micro-animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes rotateMag {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(15deg) scale(1.08); }
        }
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(99, 102, 241, 0.2)); }
          50% { filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.6)); }
        }
        @keyframes btnScalePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2); }
          50% { transform: scale(1.02); box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4); }
        }
        .intro-float {
          animation: float 4s ease-in-out infinite;
        }
        .intro-rotate-mag {
          animation: rotateMag 3s ease-in-out infinite;
        }
        .intro-glow-pulse {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        .intro-btn-pulse {
          animation: btnScalePulse 2.5s ease-in-out infinite;
        }
      `}} />

      <div>
        {/* ── HEADER ── */}
        <header className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-saathi-line transition text-saathi-ink shrink-0"
            aria-label="Back to home"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs font-bold text-saathi-green">Class Saathi Puzzles</p>
            <h1 className="text-2xl font-extrabold text-saathi-ink">{title}</h1>
          </div>
        </header>

        {/* ── SECTION 1: INTERACTIVE PUZZLE ILLUSTRATION ── */}
        <div className="bg-slate-50 border border-saathi-line rounded-2xl p-5 mb-6 flex flex-col items-center justify-center min-h-[180px] shadow-inner text-center overflow-hidden">
          
          {/* Pattern Detection Illustration */}
          {type === "pattern-detection" && (
            <div className="flex items-center gap-3.5 justify-center intro-float py-2">
              <span className="text-4xl filter drop-shadow-md">🔺</span>
              <span className="text-4xl filter drop-shadow-md">🔵</span>
              <span className="text-4xl filter drop-shadow-md">🔺</span>
              <span className="text-4xl filter drop-shadow-md">🔵</span>
              <div className="w-14 h-14 border-2 border-dashed border-saathi-amber bg-amber-50 rounded-xl flex items-center justify-center intro-glow-pulse">
                <span className="text-3xl font-black text-saathi-amber animate-bounce">?</span>
              </div>
            </div>
          )}

          {/* Elimination Grid Illustration */}
          {type === "elimination-grid" && (
            <div className="w-full max-w-[280px] py-2 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold px-3">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">👩</span>
                  <span className="text-[10px] text-saathi-ink">Alice</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">👨</span>
                  <span className="text-[10px] text-saathi-ink">Bob</span>
                </div>
              </div>
              <div className="relative h-6 bg-white border border-saathi-line rounded-lg flex items-center justify-center">
                <div className="absolute left-[20%] w-0.5 h-full bg-saathi-red opacity-30"></div>
                <div className="absolute right-[20%] w-0.5 h-full bg-saathi-green opacity-30"></div>
                <span className="text-[10px] font-black text-saathi-muted uppercase">Deduction Connections</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold px-3">
                <span className={`px-2 py-1 rounded border shadow-sm transition-all duration-500 ${animationFrame % 2 === 0 ? 'bg-red-50 border-red-200 text-saathi-red scale-105' : 'bg-white border-saathi-line'}`}>🍎 Apple</span>
                <span className={`px-2 py-1 rounded border shadow-sm transition-all duration-500 ${animationFrame % 2 === 1 ? 'bg-emerald-50 border-emerald-200 text-saathi-green scale-105' : 'bg-white border-saathi-line'}`}>🍌 Banana</span>
              </div>
            </div>
          )}

          {/* Number Logic Matrix Illustration */}
          {type === "number-matrix" && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-white border border-saathi-line rounded-xl shadow-sm w-44 mx-auto">
              {[
                { val: "2", active: animationFrame === 0 },
                { val: "4", active: animationFrame === 0 },
                { val: "6", active: animationFrame === 0 },
                { val: "3", active: animationFrame === 1 },
                { val: "6", active: animationFrame === 1 },
                { val: "9", active: animationFrame === 1 },
                { val: "4", active: animationFrame === 2 },
                { val: "8", active: animationFrame === 2 },
                { val: "?", active: true, isQ: true }
              ].map((cell, idx) => (
                <div 
                  key={idx} 
                  className={`aspect-square flex items-center justify-center text-base font-black rounded-lg border shadow-sm transition-all duration-300 ${
                    cell.isQ 
                      ? "border-saathi-amber bg-amber-50 text-saathi-amber intro-glow-pulse" 
                      : cell.active 
                      ? "border-saathi-indigo bg-indigo-50 text-saathi-indigo scale-105" 
                      : "border-saathi-line bg-white text-saathi-ink"
                  }`}
                >
                  {cell.val}
                </div>
              ))}
            </div>
          )}

          {/* Code Breaker Illustration */}
          {type === "code-breaker" && (
            <div className="flex flex-col gap-2 py-2 intro-float">
              <div className="flex items-center justify-center gap-3 text-sm font-bold bg-white px-4 py-2 border border-saathi-line rounded-xl shadow-sm">
                <span className="text-saathi-ink font-extrabold tracking-widest">C A T</span>
                <span className="text-saathi-muted font-bold">→</span>
                <span className="bg-indigo-50 border border-indigo-100 text-saathi-indigo px-2.5 py-0.5 rounded-lg font-black text-xs">24</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-sm font-bold bg-white px-4 py-2 border border-saathi-line rounded-xl shadow-sm">
                <span className="text-saathi-ink font-extrabold tracking-widest">D O G</span>
                <span className="text-saathi-muted font-bold">→</span>
                <span className="bg-indigo-50 border border-indigo-100 text-saathi-indigo px-2.5 py-0.5 rounded-lg font-black text-xs">26</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-xs font-black text-saathi-amber bg-amber-50 px-4 py-2 border border-dashed border-amber-200 rounded-xl intro-glow-pulse">
                <span>B A T → ?</span>
                <span className="text-base">🔓</span>
              </div>
            </div>
          )}

          {/* Mystery Word Detective Illustration */}
          {type === "word-detective" && (
            <div className="flex items-center gap-4 py-2">
              <div className="flex flex-col items-center">
                <span className="text-5xl intro-rotate-mag filter drop-shadow-md">🕵️‍♂️</span>
              </div>
              <div className="flex flex-col gap-2 text-left">
                <div className="bg-white border border-saathi-line px-3 py-1.5 rounded-xl shadow-sm text-[10px] font-bold text-saathi-ink intro-float">
                  💬 Clue: "I work in hospitals."
                </div>
                <div className="bg-white border border-saathi-line px-3 py-1.5 rounded-xl shadow-sm text-[10px] font-bold text-saathi-ink animate-[float_4s_ease-in-out_infinite_2s]">
                  💬 Clue: "I prescribe medicines."
                </div>
              </div>
            </div>
          )}

          {/* Word Ladder Illustration */}
          {type === "word-ladder" && (
            <div className="flex flex-col items-center gap-1 py-1 font-black text-sm">
              <div className="bg-white border border-saathi-line px-4 py-1.5 rounded-xl shadow-sm text-saathi-ink">
                CO<span className="text-saathi-indigo">L</span>D
              </div>
              <span className="text-xs text-saathi-muted">↓</span>
              <div className="bg-white border border-saathi-line px-4 py-1.5 rounded-xl shadow-sm text-saathi-ink">
                CO<span className="text-saathi-indigo">R</span>D
              </div>
              <span className="text-xs text-saathi-muted">↓</span>
              <div className="bg-white border border-saathi-line px-4 py-1.5 rounded-xl shadow-sm text-saathi-ink">
                C<span className="text-saathi-indigo">A</span>RD
              </div>
              <span className="text-xs text-saathi-muted">↓</span>
              <div className="border border-dashed border-saathi-amber bg-amber-50 px-4 py-1.5 rounded-xl shadow-sm text-saathi-amber intro-glow-pulse">
                ?
              </div>
            </div>
          )}

          <p className="mt-4 text-[10px] font-black uppercase text-saathi-muted tracking-wider">
            Interactive Concept Preview
          </p>
        </div>

        {/* ── SECTION 2: PUZZLE OVERVIEW CARD ── */}
        <section className="bg-white border border-saathi-line rounded-2xl p-5 shadow-card mb-6">
          <h2 className="text-sm font-black text-saathi-ink uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-saathi-indigo" />
            Puzzle Overview
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-saathi-muted mb-4 border-b border-saathi-line pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-saathi-ink">🎯 Objective</p>
              <p className="mt-1 leading-relaxed">{meta.objective}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-saathi-ink">⏱ Estimated Time</p>
              <p className="mt-1 text-saathi-ink font-bold">{meta.time}</p>
            </div>
          </div>
          <div className="mb-4 border-b border-saathi-line pb-4 text-xs">
            <p className="text-[10px] font-bold uppercase text-saathi-ink mb-2">📜 How to Play / Rules</p>
            <ul className="list-decimal list-inside space-y-1.5 text-saathi-muted font-semibold">
              {meta.rules.map((rule, idx) => (
                <li key={idx} className="leading-relaxed">{rule}</li>
              ))}
            </ul>
          </div>
          <div className="text-xs leading-relaxed text-saathi-muted flex gap-2">
            <Lightbulb size={16} className="text-saathi-amber shrink-0 mt-0.5" />
            <p>
              <strong className="text-saathi-ink">Quick Tip:</strong> {meta.tip}
            </p>
          </div>
        </section>

        {/* ── SECTION 3: SKILLS DEVELOPED ── */}
        <section className="mb-6">
          <h2 className="text-xs font-black text-saathi-ink uppercase tracking-wider mb-3 flex items-center gap-2">
            <Award size={16} className="text-saathi-green" />
            Skills Developed
          </h2>
          <div className="flex flex-wrap gap-2">
            {meta.skills.map((skill) => (
              <span 
                key={skill}
                className="bg-indigo-50/70 border border-indigo-100/50 text-saathi-indigo text-[10px] font-bold px-3 py-1.5 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* ── DIFFICULTY SELECTOR ── */}
        <section className="mb-6">
          <label className="block text-xs font-black text-saathi-ink uppercase tracking-wider mb-3">
            Select Difficulty
          </label>
          <DifficultySelector selected={difficulty} onChange={setDifficulty} />
        </section>

        {/* ── SECTION 4: DIFFICULTY EXPLANATION ── */}
        <section className={`border rounded-2xl p-4 text-xs font-semibold mb-6 flex gap-3 items-start animate-[brain-fade-in_0.4s_ease-out] ${diffMeta.bg}`}>
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold uppercase text-[10px] tracking-wider mb-0.5">{difficulty} Mode Details</p>
            <p>{diffMeta.desc}</p>
          </div>
        </section>

        {/* ── SECTION 5: PREVIEW EXAMPLE ── */}
        <section className="bg-white border border-saathi-line rounded-2xl p-5 shadow-card mb-6">
          <h2 className="text-xs font-black text-saathi-ink uppercase tracking-wider mb-4 flex items-center gap-2">
            <HelpCircle size={16} className="text-saathi-indigo" />
            Sample Question Preview
          </h2>
          
          <div className="bg-slate-50/50 border border-saathi-line rounded-xl p-4 text-center">
            <p className="text-[9px] font-black uppercase text-saathi-muted mb-2 text-left">{meta.preview.title}</p>
            
            {type === "pattern-detection" && (
              <div className="flex items-center gap-3 justify-center text-2xl font-black py-2">
                {meta.preview.elements.map((el, i) => (
                  <span key={i} className={el === "❓" ? "text-saathi-amber animate-pulse" : ""}>{el}</span>
                ))}
              </div>
            )}

            {type === "elimination-grid" && (
              <div className="flex flex-col gap-1.5 py-1 text-left text-xs font-bold text-saathi-ink">
                {meta.preview.clues.map((clue, i) => (
                  <p key={i}>• {clue}</p>
                ))}
              </div>
            )}

            {type === "number-matrix" && (
              <div className="grid grid-cols-3 gap-1 mx-auto w-24 p-1.5 bg-white border border-saathi-line rounded-lg text-center text-xs font-black">
                {meta.preview.matrix.flat().map((c, i) => (
                  <div key={i} className={`p-1 border border-saathi-line rounded ${c === "?" ? "bg-amber-50 text-saathi-amber border-saathi-amber" : "bg-slate-50"}`}>{c}</div>
                ))}
              </div>
            )}

            {type === "code-breaker" && (
              <div className="flex flex-col gap-1 text-xs font-bold text-saathi-ink">
                {meta.preview.examples.map((ex, i) => (
                  <p key={i}>{ex}</p>
                ))}
              </div>
            )}

            {type === "word-detective" && (
              <div className="flex flex-col gap-1 text-left text-xs font-bold text-saathi-ink">
                {meta.preview.clues.map((c, i) => (
                  <p key={i}>{c}</p>
                ))}
              </div>
            )}

            {type === "word-ladder" && (
              <div className="flex items-center gap-1.5 justify-center text-xs font-black py-1">
                {meta.preview.ladder.map((w, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-saathi-muted">→</span>}
                    <span className={w === "?" ? "text-saathi-amber border border-dashed border-amber-300 px-1.5 py-0.5 rounded bg-amber-50" : "bg-white border px-1.5 py-0.5 rounded"}>{w}</span>
                  </React.Fragment>
                ))}
              </div>
            )}

            <p className="mt-3 text-xs font-bold text-saathi-ink text-left border-t border-saathi-line pt-2.5">
              ❓ {meta.preview.question}
            </p>
          </div>
        </section>

        {/* ── SECTION 6: MOTIVATIONAL CARD ── */}
        <section className="bg-gradient-to-r from-emerald-50/70 to-indigo-50/70 border border-saathi-line rounded-2xl p-4 mb-8 flex gap-3 items-center">
          <span className="text-2xl">🧠</span>
          <p className="text-xs font-bold text-saathi-ink leading-relaxed">
            {meta.quote} Remember: every challenge is an opportunity to grow!
          </p>
        </section>
      </div>

      {/* ── SECTION 7: IMPROVED START CHALLENGE BUTTON ── */}
      <PrimaryButton onClick={onStart} className="w-full intro-btn-pulse hover:scale-[1.03] transition-all duration-300">
        <Play size={18} fill="currentColor" />
        Start Challenge
      </PrimaryButton>
    </div>
  );
}
