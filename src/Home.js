import React, { useState } from "react";
import "./sarkari-success.css";

// SVG LOGO from the reference site
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="16" fill="#2563eb"/>
    <rect x="6" y="16" width="6" height="8" rx="2" fill="#a7f3d0"/>
    <rect x="14" y="10" width="6" height="14" rx="2" fill="#7dd3fc"/>
    <rect x="22" y="6" width="6" height="18" rx="2" fill="#fef08a"/>
  </svg>
);

const categories = [
  {
    id: "performance-dashboard",
    title: "Performance Dashboard",
    icon: <Logo />,
    description: "Comprehensive tools for performance dashboard",
    tools: [
      { id: "test-tracker", name: "Test Tracker" },
      { id: "progress-analyzer", name: "Progress Analyzer" },
      { id: "rank-predictor", name: "Rank Predictor" },
      { id: "strength-weakness", name: "Strength & Weakness" },
      { id: "score-comparator", name: "Score Comparator" },
      { id: "performance-history", name: "Performance History" }
    ]
  },
  {
    id: "study-planning",
    title: "Study Planning",
    icon: (
      <span style={{ display: "inline-block" }}>
        <svg width="32" height="32" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="8" fill="#f3f4f6"/>
          <rect x="7" y="10" width="18" height="14" rx="2" fill="#7dd3fc"/>
          <rect x="9" y="12" width="14" height="10" rx="1" fill="#fff"/>
          <rect x="13" y="6" width="2" height="6" rx="1" fill="#a7f3d0"/>
          <rect x="17" y="6" width="2" height="6" rx="1" fill="#fef08a"/>
        </svg>
      </span>
    ),
    description: "Comprehensive tools for study planning",
    tools: [
      { id: "daily-scheduler", name: "Daily Scheduler" },
      { id: "exam-countdown", name: "Exam Countdown" },
      { id: "smart-revision", name: "Smart Revision" },
      { id: "goal-setter", name: "Goal Setter" },
      { id: "reminder-manager", name: "Reminder Manager" },
      { id: "study-timer", name: "Study Timer" },
      { id: "habit-tracker", name: "Habit Tracker" },
      { id: "syllabus-tracker", name: "Syllabus Tracker" }
    ]
  },
  {
    id: "practice-testing",
    title: "Practice & Testing",
    icon: (
      <span role="img" aria-label="bulb" style={{ fontSize: "2em" }}>💡</span>
    ),
    description: "Sharpen your skills with quizzes, mock tests, and practice questions.",
    tools: [
      { id: "quiz-generator", name: "Quiz Generator" },
      { id: "mock-test-center", name: "Mock Test Center" },
      { id: "previous-year-papers", name: "Previous Year Papers" },
      { id: "question-bank", name: "Question Bank" },
      { id: "speed-practice", name: "Speed Practice" },
      { id: "custom-test", name: "Custom Test" },
      { id: "mistake-review", name: "Mistake Review" },
      { id: "performance-leaderboard", name: "Performance Leaderboard" }
    ]
  },
  {
    id: "subject-mastery",
    title: "Subject Mastery",
    icon: (
      <span role="img" aria-label="books" style={{ fontSize: "2em" }}>📚</span>
    ),
    description: "Comprehensive tools for subject mastery",
    tools: [
      { id: "formula-bank", name: "Formula Bank" },
      { id: "vocabulary-builder", name: "Vocabulary Builder" },
      { id: "concept-explainer", name: "Concept Explainer" },
      { id: "topic-wise-notes", name: "Topic-wise Notes" },
      { id: "video-library", name: "Video Library" },
      { id: "mnemonic-helper", name: "Mnemonic Helper" },
      { id: "shortcut-tricks", name: "Shortcut Tricks" },
      { id: "practice-worksheets", name: "Practice Worksheets" }
    ]
  },
  {
    id: "ai-powered-tools",
    title: "AI-Powered Tools",
    icon: (
      <span role="img" aria-label="robot" style={{ fontSize: "2em" }}>🤖</span>
    ),
    description: "AI-powered generators, assistants, analytics, and more.",
    tools: [
      { id: "doubt-solver", name: "Doubt Solver" },
      { id: "essay-evaluator", name: "Essay Evaluator" },
      { id: "smart-flashcards", name: "Smart Flashcards" },
      { id: "practice-booster", name: "Practice Booster" },
      { id: "smart-analyzer", name: "Smart Analyzer" },
      { id: "adaptive-test", name: "Adaptive Test" },
      { id: "voice-qa", name: "Voice Q&A" },
      { id: "ai-note-maker", name: "AI Note Maker" }
    ]
  },
  {
    id: "exam-specific-prep",
    title: "Exam-Specific Prep",
    icon: (
      <span role="img" aria-label="building" style={{ fontSize: "2em" }}>🏛️</span>
    ),
    description: "Resources and strategies for UPSC, SSC, Banking, and more.",
    tools: [
      { id: "upsc-hub", name: "UPSC Hub" },
      { id: "ssc-master", name: "SSC Master" },
      { id: "banking-pro", name: "Banking Pro" },
      { id: "railway-expert", name: "Railway Expert" },
      { id: "defense-corner", name: "Defense Corner" },
      { id: "state-exams", name: "State Exams" },
      { id: "teaching-exams", name: "Teaching Exams" },
      { id: "other-exams", name: "Other Exams" }
    ]
  }
];

