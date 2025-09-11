import axios from 'axios';

// Set your backend base URL here
const API_BASE_URL = 'https://ssc-prep-suite-backend-123.onrender.com';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,          // 10 seconds timeout
  withCredentials: true,   // send cookies if needed
  headers: {
    'Content-Type': 'application/json',
  }
});

// Optional: Add response interceptors for global error handling
api.interceptors.response.use(
  response => response,
  error => {
    // You can customize error handling here
    if (error.response) {
      // Backend returned an error response
      console.error('API Error:', error.response.data.message || error.message);
    } else if (error.request) {
      // No response from backend
      console.error('No response from API server.');
    } else {
      // Other errors
      console.error('API request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
