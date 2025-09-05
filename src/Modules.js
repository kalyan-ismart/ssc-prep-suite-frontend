import React, { useState } from "react";
import "./sarkari-success.css";

const modules = [
  {
    id: "performance-dashboard",
    title: "Performance Dashboard",
    icon: "📊",
    description:
      "Track your progress and analyze your strengths and weaknesses with interactive charts and analytics.",
    tools: [
      { id: "test-tracker", name: "Test Tracker", description: "Track all your attempted mock tests and analyze performance." },
      { id: "progress-analyzer", name: "Progress Analyzer", description: "Visualize your learning curve with dynamic charts." },
      { id: "rank-predictor", name: "Rank Predictor", description: "Estimate your rank based on performance and peer data." },
      { id: "strength-weakness", name: "Strength & Weakness", description: "Identify your weak and strong areas in each subject." },
      { id: "score-comparator", name: "Score Comparator", description: "Compare your scores with the topper and average." },
      { id: "performance-history", name: "Performance History", description: "View your performance trend over time." }
    ]
  },
  {
    id: "study-planning",
    title: "Study Planning",
    icon: "📅",
    description:
      "Plan your study with smart schedules, exam trackers, and revision planners.",
    tools: [
      { id: "daily-scheduler", name: "Daily Scheduler", description: "Create and manage personalized daily study plans." },
      { id: "exam-countdown", name: "Exam Countdown", description: "Stay motivated with live countdowns to your upcoming exams." },
      { id: "smart-revision", name: "Smart Revision", description: "AI-powered revision planner for effective study cycles." },
      { id: "goal-setter", name: "Goal Setter", description: "Set and track your short-term and long-term study goals." },
      { id: "reminder-manager", name: "Reminder Manager", description: "Get reminders for important study and exam dates." },
      { id: "study-timer", name: "Study Timer", description: "Use the Pomodoro technique and track focused study sessions." },
      { id: "habit-tracker", name: "Habit Tracker", description: "Build and maintain productive study habits." },
      { id: "syllabus-tracker", name: "Syllabus Tracker", description: "Monitor your syllabus completion in each subject." }
    ]
  },
  {
    id: "practice-testing",
    title: "Practice & Testing",
    icon: "💡",
    description:
      "Sharpen your skills with quizzes, mock tests, and practice questions.",
    tools: [
      { id: "quiz-generator", name: "Quiz Generator", description: "Generate topic-wise quizzes and practice questions." },
      { id: "mock-test-center", name: "Mock Test Center", description: "Attempt full-length mock tests and get instant results." },
      { id: "previous-year-papers", name: "Previous Year Papers", description: "Practice with actual papers from previous years." },
      { id: "question-bank", name: "Question Bank", description: "Access a large bank of categorized practice questions." },
      { id: "speed-practice", name: "Speed Practice", description: "Improve question-solving speed with time-bound drills." },
      { id: "custom-test", name: "Custom Test", description: "Create your own test by selecting topics and difficulty." },
      { id: "mistake-review", name: "Mistake Review", description: "Review and learn from mistakes made in previous tests." },
      { id: "performance-leaderboard", name: "Performance Leaderboard", description: "See where you stand among your peers." }
    ]
  },
  {
    id: "subject-mastery",
    title: "Subject Mastery",
    icon: "📚",
    description:
      "Master every subject with detailed explanations, formula banks, and vocabulary builders.",
    tools: [
      { id: "formula-bank", name: "Formula Bank", description: "Quick access to all important formulas, sorted by subject." },
      { id: "vocabulary-builder", name: "Vocabulary Builder", description: "Expand your vocabulary with daily word challenges." },
      { id: "concept-explainer", name: "Concept Explainer", description: "Get detailed explanations for tough topics." },
      { id: "topic-wise-notes", name: "Topic-wise Notes", description: "Concise notes for each subject and topic." },
      { id: "video-library", name: "Video Library", description: "Watch curated video lectures for better understanding." },
      { id: "mnemonic-helper", name: "Mnemonic Helper", description: "Remember facts easily with mnemonics." },
      { id: "shortcut-tricks", name: "Shortcut Tricks", description: "Learn time-saving tricks for calculations." },
      { id: "practice-worksheets", name: "Practice Worksheets", description: "Download printable worksheets for revision." }
    ]
  },
  {
    id: "ai-powered-tools",
    title: "AI-Powered Tools",
    icon: "🤖",
    description:
      "Boost your preparation with AI-based generators, assistants, and smart analytics.",
    tools: [
      { id: "doubt-solver", name: "Doubt Solver", description: "Ask any question and get instant AI explanations." },
      { id: "essay-evaluator", name: "Essay Evaluator", description: "Upload your essays for instant feedback and scores." },
      { id: "smart-flashcards", name: "Smart Flashcards", description: "AI-powered flashcards that adapt to your learning progress." },
      { id: "practice-booster", name: "Practice Booster", description: "Get AI-generated practice questions based on your weak topics." },
      { id: "smart-analyzer", name: "Smart Analyzer", description: "Advanced analytics and improvement suggestions." },
      { id: "adaptive-test", name: "Adaptive Test", description: "AI adjusts question difficulty as you answer." },
      { id: "voice-qa", name: "Voice Q&A", description: "Ask questions via voice and get instant answers." },
      { id: "ai-note-maker", name: "AI Note Maker", description: "Generate concise notes from study material uploads." }
    ]
  },
  {
    id: "exam-specific-prep",
    title: "Exam-Specific Prep",
    icon: "🏛️",
    description:
      "Get focused resources and strategies for UPSC, SSC, Banking, and more.",
    tools: [
      { id: "upsc-hub", name: "UPSC Hub", description: "All key resources and strategies for UPSC preparation." },
      { id: "ssc-master", name: "SSC Master", description: "Focused practice and tips for SSC exams." },
      { id: "banking-pro", name: "Banking Pro", description: "Tailored resources for Bank PO, Clerk & more." },
      { id: "railway-expert", name: "Railway Expert", description: "Specialized resources for Railway recruitment exams." },
      { id: "defense-corner", name: "Defense Corner", description: "Ace NDA, CDS, and other defense exams." },
      { id: "state-exams", name: "State Exams", description: "Guidance and practice for state-level exams." },
      { id: "teaching-exams", name: "Teaching Exams", description: "Resources for TET, CTET, and other teaching exams." },
      { id: "other-exams", name: "Other Exams", description: "Collection of tools for miscellaneous competitive exams." }
    ]
  }
];

