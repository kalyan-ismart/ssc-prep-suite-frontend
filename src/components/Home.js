// src/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../apiService'; // CORRECTED IMPORT

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tools, setTools] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTools, setLoadingTools] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log('Fetching categories from backend...');
        const res = await api.get('/api/categories');
        console.log('Categories response:', res.data);
        
        const cats = res.data.data || res.data;
        setCategories(cats);
        
        if (cats.length) {
          setSelectedCategory(cats[0]._id);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
        setError(`Unable to load categories: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Fetch tools whenever selectedCategory changes
  useEffect(() => {
    if (!selectedCategory) return;

    async function fetchTools() {
      setLoadingTools(true);
      try {
        console.log(`Fetching tools for category: ${selectedCategory}`);
        const res = await api.get(`/api/categories/${selectedCategory}/tools`);
        console.log('Tools response:', res.data);
        
        setTools(res.data.data || res.data);
      } catch (err) {
        console.error('Failed to load tools', err);
        setError(`Unable to load tools: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoadingTools(false);
      }
    }
    fetchTools();
  }, [selectedCategory]);

  if (loadingCategories) {
    return (
      <div className="main-bg">
        <div className="modules-main-content">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-bg">
        <div className="modules-main-content">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error</h4>
            <p>{error}</p>
            <button 
              className="btn btn-outline-danger" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-bg">
      <div className="modules-main-content">
        {/* Left Dashboard */}
        <div className="modules-dashboard-left">
          <h1 className="welcome-title">Welcome to SarkariSuccess Hub</h1>
          <p className="welcome-comment">
            Your comprehensive platform for government exam preparation with AI-powered tools and analytics
          </p>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#e0f2fe', color: '#0369a1'}}>
                📊
              </div>
              <div className="stat-label">Categories</div>
              <div className="stat-value">{categories.length}</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#f0fdf4', color: '#15803d'}}>
                🛠️
              </div>
              <div className="stat-label">Available Tools</div>
              <div className="stat-value">{tools.length}</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#fef3c7', color: '#d97706'}}>
                🎯
              </div>
              <div className="stat-label">Active Goals</div>
              <div className="stat-value">5</div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="modules-dashboard-right">
          <h2 className="choose-category-title">Choose a Category</h2>
          
          <div className="modules-categories-vertical">
            {categories.map((category) => (
              <div 
                key={category._id}
                className={`category-card-vertical ${selectedCategory === category._id ? 'open' : ''}`}
                onClick={() => setSelectedCategory(category._id)}
                tabIndex={0}
              >
                <div className="category-vertical-row">
                  <span className="category-v-icon">{category.icon || '📚'}</span>
                  <div style={{ flex: 1 }}>
                    <div className="category-v-title">{category.name}</div>
                    <div className="category-v-desc">{category.description}</div>
                    <span className="category-v-tools">
                      {loadingTools ? 'Loading...' : `${tools.length} tools`}
                    </span>
                  </div>
                </div>
                
                {selectedCategory === category._id && tools.length > 0 && (
                  <div className="tools-in-card">
                    <h3 className="tools-in-card-title">Available Tools</h3>
                    <ul className="tools-list">
                      {tools.map((tool) => (
                        <li 
                          key={tool._id}
                          className="tool-in-card"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tool/${category._id}/${tool._id}`);
                          }}
                        >
                          <span className="tool-in-card-dot">●</span>
                          {tool.name}
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