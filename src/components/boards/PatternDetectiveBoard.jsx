import React from "react";
import OptionCard from "../OptionCard";

export default function PatternDetectiveBoard({ puzzle, answer, onChange, readonly = false, hideOptions = false }) {
  return (
    <div className="mt-4">
      <div className="rounded-2xl border border-saathi-line bg-white/80 p-4 shadow-sm">
        <div className="grid gap-2 text-center text-2xl font-extrabold text-saathi-amber">
          {puzzle.pattern.map((line, index) => (
            <div key={`${line}-${index}`} className={line === "?" ? "text-saathi-muted" : ""}>
              {line}
            </div>
          ))}
        </div>
      </div>
      {!hideOptions && (
        <div className="mt-5 space-y-3">
          {puzzle.options.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              selected={answer === option.id}
              onClick={readonly ? undefined : () => onChange(option.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
