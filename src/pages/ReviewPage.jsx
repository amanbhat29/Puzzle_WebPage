import React from "react";
import { ArrowLeft, Flag } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";
import ReviewCard from "../components/ReviewCard";
import SecondaryButton from "../components/SecondaryButton";
import { useAttempt } from "../context/AttemptContext";
import { getPuzzleById } from "../data/puzzles";

export default function ReviewPage() {
  const { id = "1" } = useParams();
  const puzzle = getPuzzleById(id);
  const navigate = useNavigate();
  const { getAttempt } = useAttempt();

  if (!puzzle) return null;

  const attempt = getAttempt(puzzle.id);

  return (
    <main className="saathi-screen">
      <div className="phone-frame relative">
        <header className="flex items-center justify-between bg-white px-4 py-4">
          <button onClick={() => navigate(`/puzzle/${puzzle.id}`)} className="inline-flex items-center gap-2 text-sm font-extrabold text-saathi-ink">
            <ArrowLeft size={18} />
            Review Solutions
          </button>
          <Flag size={20} className="text-saathi-ink" />
        </header>
        <div className="flex gap-3 overflow-x-auto bg-white px-4 pb-3">
          {[1, 2, 3].map((item) => (
            <span
              key={item}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-sm font-extrabold ${
                item === 1 ? "border-saathi-blue bg-blue-100 text-saathi-green" : "border-saathi-blue bg-blue-100 text-blue-500"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
        <ReviewCard puzzle={puzzle} answer={attempt.answer} />
        <footer className="fixed inset-x-0 bottom-0 mx-auto grid max-w-md grid-cols-2 gap-3 border-t border-saathi-line bg-white px-4 py-3">
          <SecondaryButton onClick={() => navigate("/")}>Home</SecondaryButton>
          <PrimaryButton onClick={() => navigate(`/result/${puzzle.id}`)}>Finish</PrimaryButton>
        </footer>
      </div>
    </main>
  );
}
