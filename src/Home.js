// src/Home.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getCategoryTools } from './services/api';

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
        const res = await getCategories();
        const cats = res.data.data;
        setCategories(cats);
        if (cats.length) {
          setSelectedCategory(cats[0]._id);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
        setError('Unable to load categories.');
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
        const res = await getCategoryTools(selectedCategory);
        setTools(res.data.data);
      } catch (err) {
        console.error('Failed to load tools', err);
        setError('Unable to load tools.');
      } finally {
        setLoadingTools(false);
      }
    }
    fetchTools();
  }, [selectedCategory]);

  if (loadingCategories) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <main className="modules-main-content">
      <section className="modules-dashboard-left">
        <h1 className="welcome-title">Welcome to SarkariSuccess Hub</h1>
        <p className="welcome-comment">
          Your comprehensive platform for government exam preparation with AI-powered tools
          and analytics
        </p>
        <h2 className="choose-category-title">Choose Your Preparation Category</h2>
        <div className="modules-categories-vertical">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className={
                'category-card-vertical' +
                (cat._id === selectedCategory ? ' open' : '')
              }
              tabIndex={0}
              onClick={() => setSelectedCategory(cat._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedCategory(cat._id);
                }
              }}
            >
              <div className="category-vertical-row">
                <span className="category-v-icon">{cat.icon}</span>
                <div>
                  <span className="category-v-title">{cat.name}</span>
                  <span className="category-v-desc">{cat.description}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="modules-dashboard-right">
        <h2 className="choose-category-title">
          {categories.find((c) => c._id === selectedCategory)?.name}
        </h2>
        {loadingTools ? (
          <div>Loading tools...</div>
        ) : (
          <div className="tools-list">
            {tools.map((tool) => (
              <div
                key={tool._id}
                className="tool-in-card"
                tabIndex={0}
                onClick={() => navigate(`/tool/${tool._id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/tool/${tool._id}`);
                  }
                }}
              >
                <span className="tool-in-card-dot">•</span>
                {tool.name}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
