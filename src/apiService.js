// src/apiService.js  
// Place this file directly in the src folder (NOT in components folder)

import axios from 'axios';

// Create axios instance with backend URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://ssc-prep-suite-backend-123.onrender.com',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Uncomment if you have a login route
      // window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error:', error.message);
    } else {
      console.error(`❌ API Error: ${error.response.status} ${error.response.data?.message || error.message}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;