export default function Modules() {
  const [expanded, setExpanded] = useState(null);

  const handleModuleClick = (moduleId) => {
    setExpanded(expanded === moduleId ? null : moduleId);
  };

  const handleToolClick = (tool) => {
    window.location.href = `/tool/${tool.id}`; // Use your router's navigation if available
  };

  return (
    <div className="main-content fade-in">
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
          </div>
        </div>
        <nav className="container nav-links mt-8">
          <a href="#dashboard" className="nav-link">Dashboard</a>
          <a href="#categories" className="nav-link">Categories</a>
          <a href="#exams" className="nav-link">Upcoming Exams</a>
          <a href="#analytics" className="nav-link">Analytics</a>
          <a href="#profile" className="nav-link">Profile</a>
        </nav>
      </header>
      <section className="modules-section container mt-24 mb-24" id="modules">
        <div className="modules-grid">
          {modules.map(module => (
            <div
              key={module.id}
              className={`module-card${expanded === module.id ? " expanded" : ""}`}
              tabIndex={0}
              onClick={() => handleModuleClick(module.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleModuleClick(module.id); }}
              aria-expanded={expanded === module.id}
              role="button"
            >
              <div className="module-card-header">
                <span className="module-icon">{module.icon}</span>
                <span className="module-title">{module.title}</span>
              </div>
              <div className="module-description">{module.description}</div>
              <div className="module-tools-count">
                <span>{module.tools.length} Tools Available</span>
              </div>
              {expanded === module.id && (
                <div className="module-tools-list">
                  {module.tools.map(tool => (
                    <div
                      key={tool.id}
                      className="tool-link-card"
                      tabIndex={0}
                      onClick={e => { e.stopPropagation(); handleToolClick(tool); }}
                      onKeyDown={e => {
                        if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                          e.stopPropagation();
                          handleToolClick(tool);
                        }
                      }}
                      role="button"
                      aria-label={tool.name}
                    >
                      <div className="tool-link-title">{tool.name}</div>
                      <div className="tool-link-description">{tool.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}