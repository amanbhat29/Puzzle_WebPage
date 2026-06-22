import React from "react";

const styles = {
  Easy: "bg-emerald-50 text-saathi-green",
  Medium: "bg-amber-50 text-amber-600",
  Hard: "bg-red-50 text-saathi-red"
};

export default function DifficultyBadge({ difficulty }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}
