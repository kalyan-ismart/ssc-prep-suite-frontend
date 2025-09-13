// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/sarkari-success.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import API from './apiService';

// Initialize SarkariSuccess-Hub logs
console.log('🏛️ SarkariSuccess-Hub - Comprehensive Government Exam Preparation Platform');
console.log('🚀 Platform Version: 2.0.0');
console.log('📚 Transforming SSC Prep Suite into SarkariSuccess-Hub');

// Attach JWT token from localStorage to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Create root and render App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Performance monitoring for SarkariSuccess-Hub
reportWebVitals((metric) => {
  console.log('📊 Performance Metric:', metric);
});

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('sarkari-success-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-color-scheme', savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-color-scheme', systemTheme);
  }
};
initializeTheme();
