import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categories } from "../data/categories";

export default function Modules() {
  const [openCategory, setOpenCategory] = useState(null);
  const [openTool, setOpenTool] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const navigate = useNavigate();

  // Handle search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.map(category => ({
      ...category,
      // Safely handle cases where category.tools might not exist.
      tools: (category.tools || []).filter(tool =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.tools.length > 0);

    setFilteredCategories(filtered);
  }, [searchTerm]);

  const handleCategoryClick = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
    setOpenTool(null); // Close any open tools when switching categories
  };

  const handleToolClick = (categoryId, toolId, e) => {
    e.stopPropagation();
    navigate(`/tool/${categoryId}/${toolId}`);
  };

  const handleKeyDown = (e, action) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="main-bg">
      <div className="modules-main-content">
        {/* Left Dashboard */}
        <div className="modules-dashboard-left">
          <h1 className="welcome-title">Welcome to<br />SarkariSuccess Hub</h1>
          <p className="welcome-comment">
            Your comprehensive platform for government exam preparation with AI-powered tools and analytics
          </p>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#e0f2fe', color: '#0369a1'}}>投</div>
              <div className="stat-label">Current Streak</div>
              <div className="stat-value">7 days</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#dcfce7', color: '#166534'}}>識</div>
              <div className="stat-label">Goals Completed</div>
              <div className="stat-value">3/5</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#fef3c7', color: '#d97706'}}>嶋</div>
              <div className="stat-label">Avg Score</div>
              <div className="stat-value">78%</div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="modules-dashboard-right">
          <h2 className="choose-category-title">Choose Your Preparation Category</h2>
          
          {/* Search Bar */}
          <div className="search-container" style={{marginBottom: '1.5em'}}>
            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                padding: '0.75em 1em',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '1rem'
              }}
            />
          </div>

          <div className="modules-categories-vertical">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className={`category-card-vertical ${openCategory === cat.id ? 'open' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
                onKeyDown={(e) => handleKeyDown(e, () => handleCategoryClick(cat.id))}
                tabIndex={0}
                role="button"
                aria-expanded={openCategory === cat.id}
                aria-controls={`tools-${cat.id}`}
              >
                <div className="category-vertical-row">
                  <span className="category-v-icon" role="img" aria-label={cat.title}>
                    {cat.icon}
                  </span>
                  <div style={{flex: 1}}>
                    <div className="category-v-title">{cat.title}</div>
                    <div className="category-v-desc">{cat.description}</div>
                  </div>
                  {/* FIXED: The broken div element is now corrected. */}
                  <div className="category-v-tools">
                    {cat.tools.length} Tools Available
                  </div>
                </div>

                {/* Tools shown inside card */}
                {openCategory === cat.id && (
                  <div className="tools-in-card" id={`tools-${cat.id}`}>
                    <h4 className="tools-in-card-title">{cat.title} Tools</h4>
                    <ul className="tools-list">
                      {cat.tools.map((tool) => (
                        <li
                          key={tool.id}
                          className="tool-in-card"
                          onClick={(e) => handleToolClick(cat.id, tool.id, e)}
                          onKeyDown={(e) => handleKeyDown(e, () => handleToolClick(cat.id, tool.id, e))}
                          tabIndex={0}
                          role="button"
                          aria-label={`Open ${tool.name} - ${tool.description}`}
                        >
                          <span className="tool-in-card-dot" role="img" aria-hidden="true">窶｢</span>
                          <div>
                            <div style={{fontWeight: '600', marginBottom: '2px'}}>{tool.name}</div>
                            <div style={{fontSize: '0.9em', color: '#64748b'}}>{tool.description}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Show message if no results found */}
          {searchTerm && filteredCategories.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '2em',
              color: '#64748b',
              fontSize: '1.1em'
            }}>
              No tools found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}