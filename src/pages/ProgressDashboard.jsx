import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Target,
  Award,
  Clock,
  Flame,
  TrendingUp,
  TrendingDown,
  Lock,
  Calendar,
  Trash2,
  Brain,
  Activity,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { getStudentProgress, getPuzzleHistory, clearProgress } from "../utils/storage";

export default function ProgressDashboard() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Load progress and history on mount
  useEffect(() => {
    setProgress(getStudentProgress());
    // Get recent 10 attempts for the feed
    const rawHistory = getPuzzleHistory();
    // Sort chronological descending
    const sorted = [...rawHistory].sort((a, b) => b.timestamp - a.timestamp);
    setHistory(sorted);
  }, []);

  const handleReset = () => {
    clearProgress();
    setProgress(getStudentProgress());
    setHistory([]);
    setShowConfirmReset(false);
  };

  if (!progress) {
    return (
      <main className="saathi-screen flex items-center justify-center">
        <p className="text-saathi-muted font-bold animate-pulse">Loading progress...</p>
      </main>
    );
  }

  // Format dates for history items
  const formatDate = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Group achievements into unlocked and locked
  const unlockedAchievements = progress.achievements.filter((a) => a.unlocked);
  const lockedAchievements = progress.achievements.filter((a) => !a.unlocked);

  // Calculate stats for Personal Bests
  const personalBests = {};
  history.forEach((h) => {
    if (!personalBests[h.puzzleId]) {
      personalBests[h.puzzleId] = {
        puzzleTitle: h.puzzleTitle,
        category: h.category,
        bestScore: h.score,
        bestAccuracy: h.accuracy,
        bestTime: h.timeTaken
      };
    } else {
      const pb = personalBests[h.puzzleId];
      pb.bestScore = Math.max(pb.bestScore, h.score);
      pb.bestAccuracy = Math.max(pb.bestAccuracy, h.accuracy);
      // Best time means the fastest completion time, but only for successful/correct attempts
      if (h.accuracy === 100 || h.score > 0) {
        pb.bestTime = pb.bestTime ? Math.min(pb.bestTime, h.timeTaken) : h.timeTaken;
      }
    }
  });

  return (
    <main className="saathi-screen">
      <div className="phone-frame px-4 py-6 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* ── Header ── */}
          <header className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl hover:bg-saathi-line transition text-saathi-ink"
              aria-label="Back to home"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs font-bold text-saathi-indigo">Performance Center</p>
              <h1 className="text-2xl font-extrabold text-saathi-ink">My Progress</h1>
            </div>
          </header>

          {/* ── Student Profile Summary ── */}
          <section className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 shadow-card mb-6 animate-[brain-fade-in-up_0.4s_ease-out]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-saathi-indigo text-white rounded-full flex items-center justify-center text-xl font-black shadow-md">
                {progress.totalCompleted > 0 ? "🏆" : "🎓"}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-saathi-ink">Cognitive Explorer</h2>
                <p className="text-xs font-semibold text-saathi-muted uppercase tracking-wider">
                  Level {Math.floor(progress.totalCompleted / 3) + 1} Student
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-xl p-3 border border-saathi-line shadow-sm">
                <Target className="mx-auto text-saathi-indigo mb-1" size={18} />
                <span className="block text-lg font-black text-saathi-ink">{progress.avgAccuracy}%</span>
                <span className="text-[10px] font-bold text-saathi-muted uppercase tracking-wider">Avg Accuracy</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-saathi-line shadow-sm">
                <Trophy className="mx-auto text-saathi-green mb-1" size={18} />
                <span className="block text-lg font-black text-saathi-ink">{progress.totalCompleted}</span>
                <span className="text-[10px] font-bold text-saathi-muted uppercase tracking-wider">Puzzles</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-saathi-line shadow-sm">
                <Flame className="mx-auto text-saathi-red mb-1" size={18} />
                <span className="block text-lg font-black text-saathi-ink">
                  {progress.streak?.currentStreak || 0}
                </span>
                <span className="text-[10px] font-bold text-saathi-muted uppercase tracking-wider">Day Streak</span>
              </div>
            </div>
          </section>

          {/* ── Brain Score Section ── */}
          <section className="bg-white rounded-2xl p-5 border border-saathi-line shadow-card mb-6 animate-[brain-fade-in-up_0.5s_ease-out]">
            <h3 className="text-sm font-black text-saathi-ink uppercase tracking-wider mb-4 flex items-center gap-2">
              <Brain className="text-saathi-indigo" size={18} />
              Brain Score System
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Score Circular Ring */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#e7ece8"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="url(#indigoGrad)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * progress.brainScore) / 100}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-saathi-indigo">{progress.brainScore}</span>
                  <span className="text-[10px] font-bold text-saathi-muted uppercase tracking-wider">Overall</span>
                </div>
              </div>

              {/* Cognitive explanation */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-saathi-ink leading-relaxed">
                  Your Brain Score is calculated from your performance across all cognitive dimensions. 
                  Keep playing logic and brain challenge categories to boost your rank!
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="bg-saathi-indigoMint text-saathi-indigo text-[10px] font-bold px-2 py-1 rounded-full border border-indigo-100">
                    🔥 Longest Streak: {progress.streak?.longestStreak || 0}
                  </span>
                  <span className="bg-saathi-mintSoft text-saathi-green text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100">
                    ⏱️ Time Spent: {Math.round(progress.totalTimeSpent / 60)}m
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Cognitive Skill Dashboard ── */}
          <section className="bg-white rounded-2xl p-5 border border-saathi-line shadow-card mb-6 animate-[brain-fade-in-up_0.55s_ease-out]">
            <h3 className="text-sm font-black text-saathi-ink uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="text-saathi-amber" size={18} />
              Cognitive Skill Dashboard
            </h3>

            <div className="space-y-4">
              {[
                { name: "Speed", key: "speed", color: "bg-saathi-red", label: "Math Calculation Speed" },
                { name: "Accuracy", key: "accuracy", color: "bg-saathi-green", label: "Answer Precision" },
                { name: "Memory", key: "memory", color: "bg-saathi-indigo", label: "Pattern Recall" },
                { name: "Attention", key: "attention", color: "bg-saathi-violet", label: "Selective Concentration" },
                { name: "Reasoning", key: "reasoning", color: "bg-saathi-amber", label: "Logical Deduction" },
                { name: "Pattern Recognition", key: "patternRecognition", color: "bg-saathi-green", label: "Sequence Detection" },
                { name: "Focus", key: "focus", color: "bg-saathi-red", label: "Cognitive Focus Control" },
                { name: "Observation", key: "observation", color: "bg-saathi-cyan", label: "Visual Target Detection" },
                { name: "Cognitive Control", key: "cognitiveControl", color: "bg-saathi-violet", label: "Response Interference Control" },
                { name: "Analytical Thinking", key: "analytical", color: "bg-saathi-cyan", label: "Strategic Planning" },
                { name: "Mental Rotation", key: "mentalRotation", color: "bg-saathi-indigo", label: "Shape Manipulation" },
                { name: "Spatial Reasoning", key: "spatialReasoning", color: "bg-saathi-amber", label: "Geometric Analysis" },
                { name: "Direction Sense", key: "directionSense", color: "bg-saathi-green", label: "Compass Path Tracking" },
                { name: "Spatial Orientation", key: "spatialOrientation", color: "bg-saathi-violet", label: "Navigation Orientation" },
                { name: "Visual Processing", key: "visualProcessing", color: "bg-saathi-cyan", label: "Object Mirroring & Rotations" },
                { name: "Object Orientation", key: "objectOrientation", color: "bg-saathi-red", label: "Visual Object Transformation" }
              ].map((skill) => {
                const rating = progress.skills[skill.key] || 50;
                const change = progress.growth[skill.key] || 0;

                // Level labels based on rating
                let levelText = "Beginner";
                if (rating >= 85) levelText = "Elite Master";
                else if (rating >= 70) levelText = "Advanced";
                else if (rating >= 50) levelText = "Intermediate";

                return (
                  <div key={skill.key} className="border-b border-saathi-line pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-end mb-1">
                      <div>
                        <span className="text-sm font-extrabold text-saathi-ink">{skill.name}</span>
                        <span className="text-[10px] text-saathi-muted ml-2 font-medium">({skill.label})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-saathi-ink block">
                          {rating}/100 <span className="text-[10px] text-saathi-muted">({levelText})</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-saathi-line rounded-full overflow-hidden">
                        <div
                          className={`h-full ${skill.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${rating}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Cognitive Growth Report ── */}
          <section className="bg-white rounded-2xl p-5 border border-saathi-line shadow-card mb-6">
            <h3 className="text-sm font-black text-saathi-ink uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="text-saathi-cyan" size={18} />
              Weekly Growth Report
            </h3>
            <p className="text-xs font-semibold text-saathi-muted mb-4">
              Comparison between your current week's attempts and your historical baseline.
            </p>

            {Object.values(progress.growth).every((g) => g === 0) ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-dashed border-saathi-line">
                <p className="text-xs font-bold text-saathi-muted">
                  Collect more puzzle scores over different days to visualize your learning curve growth here!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Speed Sprint", val: progress.growth.speed, desc: "Calculation rate improvement" },
                  { label: "Precision Rate", val: progress.growth.accuracy, desc: "Accuracy calibration" },
                  { label: "Recall Retention", val: progress.growth.memory, desc: "Flash memory capacity" },
                  { label: "Reasoning Depth", val: progress.growth.reasoning, desc: "Logic mystery deduction" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-saathi-mintSoft border border-emerald-100 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-saathi-ink block">{item.label}</span>
                      <span className="text-[10px] text-saathi-muted font-medium">{item.desc}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      {item.val > 0 ? (
                        <span className="text-sm font-black text-saathi-green flex items-center gap-0.5">
                          <TrendingUp size={14} /> +{item.val}%
                        </span>
                      ) : item.val < 0 ? (
                        <span className="text-sm font-black text-saathi-red flex items-center gap-0.5">
                          <TrendingDown size={14} /> {item.val}%
                        </span>
                      ) : (
                        <span className="text-sm font-black text-saathi-muted">Stable (0%)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Personal Best System ── */}
          <section className="bg-white rounded-2xl p-5 border border-saathi-line shadow-card mb-6">
            <h3 className="text-sm font-black text-saathi-ink uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="text-saathi-green" size={18} />
              Personal Best Records
            </h3>

            {Object.keys(personalBests).length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-dashed border-saathi-line">
                <p className="text-xs font-bold text-saathi-muted">No records registered yet. Play a puzzle to set a personal best!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.values(personalBests).map((pb, idx) => (
                  <div key={idx} className="bg-saathi-mintSoft border border-saathi-line rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-extrabold text-saathi-ink">{pb.puzzleTitle}</span>
                      <span className="text-[10px] bg-white text-saathi-green border border-emerald-200 font-bold px-2 py-0.5 rounded-full uppercase">
                        {pb.category}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-saathi-muted block text-[10px]">Best Score</span>
                        <span className="font-bold text-saathi-ink">{pb.bestScore} pts</span>
                      </div>
                      <div>
                        <span className="text-saathi-muted block text-[10px]">Best Acc.</span>
                        <span className="font-bold text-saathi-ink">{pb.bestAccuracy}%</span>
                      </div>
                      <div>
                        <span className="text-saathi-muted block text-[10px]">Fastest Time</span>
                        <span className="font-bold text-saathi-ink">{pb.bestTime}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Achievements & Badges ── */}
          <section className="bg-white rounded-2xl p-5 border border-saathi-line shadow-card mb-6">
            <h3 className="text-sm font-black text-saathi-ink uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="text-saathi-indigo" size={18} />
              Unlocked Achievements ({unlockedAchievements.length}/{progress.achievements.length})
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {progress.achievements.map((badge) => (
                <div
                  key={badge.id}
                  className={`relative rounded-xl p-3 border text-center transition-all duration-300 ${
                    badge.unlocked
                      ? "bg-gradient-to-br from-indigo-50 to-white border-indigo-200 shadow-sm"
                      : "bg-gray-50 border-gray-100 opacity-60"
                  }`}
                >
                  {/* Lock Indicator overlay */}
                  {!badge.unlocked && (
                    <div className="absolute top-2 right-2 text-gray-400">
                      <Lock size={12} />
                    </div>
                  )}

                  <div className={`text-3xl mb-2 filter ${!badge.unlocked ? "grayscale opacity-50" : ""}`}>
                    {badge.emoji}
                  </div>
                  <h4 className="text-xs font-extrabold text-saathi-ink mb-1">{badge.title}</h4>
                  <p className="text-[9px] text-saathi-muted font-semibold leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Recent Activity Feed ── */}
          <section className="bg-white rounded-2xl p-5 border border-saathi-line shadow-card mb-6">
            <h3 className="text-sm font-black text-saathi-ink uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="text-saathi-red" size={18} />
              Recent Challenge Activity
            </h3>

            {history.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-dashed border-saathi-line">
                <p className="text-xs font-bold text-saathi-muted">No attempts logged yet. Get started by playing a puzzle!</p>
              </div>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {history.map((attempt, idx) => (
                    <li key={idx}>
                      <div className="relative pb-8">
                        {idx !== history.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-saathi-line"
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-saathi-indigoMint border border-indigo-100 flex items-center justify-center text-xs">
                              {attempt.puzzleId === 6 ? "⚡" :
                               attempt.puzzleId === 8 ? "🔍" :
                               attempt.puzzleId === 9 ? "🧠" :
                               attempt.puzzleId === 10 ? "👁️" :
                               attempt.puzzleId === 11 ? "🎨" :
                               attempt.puzzleId === 12 ? "📡" :
                               attempt.puzzleId === 13 ? "🔄" :
                               attempt.puzzleId === 14 ? "🧭" :
                               attempt.puzzleId === 15 ? "🪞" :
                               attempt.category === "logic" ? "🧩" : "🧠"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <p className="text-xs font-extrabold text-saathi-ink">
                              {attempt.puzzleTitle}{" "}
                              <span className="font-semibold text-saathi-muted">
                                ({attempt.score} pts, {attempt.accuracy}% Acc)
                              </span>
                            </p>
                            <p className="text-[10px] text-saathi-muted flex items-center gap-1 mt-0.5">
                              <Calendar size={10} />
                              {formatDate(attempt.timestamp)}
                              <span className="mx-1">•</span>
                              <Clock size={10} />
                              {attempt.timeTaken}s
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* ── Clear / Reset Progress ── */}
        <footer className="mt-8 border-t border-saathi-line pt-6">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-red-200 text-saathi-red hover:bg-red-50 font-bold rounded-xl text-xs transition duration-200"
            >
              <Trash2 size={14} />
              Reset My Study Data & Analytics
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs font-extrabold text-saathi-red mb-2 text-center">
                Are you sure? This action deletes all scores, history, and achievements forever.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleReset}
                  className="bg-saathi-red text-white py-2 px-3 rounded-lg text-xs font-bold hover:bg-red-600 transition"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="bg-white border border-saathi-line text-saathi-ink py-2 px-3 rounded-lg text-xs font-bold hover:bg-saathi-line transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </footer>
      </div>
    </main>
  );
}
