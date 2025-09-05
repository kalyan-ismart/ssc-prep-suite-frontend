import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// This component expects to receive the full "categories" array as a prop,
// and each category must have _id, name, description, color, icon, etc.

export default function CategoryView({ categories, tools, apiBase }) {
  const { categoryId } = useParams();
  const [categoryData, setCategoryData] = useState(null);
  const [categoryTools, setCategoryTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample tools data for each category (demo purposes)
  const sampleToolsData = {
    '1': [
      { id: 'performance-analytics', name: 'Performance Analytics', description: 'Interactive charts showing score trends and subject performance', icon: '📊', type: 'analytics' },
      { id: 'ai-mock-test', name: 'AI Mock Test Generator', description: 'Create customized mock tests with AI-powered questions', icon: '🤖', type: 'quiz' },
      { id: 'daily-goals', name: 'Daily Goals Tracker', description: 'Set and track daily study goals with streak counter', icon: '🎯', type: 'tracker' },
      { id: 'progress-visualizer', name: 'Progress Visualizer', description: 'Visual progress tracking with completion percentages', icon: '📈', type: 'analytics' },
      { id: 'weak-area-identifier', name: 'Weak Area Identifier', description: 'Identify and focus on areas needing improvement', icon: '🔍', type: 'assessment' },
      { id: 'study-streak', name: 'Study Streak Counter', description: 'Track consecutive study days with motivational badges', icon: '🔥', type: 'tracker' }
    ],
    '2': [
      { id: 'study-planner', name: 'Smart Study Planner', description: 'Create personalized study schedules with calendar integration', icon: '📅', type: 'planner' },
      { id: 'exam-schedule', name: 'Exam Schedule Tracker', description: 'Track important exam dates and deadlines', icon: '⏰', type: 'planner' },
      { id: 'syllabus-tracker', name: 'Syllabus Progress Tracker', description: 'Monitor completion status across all subjects', icon: '📋', type: 'tracker' },
      { id: 'time-management', name: 'Time Management Tool', description: 'Pomodoro timer with break reminders', icon: '⏱️', type: 'utility' },
      { id: 'goal-setting', name: 'Goal Setting Interface', description: 'Set SMART goals for exam preparation', icon: '🎯', type: 'planner' },
      { id: 'revision-scheduler', name: 'Revision Scheduler', description: 'Automated revision planning with spaced repetition', icon: '📚', type: 'planner' },
      { id: 'session-logger', name: 'Study Session Logger', description: 'Track study time and session notes', icon: '📝', type: 'tracker' },
      { id: 'performance-forecaster', name: 'Performance Forecaster', description: 'Predict exam scores based on current performance', icon: '🔮', type: 'analytics' }
    ],
    '3': [
      { id: 'quick-quiz', name: 'Quick Quiz Generator', description: 'Generate instant MCQ practice questions', icon: '❓', type: 'quiz' },
      { id: 'mock-simulator', name: 'Full Mock Test Simulator', description: 'Complete mock tests with real exam environment', icon: '💻', type: 'simulator' },
      { id: 'previous-papers', name: 'Previous Year Papers', description: 'Access categorized database of past exam questions', icon: '📄', type: 'database' },
      { id: 'speed-test', name: 'Speed Test Challenge', description: 'Timed question solving for speed improvement', icon: '⚡', type: 'practice' },
      { id: 'sectional-tests', name: 'Sectional Practice Tests', description: 'Subject-wise focused practice sessions', icon: '📖', type: 'practice' },
      { id: 'error-analysis', name: 'Error Analysis Tool', description: 'Analyze mistakes and get improvement suggestions', icon: '🔍', type: 'analytics' },
      { id: 'adaptive-testing', name: 'Adaptive Testing', description: 'Tests that adjust difficulty based on performance', icon: '🧠', type: 'assessment' },
      { id: 'test-analytics', name: 'Test Performance Analytics', description: 'Detailed analysis of practice test results', icon: '📊', type: 'analytics' }
    ],
    '4': [
      { id: 'quant-solver', name: 'Quantitative Aptitude Solver', description: 'Step-by-step solutions for math problems', icon: '🔢', type: 'utility' },
      { id: 'reasoning-solver', name: 'Reasoning Problem Solver', description: 'Logical reasoning with detailed explanations', icon: '🧩', type: 'utility' },
      { id: 'grammar-checker', name: 'English Grammar Checker', description: 'Real-time grammar checking and corrections', icon: '✍️', type: 'utility' },
      { id: 'current-affairs', name: 'Current Affairs Digest', description: 'Daily current affairs updates with quiz', icon: '📰', type: 'database' },
      { id: 'gk-database', name: 'General Knowledge Database', description: 'Comprehensive searchable GK content', icon: '🌍', type: 'database' },
      { id: 'formula-bank', name: 'Formula Bank', description: 'Quick reference for important formulas', icon: '📐', type: 'database' },
      { id: 'concept-explainer', name: 'Concept Explainer', description: 'Visual explanations with diagrams', icon: '💡', type: 'interactive' },
      { id: 'vocabulary-builder', name: 'Vocabulary Builder', description: 'Advanced vocabulary with spaced repetition', icon: '📚', type: 'interactive' }
    ],
    '5': [
      { id: 'ai-assistant', name: 'AI Study Assistant', description: 'Conversational AI for study guidance', icon: '🤖', type: 'ai-assistant' },
      { id: 'question-generator', name: 'Smart Question Generator', description: 'AI-generated practice questions', icon: '❓', type: 'ai-assistant' },
      { id: 'study-recommendations', name: 'Personalized Study Recommendations', description: 'AI-based study plan suggestions', icon: '💡', type: 'ai-assistant' },
      { id: 'doubt-resolver', name: 'AI Doubt Resolver', description: 'Instant explanations for doubts', icon: '🔍', type: 'ai-assistant' },
      { id: 'essay-assistant', name: 'Essay Writing Assistant', description: 'AI-powered essay scoring and feedback', icon: '✍️', type: 'ai-assistant' },
      { id: 'interview-simulator', name: 'Interview Simulator', description: 'Practice interviews with AI feedback', icon: '🎤', type: 'simulator' },
      { id: 'career-guidance', name: 'Career Guidance Chatbot', description: 'Post-selection career advice', icon: '🧭', type: 'ai-assistant' },
      { id: 'performance-predictor', name: 'Performance Predictor', description: 'ML-based exam score prediction', icon: '🔮', type: 'ai-assistant' }
    ],
    '6': [
      { id: 'upsc-hub', name: 'UPSC Preparation Hub', description: 'Comprehensive UPSC resources and materials', icon: '🏛️', type: 'database' },
      { id: 'ssc-toolkit', name: 'SSC CGL Toolkit', description: 'Specialized SSC CGL preparation tools', icon: '📋', type: 'database' },
      { id: 'banking-center', name: 'Banking Exam Center', description: 'Banking sector specific preparation', icon: '🏦', type: 'database' },
      { id: 'railway-resources', name: 'Railway Exam Resources', description: 'Technical railway exam preparation', icon: '🚂', type: 'database' },
      { id: 'state-psc', name: 'State PSC Preparation', description: 'State-wise PSC exam resources', icon: '🏢', type: 'database' },
      { id: 'defense-prep', name: 'Defense Exam Prep', description: 'Military and defense exam preparation', icon: '⚔️', type: 'database' },
      { id: 'teaching-resources', name: 'Teaching Exam Resources', description: 'Education sector job preparation', icon: '👩‍🏫', type: 'database' },
      { id: 'police-prep', name: 'Police Exam Preparation', description: 'Law enforcement exam resources', icon: '👮', type: 'database' }
    ]
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Find the category from the provided categories
      const category = categories.find(cat => String(cat._id) === String(categoryId));
      if (!category) {
        setError('Category not found');
        setLoading(false);
        return;
      }

      setCategoryData(category);

      // Load sample tools for this category
      const toolsForCategory = sampleToolsData[categoryId] || [];
      const toolsWithCategory = toolsForCategory.map(tool => ({
        _id: tool.id,
        name: tool.name,
        description: tool.description,
        icon: tool.icon,
        toolType: tool.type,
        category: categoryId,
        categoryName: category.name,
        isActive: true,
        isComingSoon: true
      }));

      setCategoryTools(toolsWithCategory);
      setLoading(false);
    } catch (err) {
      setError('Error loading category data');
      setLoading(false);
    }
  }, [categoryId, categories]);

  const handleToolClick = (toolId) => {
    // For now, just show an alert
    alert(
      `${categoryTools.find(t => t._id === toolId)?.name || 'Tool'} - Coming Soon!\n\nThis advanced tool is under development and will be available in the next update.`
    );
  };

  const getToolTypeColor = (type) => {
    const colors = {
      'analytics': '#3B82F6',
      'quiz': '#10B981',
      'tracker': '#F59E0B',
      'planner': '#8B5CF6',
      'utility': '#06B6D4',
      'simulator': '#EF4444',
      'database': '#84CC16',
      'interactive': '#EC4899',
      'ai-assistant': '#F97316',
      'assessment': '#6366F1',
      'practice': '#14B8A6'
    };
    return colors[type] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h3>Loading category...</h3>
          <div className="spinner-border text-primary mt-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <h4>Error</h4>
          <p>{error}</p>
          <Link to="/modules" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h3>Category not found</h3>
          <Link to="/modules" className="btn btn-primary mt-3">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="category-view py-4">
      {/* Breadcrumb Navigation */}
      <div className="container">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/modules" className="text-decoration-none">
                🏠 Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {categoryData.icon} {categoryData.name}
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="category-header mb-5">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center mb-3">
                <span
                  className="category-icon me-3 p-3 rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{
                    fontSize: '2.5rem',
                    backgroundColor: `${categoryData.color}20`,
                    color: categoryData.color,
                    minWidth: '80px',
                    minHeight: '80px'
                  }}
                >
                  {categoryData.icon}
                </span>
                <div>
                  <h1 className="display-6 mb-2 fw-bold">{categoryData.name}</h1>
                  <p className="lead mb-0 text-muted">{categoryData.description}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="stat-badge">
                <span className="badge bg-primary fs-6 px-3 py-2">
                  {categoryTools.length} Tools Available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="tools-section">
          <div className="row g-4">
            {categoryTools.map(tool => (
              <div key={tool._id} className="col-md-6 col-lg-4">
                <div className="card tool-card h-100 shadow-sm border-0 position-relative overflow-hidden">
                  {/* Tool Type Badge */}
                  <div
                    className="position-absolute top-0 end-0 m-2 badge text-white"
                    style={{ backgroundColor: getToolTypeColor(tool.toolType) }}
                  >
                    {tool.toolType}
                  </div>

                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <span
                        className="tool-icon me-3 p-2 rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{
                          fontSize: '1.5rem',
                          backgroundColor: `${categoryData.color}15`,
                          color: categoryData.color,
                          minWidth: '50px',
                          minHeight: '50px'
                        }}
                      >
                        {tool.icon}
                      </span>
                      <h5 className="card-title mb-0 fw-bold">{tool.name}</h5>
                    </div>

                    <p className="card-text text-muted mb-4" style={{ minHeight: '60px' }}>
                      {tool.description}
                    </p>

                    {/* Features List */}
                    <div className="features-list mb-4">
                      <small className="text-muted d-block mb-2">Key Features:</small>
                      <div className="d-flex flex-wrap gap-1">
                        {tool.toolType === 'analytics' && (
                          <>
                            <span className="badge bg-light text-dark">Charts</span>
                            <span className="badge bg-light text-dark">Reports</span>
                            <span className="badge bg-light text-dark">Trends</span>
                          </>
                        )}
                        {tool.toolType === 'quiz' && (
                          <>
                            <span className="badge bg-light text-dark">MCQs</span>
                            <span className="badge bg-light text-dark">Timed</span>
                            <span className="badge bg-light text-dark">Scoring</span>
                          </>
                        )}
                        {tool.toolType === 'planner' && (
                          <>
                            <span className="badge bg-light text-dark">Calendar</span>
                            <span className="badge bg-light text-dark">Reminders</span>
                            <span className="badge bg-light text-dark">Goals</span>
                          </>
                        )}
                        {tool.toolType === 'ai-assistant' && (
                          <>
                            <span className="badge bg-light text-dark">AI-Powered</span>
                            <span className="badge bg-light text-dark">Chat</span>
                            <span className="badge bg-light text-dark">Smart</span>
                          </>
                        )}
                        {!['analytics', 'quiz', 'planner', 'ai-assistant'].includes(tool.toolType) && (
                          <>
                            <span className="badge bg-light text-dark">Interactive</span>
                            <span className="badge bg-light text-dark">Advanced</span>
                            <span className="badge bg-light text-dark">Efficient</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-footer bg-transparent border-0 p-4 pt-0">
                    <button
                      className="btn w-100 fw-bold position-relative"
                      style={{
                        backgroundColor: categoryData.color,
                        color: 'white',
                        opacity: tool.isComingSoon ? 0.7 : 1
                      }}
                      onClick={() => handleToolClick(tool._id)}
                      disabled={tool.isComingSoon}
                    >
                      {tool.isComingSoon ? (
                        <>
                          🚀 Coming Soon
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                            New
                          </span>
                        </>
                      ) : (
                        <>
                          🚀 Launch Tool
                        </>
                      )}
                    </button>

                    {/* Progress Bar for some tools */}
                    {tool.toolType === 'analytics' && (
                      <div className="mt-2">
                        <div className="progress" style={{ height: '4px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: '75%', backgroundColor: categoryData.color }}
                          ></div>
                        </div>
                        <small className="text-muted">Development: 75%</small>
                      </div>
                    )}

                    {tool.toolType === 'ai-assistant' && (
                      <div className="mt-2">
                        <div className="progress" style={{ height: '4px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: '60%', backgroundColor: categoryData.color }}
                          ></div>
                        </div>
                        <small className="text-muted">AI Training: 60%</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Stats */}
        <div className="category-stats mt-5">
          <div className="row">
            <div className="col-md-4">
              <div className="stat-card text-center p-4 border rounded">
                <h3 className="fw-bold" style={{ color: categoryData.color }}>
                  {categoryTools.length}
                </h3>
                <p className="mb-0 text-muted">Total Tools</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card text-center p-4 border rounded">
                <h3 className="fw-bold text-warning">
                  {categoryTools.filter(t => t.isComingSoon).length}
                </h3>
                <p className="mb-0 text-muted">Coming Soon</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card text-center p-4 border rounded">
                <h3 className="fw-bold text-success">
                  {categoryTools.filter(t => !t.isComingSoon).length}
                </h3>
                <p className="mb-0 text-muted">Available Now</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-5">
          <Link to="/modules" className="btn btn-outline-primary btn-lg">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Custom CSS for this component */}
      <style>{`
        .tool-card {
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        .tool-card:hover {
          transform: translateY(-5px);
          border-color: ${categoryData.color}30;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }
        .category-icon {
          transition: transform 0.3s ease;
        }
        .category-header:hover .category-icon {
          transform: scale(1.1);
        }
        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .progress-bar {
          transition: width 1s ease-in-out;
        }
      `}</style>
    </div>
  );
}