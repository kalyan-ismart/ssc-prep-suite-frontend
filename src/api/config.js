import axios from 'axios';

// Use environment variable or fallback to production URL
axios.defaults.baseURL =
  process.env.REACT_APP_API_URL ||
  'https://ssc-prep-suite-backend-123.onrender.com';

// Attach JWT token from localStorage to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
