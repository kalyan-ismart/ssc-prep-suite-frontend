import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/sarkari-success.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Initialize SarkariSuccess-Hub
console.log('🏛️ SarkariSuccess-Hub - Comprehensive Government Exam Preparation Platform');
console.log('🚀 Platform Version: 2.0.0');
console.log('📚 Transforming SSC Prep Suite into SarkariSuccess-Hub');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring for SarkariSuccess-Hub
reportWebVitals((metric) => {
  console.log('📊 Performance Metric:', metric);
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('❌ SW registration failed: ', registrationError);
      });
  });
}

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('sarkari-success-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-color-scheme', savedTheme);
    console.log('🎨 Theme initialized:', savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-color-scheme', systemTheme);
    localStorage.setItem('sarkari-success-theme', systemTheme);
    console.log('🎨 System theme detected and set:', systemTheme);
  }
};
initializeTheme();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const currentTheme = localStorage.getItem('sarkari-success-theme');
  if (!currentTheme) {
    const newTheme = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-color-scheme', newTheme);
    localStorage.setItem('sarkari-success-theme', newTheme);
    console.log('🎨 System theme changed to:', newTheme);
  }
});

// Global error handling
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', event.error);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
});

// Update page metadata
document.title = 'SarkariSuccess-Hub - Your Gateway to Government Job Success';
const metaDesc = document.querySelector('meta[name="description"]');
if (metaDesc) {
  metaDesc.setAttribute('content', 'Comprehensive government exam preparation platform with AI-powered tools, analytics, and resources for UPSC, SSC, Banking, Railways, and other competitive exams.');
} else {
  const desc = document.createElement('meta');
  desc.name = 'description';
  desc.content = 'Comprehensive government exam preparation platform with AI-powered tools, analytics, and resources for UPSC, SSC, Banking, Railways, and other competitive exams.';
  document.head.appendChild(desc);
}
const metaKeywords = document.querySelector('meta[name="keywords"]');
if (!metaKeywords) {
  const kws = document.createElement('meta');
  kws.name = 'keywords';
  kws.content = 'government jobs, SSC, UPSC, banking exams, railway exams, competitive exams, exam preparation, mock tests, study materials, AI tools';
  document.head.appendChild(kws);
}
