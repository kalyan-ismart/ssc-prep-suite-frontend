// src/App.js
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
import AIStudyAssistant from './components/ai/AIStudyAssistant';
import DoubtSolver     from './components/ai/DoubtSolver';
import QuestionGenerator from './components/ai/QuestionGenerator';
import PerformancePredictor from './components/ai/PerformancePredictor';
import StudyRecommendation  from './components/ai/StudyRecommendation';
import ContentSummarizer    from './components/ai/ContentSummarizer';
import SmartFlashcards      from './components/ai/SmartFlashcards';
import VoiceAssistant       from './components/ai/VoiceAssistant';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('sarkari-success-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.body.className = savedTheme === 'dark' ? 'dark-mode' : '';
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      document.body.className = prefersDark ? 'dark-mode' : '';
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.body.className = newTheme === 'dark' ? 'dark-mode' : '';
    localStorage.setItem('sarkari-success-theme', newTheme);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <Router>
      <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
        {/* Header */}
        <header className="custom-header">
          <div className="header-left">
            <div className="logo-icon">
              <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>🏛️</span>
            </div>
            <div className="header-title-group">
              <Link to="/" style={{ textDecoration: 'none' }}>
                <div className="brand-main">SarkariSuccess</div>
                <div className="brand-sub">Your Gateway to Government Job Success</div>
              </Link>
            </div>
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
              <button type="submit" className="search-btn">
                🔍
              </button>
            </form>
            
            <button
              className="theme-switch-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            <Link
              to="/profile"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              👤 Profile
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<Modules />} />
            <Route path="/tool/:categoryId/:toolId" element={<ToolInterface />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/analytics" element={<Analytics />} />

            {/* AI-Powered Tools Routes */}
            <Route path="/tool/ai-powered-tools/ai-study-assistant" element={<AIStudyAssistant />} />
            <Route path="/tool/ai-powered-tools/doubt-solver" element={<DoubtSolver />} />
            <Route path="/tool/ai-powered-tools/question-generator" element={<QuestionGenerator />} />
            <Route path="/tool/ai-powered-tools/performance-predictor" element={<PerformancePredictor />} />
            <Route path="/tool/ai-powered-tools/study-recommendation" element={<StudyRecommendation />} />
            <Route path="/tool/ai-powered-tools/content-summarizer" element={<ContentSummarizer />} />
            <Route path="/tool/ai-powered-tools/smart-flashcards" element={<SmartFlashcards />} />
            <Route path="/tool/ai-powered-tools/voice-assistant" element={<VoiceAssistant />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{
          background: isDarkMode ? '#23272f' : '#fff',
          borderTop: '1px solid #e5e7eb',
          padding: '2rem 5vw',
          marginTop: '3rem',
          textAlign: 'center',
          color: isDarkMode ? '#f1f5f9' : '#64748b'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            textAlign: 'left'
          }}>
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: '#2563eb' }}>SarkariSuccess Hub</h4>
              <p style={{ margin: '0 0 1rem 0', lineHeight: '1.6' }}>
                Comprehensive government exam preparation platform with AI-powered tools and analytics.
              </p>
            </div>
            
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: '#2563eb' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link>
                <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>Profile</Link>
              </div>
            </div>
          </div>
          <p style={{ marginTop: '2rem' }}>© 2025 SarkariSuccess Hub. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
