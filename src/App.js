import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './styles/sarkari-success.css';
import './index.css';

// Import components
import Modules from './components/Modules';
import ToolInterface from './components/ToolInterface';
import UserProfile from './components/UserProfile';
import NotFound from './components/NotFound';
import Analytics from './components/Analytics';

// Import AI tool components
import AIStudyAssistant     from './components/ai/AIStudyAssistant';
import DoubtSolver         from './components/ai/DoubtSolver';
import QuestionGenerator   from './components/ai/QuestionGenerator';
import PerformancePredictor from './components/ai/PerformancePredictor';
import StudyRecommendation from './components/ai/StudyRecommendation';
import ContentSummarizer   from './components/ai/ContentSummarizer';
import SmartFlashcards     from './components/ai/SmartFlashcards';
import VoiceAssistant      from './components/ai/VoiceAssistant';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Initialize theme
    const saved = localStorage.getItem('sarkari-success-theme');
    if (saved) {
      const dark = saved === 'dark';
      setIsDarkMode(dark);
      document.body.className = dark ? 'dark-mode' : '';
    } else {
      const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefers);
      document.body.className = prefers ? 'dark-mode' : '';
    }
  }, []);

  const toggleTheme = () => {
    const next = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.body.className = next === 'dark' ? 'dark-mode' : '';
    localStorage.setItem('sarkari-success-theme', next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality here
    }
  };

  return (
    <Router>
      <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
        {/* Header */}
        <header className="custom-header">
          <div className="header-left">
            <span className="logo-icon">🏛️</span>
            <Link to="/" className="brand-main">SarkariSuccess</Link>
            <div className="brand-sub">Your Gateway to Government Job Success</div>
          </div>
          <div className="header-right">
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                placeholder="Search tools, exams, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">🔍</button>
            </form>
            <button
              className="theme-switch-btn"
              onClick={toggleTheme}
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <Link to="/profile" className="profile-btn">👤 Profile</Link>
          </div>
        </header>

        {/* Main Content Routes */}
        <main>
          <Routes>
            {/* The main dashboard route is active. All others are commented out for testing. */}
            <Route path="/" element={<Modules />} />

            {/*
            <Route path="/tool/:categoryId/:toolId" element={<ToolInterface />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/analytics" element={<Analytics />} />
            
            <Route path="/tool/ai-powered-tools/ai-study-assistant" element={<AIStudyAssistant />} />
            <Route path="/tool/ai-powered-tools/doubt-solver" element={<DoubtSolver />} />
            <Route path="/tool/ai-powered-tools/question-generator" element={<QuestionGenerator />} />
            <Route path="/tool/ai-powered-tools/performance-predictor" element={<PerformancePredictor />} />
            <Route path="/tool/ai-powered-tools/study-recommendation" element={<StudyRecommendation />} />
            <Route path="/tool/ai-powered-tools/content-summarizer" element={<ContentSummarizer />} />
            <Route path="/tool/ai-powered-tools/smart-flashcards" element={<SmartFlashcards />} />
            <Route path="/tool/ai-powered-tools/voice-assistant" element={<VoiceAssistant />} />
            */}
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="custom-footer">
          <div className="footer-content">
            <div>
              <h4>SarkariSuccess Hub</h4>
              <p>Comprehensive government exam preparation platform</p>
            </div>
            <div>
              <h4>Quick Links</h4>
              <Link to="/">Dashboard</Link>
              <Link to="/profile">Profile</Link>
            </div>
            <div>
              <h4>Exams</h4>
              <span>SSC CGL</span>
              <span>IBPS PO</span>
              <span>UPSC</span>
            </div>
          </div>
          <div className="footer-bottom">
            © 2024 SarkariSuccess Hub. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;