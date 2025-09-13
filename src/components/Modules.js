import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categories } from "../data/categories";

export default function Modules() {
  const [openCategory, setOpenCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.map(category => ({
      ...category,
      tools: (category.tools || []).filter(tool =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.tools && category.tools.length > 0);

    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const handleCategoryClick = (categoryId) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  const handleToolClick = (categoryId, toolId, e) => {
    e.stopPropagation();
    navigate(`/tool/${categoryId}/${toolId}`);
  };

  return (
    <div className="main-bg">
      <div className="modules-main-content">
        <div className="modules-dashboard-left">
          <h1 className="welcome-title">Welcome to<br />SarkariSuccess Hub</h1>
          <p className="welcome-comment">
            Your comprehensive platform for government exam preparation with AI-powered tools and analytics
          </p>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#e0f2fe', color: '#0369a1'}}>📊</div>
              <div className="stat-label">Current Streak</div>
              <div className="stat-value">7 days</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#dcfce7', color: '#166534'}}>🎯</div>
              <div className="stat-label">Goals Completed</div>
              <div className="stat-value">3/5</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#fef3c7', color: '#d97706'}}>📈</div>
              <div className="stat-label">Avg Score</div>
              <div className="stat-value">78%</div>
            </div>
          </div>
        </div>

        <div className="modules-dashboard-right">
          <h2 className="choose-category-title">Choose Your Preparation Category</h2>
          <div className="search-container" style={{marginBottom: '1.5em'}}>
            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="modules-categories-vertical">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className={`category-card-vertical ${openCategory === cat.id ? 'open' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
                tabIndex={0}
                role="button"
              >
                <div className="category-vertical-row">
                  <span className="category-v-icon" role="img">{cat.icon}</span>
                  <div style={{flex: 1}}>
                    <div className="category-v-title">{cat.title}</div>
                    <div className="category-v-desc">{cat.description}</div>
                  </div>
                  <div className="category-v-tools">
                    {cat.tools ? cat.tools.length : 0} Tools Available
                  </div>
                </div>

                {openCategory === cat.id && (
                  <div className="tools-in-card">
                    <h4 className="tools-in-card-title">{cat.title} Tools</h4>
                    <ul className="tools-list">
                      {(cat.tools || []).map((tool) => (
                        <li
                          key={tool.id}
                          className="tool-in-card"
                          onClick={(e) => handleToolClick(cat.id, tool.id, e)}
                          tabIndex={0}
                          role="button"
                        >
                          <span className="tool-in-card-dot">•</span>
                          <div>
                            <div style={{fontWeight: '600'}}>{tool.name}</div>
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
        </div>
      </div>
    </div>
  );
}