// Dashboard stats (replace with real data if available)
const stats = [
  {
    icon: <Logo />,
    label: "Current Streak",
    value: "7 days"
  },
  {
    icon: <span style={{ fontSize: 22 }}>🎯</span>,
    label: "Goals Completed",
    value: "3/5"
  },
  {
    icon: <span style={{ fontSize: 22 }}>📈</span>,
    label: "Avg Score",
    value: "78%"
  }
];

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Dark/Light theme toggler
  const handleThemeSwitch = () => {
    setTheme(theme === "light" ? "dark" : "light");
    document.body.classList.toggle("dark-mode");
  };

  return (
    <div className={`main-bg ${theme}`}>
      {/* --- HEADER --- */}
      <header className="custom-header">
        <div className="header-left">
          <span className="logo-icon"><Logo /></span>
          <span className="header-title-group">
            <span className="brand-main">SarkariSuccess Hub</span>
            <span className="brand-sub">Your Gateway to Government Job Success</span>
          </span>
        </div>
        <div className="header-right">
          <form className="search-form" onSubmit={e => e.preventDefault()}>
            <input
              className="search-input"
              type="text"
              placeholder="Search tools..."
            />
            <button type="submit" className="search-btn" tabIndex={-1}>
              <span role="img" aria-label="search">🔍</span>
            </button>
          </form>
          <button
            className="theme-switch-btn"
            aria-label="Switch theme"
            onClick={handleThemeSwitch}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {/* --- DASHBOARD --- */}
      <main className="main-content-flex">
        <div className="dashboard-left">
          <h1 className="welcome-title">Welcome to<br/>SarkariSuccess Hub</h1>
          <p className="welcome-comment">
            Your comprehensive platform for government exam preparation with AI-powered tools and analytics
          </p>
          <div className="dashboard-stats">
            {stats.map((stat, i) => (
              <div className="stat-card" key={i}>
                <span className="stat-icon">{stat.icon}</span>
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dashboard-right">
          <h2 className="choose-category-title">Choose Your Preparation Category</h2>
          <div className="categories-vertical">
            <div className="categories-list">
              {categories.map(cat => (
                <div
                  className={`category-card-vertical ${selectedCategory === cat.id ? "active" : ""}`}
                  key={cat.id}
                  tabIndex={0}
                  onClick={() => setSelectedCategory(cat.id)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedCategory(cat.id); }}
                  aria-label={cat.title}
                  aria-pressed={selectedCategory === cat.id}
                >
                  <span className="category-v-icon">{cat.icon}</span>
                  <span>
                    <span className="category-v-title">{cat.title}</span>
                    <span className="category-v-desc">{cat.description}</span>
                  </span>
                  <span className="category-v-tools">{cat.tools.length} Tools Available</span>
                </div>
              ))}
            </div>
            <div className="side-tools-list">
              {selectedCategory && (
                <div className="side-tools-card">
                  <h3 className="side-tools-title">
                    {(categories.find(c => c.id === selectedCategory) || {}).title}
                  </h3>
                  <ul className="side-tools-ul">
                    {(categories.find(c => c.id === selectedCategory) || {}).tools.map(tool =>
                      <li key={tool.id} tabIndex={0} className="side-tool-li"
                        onClick={() => window.location.href = `/tool/${tool.id}`}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') window.location.href = `/tool/${tool.id}`;
                        }}
                      >
                        <span className="side-tool-dot">•</span>
                        <span>{tool.name}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}