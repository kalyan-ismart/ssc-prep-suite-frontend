import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Modules from "./Modules";
import CategoryView from "./category-view.component";
import NotFound from "./NotFound";
import ToolInterface from "./ToolInterface";
import Analytics from "./Analytics";
import UserProfile from "./UserProfile";

// Full categories array
const categories = [
  {
    _id: "1",
    name: "Performance Dashboard",
    title: "Performance Dashboard",
    description: "Track your progress and analyze your strengths and weaknesses with interactive charts and analytics.",
    color: "#3B82F6",
    icon: "📊",
    tools: 6,
  },
  {
    _id: "2",
    name: "Study Planning",
    title: "Study Planning",
    description: "Plan your study with smart schedules, exam trackers, and revision planners.",
    color: "#8B5CF6",
    icon: "📅",
    tools: 8,
  },
  {
    _id: "3",
    name: "Practice & Testing",
    title: "Practice & Testing",
    description: "Sharpen your skills with quizzes, mock tests, and practice questions.",
    color: "#10B981",
    icon: "💡",
    tools: 8,
  },
  {
    _id: "4",
    name: "Subject Mastery",
    title: "Subject Mastery",
    description: "Master every subject with detailed explanations, formula banks, and vocabulary builders.",
    color: "#F59E0B",
    icon: "📚",
    tools: 8,
  },
  {
    _id: "5",
    name: "AI-Powered Tools",
    title: "AI-Powered Tools",
    description: "Boost your preparation with AI-based generators, assistants, and smart analytics.",
    color: "#06B6D4",
    icon: "🤖",
    tools: 8,
  },
  {
    _id: "6",
    name: "Exam-Specific Prep",
    title: "Exam-Specific Prep",
    description: "Get focused resources and strategies for UPSC, SSC, Banking, and more.",
    color: "#EF4444",
    icon: "🏛️",
    tools: 8,
  },
];

function App() {
  // THEME STATE
  const [theme, setTheme] = useState(
    localStorage.getItem("sarkari-success-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
  );

  // THEME TOGGLE
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-color-scheme", newTheme);
    localStorage.setItem("sarkari-success-theme", newTheme);
  };

  return (
    <Router>
      <Routes>
        <Route
          path=""
          element={<Modules theme={theme} onThemeToggle={toggleTheme} />}
        />
        <Route
          path="/modules/category/:categoryId"
          element={<CategoryView categories={categories} tools={[]} apiBase="" />}
        />
        <Route
          path="/tool/:toolId"
          element={<ToolInterface />}
        />
        <Route
          path="/analytics"
          element={<Analytics />}
        />
        <Route
          path="/profile"
          element={<UserProfile />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;