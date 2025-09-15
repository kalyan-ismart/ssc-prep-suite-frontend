import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './styles/sarkari-success.css';
import './index.css';

// Import components
import Modules from './components/Modules';
import ToolInterface from './components/ToolInterface';
import UserProfile from './components/UserProfile';
import NotFound from './components/NotFound';
import Analytics from './components/Analytics';
import AuthPage from './components/AuthPage'; // NEW: Authentication page

// Import AI tool components
import AIStudyAssistant from './components/ai/AIStudyAssistant';
import DoubtSolver from './components/ai/DoubtSolver';
import QuestionGenerator from './components/ai/QuestionGenerator';
import PerformancePredictor from './components/ai/PerformancePredictor';
import StudyRecommendation from './components/ai/StudyRecommendation';
import ContentSummarizer from './components/ai/ContentSummarizer';
import SmartFlashcards from './components/ai/SmartFlashcards';
import VoiceAssistant from './components/ai/VoiceAssistant';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize theme and authentication
  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('sarkari-success-theme');
    if (savedTheme) {
      const dark = savedTheme === 'dark';
      setIsDarkMode(dark);
      document.body.className = dark ? 'dark-mode' : '';
    } else {
      const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefers);
      document.body.className = prefers ? 'dark-mode' : '';
    }

    // Check authentication status
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
        handleLogout();
      }
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
      // You can implement search functionality here
      // navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return (
        <div className="container mt-5 text-center">
          <div className="alert alert-warning">
            <h4>🔒 Authentication Required</h4>
            <p>Please log in to access this feature.</p>
            <Link to="/auth" className="btn btn-primary">
              Login / Register
            </Link>
          </div>
        </div>
      );
    }
    return children;
  };

  return (
    <div className={`main-bg ${isDarkMode ? 'dark' : ''}`}>
      {/* Header Navigation */}
      <header className="custom-header">
        <div className="header-left">
          <div className="logo-icon">🏛️</div>
          <div className="header-title-group">
            <Link to="/" className="brand-main" style={{ textDecoration: 'none' }}>
              SarkariSuccess
            </Link>
            <div className="brand-sub">Your Gateway to Government Job Success</div>
          </div>
        </div>

        <div className="header-right">
          {/* Search Form */}
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

          {/* Theme Toggle */}
          <button
            className="theme-switch-btn"
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>

          {/* Authentication Navigation */}
          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-2">
              <Link to="/profile" className="btn btn-outline-primary btn-sm">
                👤 {user?.username || 'Profile'}
              </Link>
              <button 
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm"
              >
                🚪 Logout
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-sm">
              🔐 Login
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Routes */}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Modules />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />

          {/* Tool Routes */}
          <Route path="/tool/:categoryId/:toolId" element={<ToolInterface />} />

          {/* AI Tool Routes - Protected */}
          <Route 
            path="/tool/ai-powered-tools/ai-study-assistant" 
            element={
              <ProtectedRoute>
                <AIStudyAssistant />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tool/ai-powered-tools/doubt-solver" 
            element={
              <ProtectedRoute>
                <DoubtSolver />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tool/ai-powered-tools/question-generator" 
            element={
              <ProtectedRoute>
                <QuestionGenerator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tool/ai-powered-tools/performance-predictor" 
            element={
              <ProtectedRoute>
                <PerformancePredictor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tool/ai-powered-tools/study-recommendation" 
            element={
              <ProtectedRoute>
                <StudyRecommendation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tool/ai-powered-tools/content-summarizer" 
            element={
              <ProtectedRoute>
                <ContentSummarizer />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tool/ai-powered-tools/smart-flashcards" 
            element={
              <ProtectedRoute>
                <SmartFlashcards />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tool/ai-powered-tools/voice-assistant" 
            element={
              <ProtectedRoute>
                <VoiceAssistant />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="mt-5 py-4 border-top text-center">
        <div className="container">
          <div className="row">
            <div className="col-md-6 text-md-start">
              <h5>SarkariSuccess Hub</h5>
              <p className="text-muted">
                Comprehensive government exam preparation platform
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex justify-content-md-end justify-content-center gap-3">
                <Link to="/" className="text-decoration-none">Home</Link>
                {isAuthenticated && (
                  <>
                    <Link to="/profile" className="text-decoration-none">Profile</Link>
                    <Link to="/analytics" className="text-decoration-none">Analytics</Link>
                  </>
                )}
                <Link to="/auth" className="text-decoration-none">
                  {isAuthenticated ? 'Switch Account' : 'Login'}
                </Link>
              </div>
            </div>
          </div>
          <hr />
          <div className="text-center text-muted">
            <small>
              &copy; 2025 SarkariSuccess Hub. Empowering your government job preparation journey.
            </small>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;