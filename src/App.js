import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import components
import Modules from './components/Modules';
import ToolInterface from './components/ToolInterface';
import UserProfile from './components/UserProfile';
import NotFound from './components/NotFound';

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
      // Implement search functionality
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
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span>📧</span>
                <span>📱</span>
                <span>🐦</span>
                <span>📘</span>
              </div>
            </div>
            
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: '#2563eb' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link>
                <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>Profile</Link>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>About Us</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
              </div>
            </div>
            
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: '#2563eb' }}>Exams</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span>SSC CGL</span>
                <span>IBPS PO</span>
                <span>UPSC</span>
                <span>RRB NTPC</span>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid #e5e7eb',
            marginTop: '2rem',
            paddingTop: '1rem',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0 }}>
              © 2024 SarkariSuccess Hub. All rights reserved. Built with ❤️ for exam aspirants.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
