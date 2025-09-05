import React from "react";
import "./sarkari-success.css";
import { Link } from "react-router-dom";

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

const quickStats = [
  {
    label: "Total Users",
    value: "6,200+",
    color: "#3B82F6",
    icon: "🧑‍🎓",
  },
  {
    label: "Mock Tests",
    value: "180+",
    color: "#8B5CF6",
    icon: "📝",
  },
  {
    label: "Questions Solved",
    value: "95,000+",
    color: "#10B981",
    icon: "❓",
  },
  {
    label: "Success Rate",
    value: "92%",
    color: "#F59E0B",
    icon: "🏆",
  },
];

const upcomingExams = [
  {
    name: "SSC CGL Tier 1",
    date: "2025-11-10",
    daysLeft: 66,
  },
  {
    name: "UPSC Prelims",
    date: "2025-06-15",
    daysLeft: 283,
  },
  {
    name: "Bank PO Mains",
    date: "2025-10-05",
    daysLeft: 30,
  },
];

export default function Modules({ theme, onThemeToggle }) {
  return (
    <div className="main-content fade-in">
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <div className="logo flex flex-col">
            <h1>SarkariSuccess-Hub</h1>
            <p className="text-muted" style={{ marginTop: 6 }}>
              All-in-One Govt. Exam Preparation Suite
            </p>
          </div>
          <div className="header-actions">
            <form className="search-form" onSubmit={e => e.preventDefault()}>
              <input
                className="search-input"
                type="text"
                placeholder="Search tools, exams..."
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </form>
            <button className="theme-toggle" title="Toggle theme" onClick={onThemeToggle}>
              {theme === "dark" ? "🌞" : "🌚"}
            </button>
          </div>
        </div>
        <nav className="container nav-links mt-8">
          <Link to="/modules" className="nav-link">Dashboard</Link>
          <a href="#categories" className="nav-link">Categories</a>
          <a href="#exams" className="nav-link">Upcoming Exams</a>
          <Link to="/analytics" className="nav-link">Analytics</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
        </nav>
      </header>

      {/* Welcome/Stats */}
      <section className="welcome-section container mt-24 mb-24">
        <h2>Welcome to SarkariSuccess-Hub</h2>
        <p>
          Your one-stop solution for all government exam preparation – plan, practice, and perform at your best with our AI-powered suite.
        </p>
        <div className="quick-stats mt-24">
          {quickStats.map((stat, i) => (
            <div className="stat-card" style={{ borderLeft: `4px solid ${stat.color}` }} key={i}>
              <div className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <h4>{stat.label}</h4>
                <p>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section container mt-24 mb-24" id="categories">
        <h2>Explore Preparation Modules</h2>
        <div className="categories-grid mt-24">
          {categories.map(category => (
            <Link
              key={category._id}
              className="category-card"
              style={{
                "--category-color": category.color,
              }}
              to={`/modules/category/${category._id}`}
            >
              <div className="category-header">
                <span
                  className="category-icon"
                  style={{
                    color: category.color,
                  }}
                >
                  {category.icon}
                </span>
                <span className="category-title">{category.title}</span>
              </div>
              <div className="category-description">{category.description}</div>
              <div className="tools-count">
                {category.tools} Tools Available
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Exams */}
      <section className="upcoming-exams container" id="exams">
        <h3>Upcoming Major Exams</h3>
        <div className="exam-list mt-16">
          {upcomingExams.map((exam, idx) => (
            <div className="exam-item" key={idx}>
              <div className="exam-info">
                <h4>{exam.name}</h4>
                <p>
                  Exam Date:{" "}
                  {new Date(exam.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="days-left">{exam.daysLeft} days left</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container text-center mt-24 mb-8" style={{ opacity: 0.8 }}>
        <span>
          © {new Date().getFullYear()} SarkariSuccess-Hub • Built for exam warriors.
        </span>
      </footer>
    </div>
  );
}