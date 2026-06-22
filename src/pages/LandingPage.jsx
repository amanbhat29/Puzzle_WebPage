import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import PuzzleCard from "../components/PuzzleCard";
import CategorySection from "../components/CategorySection";
import { getPuzzlesByCategory } from "../data/puzzles";
import { CATEGORIES } from "../data/categories";

export default function LandingPage() {
  const navigate = useNavigate();

  const logicPuzzles = getPuzzlesByCategory("logic");
  const brainPuzzles = getPuzzlesByCategory("brain");

  /** Handles navigation for any puzzle — preserves existing routing for logic puzzles */
  function handleStartPuzzle(puzzle) {
    // Existing logic puzzles use their original routes
    if (puzzle.category === "logic") {
      navigate(puzzle.id === 1 ? "/queens" : `/puzzle/${puzzle.id}`);
    } else {
      // Brain puzzles use their dedicated route
      navigate(puzzle.route);
    }
  }

  return (
    <main className="saathi-screen">
      <div className="phone-frame px-4 py-6">
        {/* ── Global Header ── */}
        <header className="mb-8 flex justify-between items-start">
          <div>
            <p className="text-sm font-bold text-saathi-green">Class Saathi</p>
            <h1 className="mt-1 text-3xl font-extrabold text-saathi-ink">
              Student Puzzle Hub
            </h1>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-saathi-muted">
              Choose a category and challenge your brain.
            </p>
          </div>
          <button
            onClick={() => navigate("/progress")}
            className="flex items-center gap-1.5 bg-saathi-indigo hover:bg-saathi-indigoDark text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md transition duration-200 shrink-0 transform hover:scale-105 active:scale-95"
          >
            <span>My Progress</span>
            <ChevronRight size={14} />
          </button>
        </header>

        {/* ── Category 1: Logic & Strategy ── */}
        <CategorySection
          category={CATEGORIES[0]}
          puzzles={logicPuzzles}
          onStartPuzzle={handleStartPuzzle}
        />


        {/* ── Category 2: Brain Training & Cognitive Skills ── */}
        <CategorySection
          category={CATEGORIES[1]}
          puzzles={brainPuzzles}
          onStartPuzzle={handleStartPuzzle}
        />

        {/* ── Bottom spacing ── */}
        <div className="h-8" />
      </div>
    </main>
  );
}
