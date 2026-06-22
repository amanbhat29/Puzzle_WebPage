import React from "react";
import { Check, X } from "lucide-react";

export default function OptionCard({ option, selected = false, state = "neutral", onClick }) {
  const isCorrect = state === "correct";
  const isWrong = state === "wrong";
  const stateClass = isCorrect
    ? "border-emerald-400 bg-emerald-50 text-saathi-green"
    : isWrong
      ? "border-red-400 bg-red-50 text-saathi-red"
      : selected
        ? "border-saathi-green bg-white text-saathi-green shadow-card"
        : "border-transparent bg-white/58 text-saathi-ink hover:border-saathi-green/40 hover:bg-white";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex min-h-[72px] w-full items-center gap-4 rounded-2xl border px-4 text-left text-sm font-semibold transition ${stateClass}`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold ${
          isCorrect || isWrong ? "bg-current text-white" : "bg-white text-saathi-ink"
        }`}
      >
        {isCorrect ? <Check size={18} className="text-white" /> : isWrong ? <X size={18} className="text-white" /> : option.label}
      </span>
      <span className="flex-1">{option.text}</span>
      {isCorrect && <Check size={24} className="text-saathi-green" />}
    </button>
  );
}
