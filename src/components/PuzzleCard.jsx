import React from "react";
import { Clock3, Play } from "lucide-react";
import DifficultyBadge from "./DifficultyBadge";
import PrimaryButton from "./PrimaryButton";

export default function PuzzleCard({ puzzle, onStart }) {
  return (
    <article className="flex flex-col h-full rounded-[22px] border border-saathi-line bg-white p-5 shadow-card">
      {/* Difficulty Badge */}
      <div className="mb-3 flex items-start">
        <DifficultyBadge difficulty={puzzle.difficulty} />
      </div>

      {/* Puzzle Title */}
      <div className="mb-2">
        <h2 className="text-xl font-extrabold text-saathi-ink leading-snug min-h-[56px] flex items-center">
          {puzzle.displayName}
        </h2>
      </div>

      {/* Description */}
      <div className="mb-4 text-sm font-semibold text-saathi-muted leading-relaxed min-h-[60px] flex items-start">
        {puzzle.description}
      </div>

      {/* Estimated Time */}
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-saathi-muted">
        <Clock3 size={15} />
        <span>Estimated Time: {puzzle.estimatedTime}</span>
      </div>

      {/* Spacer (flex-grow) */}
      <div className="flex-grow" />

      {/* Start Puzzle Button */}
      <PrimaryButton onClick={onStart} className="w-full mt-2">
        <Play size={18} fill="currentColor" />
        Start Puzzle
      </PrimaryButton>
    </article>
  );
}
