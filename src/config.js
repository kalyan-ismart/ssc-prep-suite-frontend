// API URL Configuration for CGL Prep Pro
// Priority: REACT_APP_API_URL env var > production detection > localhost fallback
const API_URL = (() => {
  // 1. Explicit env var (set in Netlify build settings)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/+$/, ''); // Remove trailing slashes
  }

  // 2. If running locally, use localhost backend
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }

  // 3. If deployed but no env var set, try same origin (for co-hosted setups)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // 4. Final fallback
  return 'http://localhost:5000';
})();

export default API_URL;
