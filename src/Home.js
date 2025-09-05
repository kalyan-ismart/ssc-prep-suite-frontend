import React, { useState } from "react";
import "./sarkari-success.css";

// Sample icons (replace with SVGs or images if you have them)
const categoryIcons = {
  "Performance Dashboard": "📊",
  "Study Planning": "📅",
  "Practice & Testing": "💡",
  "Subject Mastery": "📚",
  "AI-Powered Tools": "🤖",
  "Exam-Specific Prep": "🏛️"
};

const categories = [
  {
    id: "performance-dashboard",
    title: "Performance Dashboard",
    icon: "📊",
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
    icon: "📅",
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
    icon: "💡",
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
    icon: "📚",
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
    icon: "🤖",
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
    icon: "🏛️",
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

const streak = 7;
const goalsCompleted = 3;
const totalGoals = 5;
const avgScore = 78;

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleThemeSwitch = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    document.body.classList.toggle("dark-mode");
  };

  return (
    <div className={`main-bg ${theme}`}>
      <header className="custom-header">
        <div className="header-left">
          <span className="logo-icon"> 
            {/* Replace with your SVG or image logo if available */}
            <svg height="28" viewBox="0 0 32 32" width="28"><circle cx="16" cy="16" r="16" fill="#2563eb"/><rect x="6" y="16" width="6" height="8" rx="2" fill="#a7f3d0"/><rect x="14" y="10" width="6" height="14" rx="2" fill="#7dd3fc"/><rect x="22" y="6" width="6" height="18" rx="2" fill="#fef08a"/></svg>
          </span>
          <span className="brand-text">
            <span className="brand-main">SarkariSuccess-Hub</span>
            <span className="brand-sub">Your comprehensive platform for government exam preparation with AI-powered tools and analytics</span>
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

      <main className="main-content-flex">
        <div className="dashboard-left">
          <h1 className="welcome-title">Welcome to<br/>SarkariSuccess Hub</h1>
          <p className="welcome-comment">
            Your comprehensive platform for government exam preparation with AI-powered tools and analytics
          </p>
          <div className="dashboard-stats">
            <div className="stat-card">
              <span className="stat-icon" style={{ background: "#7dd3fc" }}>
                <svg width="28" height="28" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#2563eb"/><rect x="6" y="16" width="6" height="8" rx="2" fill="#a7f3d0"/><rect x="14" y="10" width="6" height="14" rx="2" fill="#7dd3fc"/><rect x="22" y="6" width="6" height="18" rx="2" fill="#fef08a"/></svg>
              </span>
              <span className="stat-label">Current Streak</span>
              <span className="stat-value">{streak} days</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ background: "#fecaca" }}>
                <span style={{ fontSize: 20 }}>🎯</span>
              </span>
              <span className="stat-label">Goals Completed</span>
              <span className="stat-value">
                {goalsCompleted}/{totalGoals}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ background: "#ddd6fe" }}>
                <span style={{ fontSize: 20 }}>📈</span>
              </span>
              <span className="stat-label">Avg Score</span>
              <span className="stat-value">{avgScore}%</span>
            </div>
          </div>
        </div>
        <div className="dashboard-right">
          <h2 className="choose-category-title">Choose Your Preparation Category</h2>
          <div className="categories-vertical">
            <div className="categories-list">
              {categories.map((cat, idx) => (
                <div
                  className={`category-card-vertical ${selectedCategory === cat.id ? "active" : ""}`}
                  key={cat.id}
                  tabIndex={0}
                  onClick={() => setSelectedCategory(cat.id)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedCategory(cat.id); }}
                  aria-label={cat.title}
                  aria-pressed={selectedCategory === cat.id}
                >
                  <span className="category-v-icon">
                    {categoryIcons[cat.title] || cat.icon}
                  </span>
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