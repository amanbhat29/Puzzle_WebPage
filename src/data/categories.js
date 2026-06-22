export const CATEGORIES = [
  {
    id: "logic",
    icon: "🧩",
    title: "Logic & Strategy",
    description: "Develop logical thinking, strategy, planning, problem solving, and pattern recognition.",
    skills: ["Logical Thinking", "Strategy", "Planning", "Problem Solving", "Pattern Recognition"],
    accentColor: "saathi-green",
    accentBg: "bg-emerald-50",
    accentText: "text-saathi-green",
    accentBorder: "border-emerald-200"
  },
  {
    id: "brain",
    icon: "🧠",
    title: "Brain Training & Cognitive Skills",
    description: "Improve speed, accuracy, memory, attention, reasoning, and analytical thinking.",
    skills: ["Speed", "Accuracy", "Memory", "Attention", "Reasoning", "Analytical Thinking"],
    accentColor: "saathi-indigo",
    accentBg: "bg-indigo-50",
    accentText: "text-saathi-indigo",
    accentBorder: "border-indigo-200"
  }
];

export function getCategoryById(id) {
  return CATEGORIES.find((cat) => cat.id === id);
}
