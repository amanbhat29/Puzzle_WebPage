import React from "react";
import { Flag, Timer, X } from "lucide-react";
import { formatTimer } from "../utils/format";

export default function ProgressHeader({ current, total, elapsedSeconds, progressPercent, answeredCount }) {
  return (
    <header className="rounded-b-[20px] bg-saathi-green px-4 pb-4 pt-3 text-white shadow-saathi">
      <div className="flex items-center justify-between">
        <button className="grid h-9 w-9 place-items-center rounded-full bg-white/14 text-white" aria-label="Close puzzle">
          <X size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/16 px-4 py-1.5 text-xs font-extrabold">Q{current}/{total}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/16 px-3 py-1.5 text-xs font-extrabold">
            <Timer size={14} />
            {formatTimer(elapsedSeconds)}
          </span>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-full bg-white/14 text-white" aria-label="Flag question">
          <Flag size={18} />
        </button>
      </div>
      <div className="mt-3 h-2 rounded-full bg-white/20">
        <div className="h-full rounded-full bg-saathi-amber" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs font-bold text-white/72">
        <span>{Math.round(progressPercent)}%</span>
        <span>{answeredCount} answered</span>
      </div>
    </header>
  );
}
