import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AttemptProvider } from "./context/AttemptContext";
import LandingPage from "./pages/LandingPage";
import MiniQueensPage from "./pages/MiniQueensPage";
import PuzzleAttemptPage from "./pages/PuzzleAttemptPage";
import ReviewPage from "./pages/ReviewPage";
import ResultPage from "./pages/ResultPage";
import ProgressDashboard from "./pages/ProgressDashboard";

// ── Brain Training Puzzle Pages ──
import MathReflexPage from "./pages/brain/MathReflexPage";
import LogicDetectivePage from "./pages/brain/LogicDetectivePage";
import RuleDiscoveryPage from "./pages/brain/RuleDiscoveryPage";
import MemoryFlashPage from "./pages/brain/MemoryFlashPage";
import BrainCircuitPage from "./pages/brain/BrainCircuitPage";
import FocusFilterPage from "./pages/brain/FocusFilterPage";
import StroopPage from "./pages/brain/StroopPage";
import VisualRadarPage from "./pages/brain/VisualRadarPage";
import ShapeRotationPage from "./pages/brain/ShapeRotationPage";
import DirectionNavigatorPage from "./pages/brain/DirectionNavigatorPage";
import MirrorDetectivePage from "./pages/brain/MirrorDetectivePage";

export default function App() {
  return (
    <AttemptProvider>
      <Routes>
        {/* ── Existing routes (unchanged) ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/queens" element={<MiniQueensPage />} />
        <Route path="/puzzle/:id" element={<PuzzleAttemptPage />} />
        <Route path="/review/:id" element={<ReviewPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/progress" element={<ProgressDashboard />} />

        {/* ── Brain Training routes (new) ── */}
        <Route path="/brain/math-reflex" element={<MathReflexPage />} />
        <Route path="/brain/logic-detective" element={<LogicDetectivePage />} />
        <Route path="/brain/rule-discovery" element={<RuleDiscoveryPage />} />
        <Route path="/brain/memory-flash" element={<MemoryFlashPage />} />
        <Route path="/brain/brain-circuit" element={<BrainCircuitPage />} />
        <Route path="/brain/focus-filter" element={<FocusFilterPage />} />
        <Route path="/brain/stroop" element={<StroopPage />} />
        <Route path="/brain/visual-radar" element={<VisualRadarPage />} />
        <Route path="/brain/shape-rotation" element={<ShapeRotationPage />} />
        <Route path="/brain/direction-navigator" element={<DirectionNavigatorPage />} />
        <Route path="/brain/mirror-detective" element={<MirrorDetectivePage />} />

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AttemptProvider>
  );
}
