import React, { useState } from "react";
import "./sarkari-success.css";

// SVG LOGO (same as reference)
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
    toolsCount: 6
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
    toolsCount: 8
  },
  {
    id: "practice-testing",
    title: "Practice & Testing",
    icon: <span role="img" aria-label="bulb" style={{ fontSize: "2em" }}>💡</span>,
    description: "Sharpen your skills with quizzes, mock tests, and practice questions.",
    toolsCount: 8
  },
  {
    id: "subject-mastery",
    title: "Subject Mastery",
    icon: <span role="img" aria-label="books" style={{ fontSize: "2em" }}>📚</span>,
    description: "Comprehensive tools for subject mastery",
    toolsCount: 8
  },
  {
    id: "ai-powered-tools",
    title: "AI-Powered Tools",
    icon: <span role="img" aria-label="robot" style={{ fontSize: "2em" }}>🤖</span>,
    description: "AI-powered generators, assistants, analytics, and more.",
    toolsCount: 8
  },
  {
    id: "exam-specific-prep",
    title: "Exam-Specific Prep",
    icon: <span role="img" aria-label="building" style={{ fontSize: "2em" }}>🏛️</span>,
    description: "Resources and strategies for UPSC, SSC, Banking, and more.",
    toolsCount: 8
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
                className="category-card-vertical"
                key={cat.id}
                tabIndex={0}
                aria-label={cat.title}
              >
                <span className="category-v-icon">{cat.icon}</span>
                <span>
                  <span className="category-v-title">{cat.title}</span>
                  <span className="category-v-desc">{cat.description}</span>
                </span>
                <span className="category-v-tools">{cat.toolsCount} Tools Available</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}