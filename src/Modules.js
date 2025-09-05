import React, { useState } from "react";
import "./sarkari-success.css";

// SVG LOGO (matches reference)
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="16" fill="#2563eb"/>
    <rect x="6" y="16" width="6" height="8" rx="2" fill="#a7f3d0"/>
    <rect x="14" y="10" width="6" height="14" rx="2" fill="#7dd3fc"/>
    <rect x="22" y="6" width="6" height="18" rx="2" fill="#fef08a"/>
  </svg>
);

// Example subtools for demonstration
const subtoolsData = {
  "test-tracker": [
    { id: "attempted-tests", name: "Attempted Tests" },
    { id: "unattempted-tests", name: "Unattempted Tests" }
  ],
  "progress-analyzer": [
    { id: "daily-progress", name: "Daily Progress" },
    { id: "weekly-progress", name: "Weekly Progress" }
  ],
  "rank-predictor": [
    { id: "predict-by-score", name: "Predict by Score" },
    { id: "compare-with-peers", name: "Compare with Peers" }
  ],
  "daily-scheduler": [
    { id: "add-task", name: "Add Task" },
    { id: "view-schedule", name: "View Schedule" }
  ],
  "quiz-generator": [
    { id: "generate-random-quiz", name: "Random Quiz" },
    { id: "topic-wise-quiz", name: "Topic-wise Quiz" }
  ],
  // ...add subtools for other tool IDs as desired
};

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
    icon: <span role="img" aria-label="bulb" style={{ fontSize: "2em" }}>💡</span>,
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
    icon: <span role="img" aria-label="books" style={{ fontSize: "2em" }}>📚</span>,
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
    icon: <span role="img" aria-label="robot" style={{ fontSize: "2em" }}>🤖</span>,
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
    icon: <span role="img" aria-label="building" style={{ fontSize: "2em" }}>🏛️</span>,
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

export default function Modules() {
  const [theme, setTheme] = useState("light");
  const [openCategory, setOpenCategory] = useState(null);
  const [openTool, setOpenTool] = useState(null);

  const handleThemeSwitch = () => {
    setTheme(theme === "light" ? "dark" : "light");
    document.body.classList.toggle("dark-mode");
  };

  return (
    <div className={`main-bg ${theme}`}>
      {/* HEADER */}
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
            <input className="search-input" type="text" placeholder="Search tools..." />
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

      {/* DASHBOARD */}
      <main className="modules-main-content">
        <div className="modules-dashboard-left">
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
        <div className="modules-dashboard-right">
          <h2 className="choose-category-title">Choose Your Preparation Category</h2>
          <div className="modules-categories-vertical">
            {categories.map(cat => (
              <div
                className={`category-card-vertical${openCategory === cat.id ? " open" : ""}`}
                key={cat.id}
                tabIndex={0}
                aria-label={cat.title}
                onClick={() => {
                  setOpenCategory(openCategory === cat.id ? null : cat.id);
                  setOpenTool(null); // reset open tool when category changes
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setOpenCategory(openCategory === cat.id ? null : cat.id);
                    setOpenTool(null);
                  }
                }}
              >
                <div className="category-vertical-row">
                  <span className="category-v-icon">{cat.icon}</span>
                  <span>
                    <span className="category-v-title">{cat.title}</span>
                    <span className="category-v-desc">{cat.description}</span>
                  </span>
                  <span className="category-v-tools">{cat.tools.length} Tools Available</span>
                </div>
                {openCategory === cat.id && (
                  <div className="tools-in-card">
                    <h3 className="tools-in-card-title">{cat.title} Tools</h3>
                    <ul className="tools-list">
                      {cat.tools.map(tool =>
                        <li
                          key={tool.id}
                          className={`tool-in-card${openTool === tool.id ? " open" : ""}`}
                          tabIndex={0}
                          onClick={e => {
                            e.stopPropagation();
                            setOpenTool(openTool === tool.id ? null : tool.id);
                          }}
                          onKeyDown={e => {
                            if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                              e.stopPropagation();
                              setOpenTool(openTool === tool.id ? null : tool.id);
                            }
                          }}
                        >
                          <span className="tool-in-card-dot">•</span>
                          <span className="tool-in-card-name">{tool.name}</span>
                          {/* Subtools */}
                          {openTool === tool.id && Array.isArray(subtoolsData[tool.id]) && (
                            <ul className="subtools-list">
                              {subtoolsData[tool.id].map(subtool => (
                                <li
                                  key={subtool.id}
                                  className="subtool-in-card"
                                  tabIndex={0}
                                  onClick={e => {
                                    e.stopPropagation();
                                    window.location.href = `/tool/${tool.id}/${subtool.id}`;
                                  }}
                                  onKeyDown={e => {
                                    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                                      e.stopPropagation();
                                      window.location.href = `/tool/${tool.id}/${subtool.id}`;
                                    }
                                  }}
                                >
                                  <span className="subtool-dot">-</span>
                                  <span className="subtool-name">{subtool.name}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}