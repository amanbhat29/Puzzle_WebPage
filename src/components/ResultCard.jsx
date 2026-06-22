import React from "react";
import { Check, Clock3, Medal, Target, X } from "lucide-react";
import { formatTimer } from "../utils/format";

export default function ResultCard({ puzzle, accuracy, attempted, elapsedSeconds, solved }) {
  return (
    <section className="flex min-h-[calc(100vh-104px)] flex-col items-center justify-center px-4 pb-28 pt-8 text-center">
      <div className={`grid h-16 w-16 place-items-center rounded-full ${solved ? "bg-emerald-100 text-saathi-green" : "bg-red-100 text-saathi-red"}`}>
        {solved ? <Check size={34} strokeWidth={2.4} /> : <X size={34} strokeWidth={2.4} />}
      </div>
      <h1 className="mt-5 text-3xl font-extrabold leading-tight text-saathi-ink">{solved ? "Puzzle Solved!" : "Puzzle Submitted"}</h1>
      <p className="mt-3 text-sm font-semibold text-saathi-muted">{solved ? "You've completed the puzzle." : "Review the solution and try the idea again."}</p>
      <div className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50/40 px-4 py-5 shadow-card">
        <p className="text-xs font-extrabold uppercase text-saathi-amber">Reward Earned</p>
        <div className="mx-auto mt-4 grid h-12 w-12 place-items-center rounded-full bg-white text-saathi-amber shadow-sm">
          <Medal size={26} />
        </div>
        <p className="mt-3 text-3xl font-extrabold text-saathi-ink">+{solved ? puzzle.rewardXp : 0}<span className="ml-1 text-sm">XP</span></p>
        <p className="mt-2 text-xs font-semibold text-saathi-muted">{solved ? "Great job! You're climbing the leaderboard" : "Solve it correctly to earn the reward"}</p>
      </div>
      <div className="mt-5 grid w-full grid-cols-3 gap-3">
        <Metric icon={<Target size={19} />} value={`${accuracy}%`} label="Accuracy" />
        <Metric value={puzzleStats(puzzle).middleValue} label={puzzleStats(puzzle).middleLabel} />
        <Metric icon={<Clock3 size={18} />} value={puzzleStats(puzzle).rightValue ?? formatTimer(elapsedSeconds)} label={puzzleStats(puzzle).rightLabel} />
      </div>
    </section>
  );
}

function puzzleStats(puzzle) {
  const answer = puzzle.latestAnswer;
  if (puzzle.type === "treasure-maze") {
    return { middleValue: answer?.moves ?? 0, middleLabel: "Moves", rightValue: formatTimer(puzzle.elapsedSeconds ?? 0), rightLabel: "Time" };
  }
  if (puzzle.type === "space-fuel") {
    return {
      middleValue: answer ? `${answer.collectedFuel.length}/${puzzle.fuelCells.length}` : `0/${puzzle.fuelCells.length}`,
      middleLabel: "Fuel",
      rightValue: answer?.moves ?? 0,
      rightLabel: "Moves"
    };
  }
  return { middleValue: `${puzzle.attempted ?? 1}/1`, middleLabel: "Attempted", rightLabel: "Time" };
}

function Metric({ icon, value, label }) {
  return (
    <div className="min-h-[88px] rounded-xl border border-saathi-line bg-white p-3 shadow-sm">
      <div className="mx-auto flex h-9 items-center justify-center gap-1 text-lg font-extrabold text-saathi-green">
        {icon}
        {value}
      </div>
      <p className="mt-2 text-xs font-bold text-saathi-muted">{label}</p>
    </div>
  );
}
