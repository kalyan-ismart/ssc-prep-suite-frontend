import API from '../services/api';

// Authentication
export const register = (data) => API.post('/api/users/register', data);
export const login = (data) => API.post('/api/users/login', data);

// User Profile
export const getProfile = () => API.get('/api/users/profile/me');
export const updateProfile = (id, data) => API.post(`/api/users/update/${id}`, data);

// Categories & Tools
export const getCategories = () => API.get('/api/categories');
export const getCategoryTools = (categoryId) =>
  API.get(`/api/categories/${categoryId}/tools`);
export const getTool = (id) => API.get(`/api/tools/${id}`);

// Progress & Analytics
export const getAnalytics = (userId) =>
  API.get(`/api/progress/analytics/${userId}`);
export const updateProgress = (userId, data) =>
  API.post(`/api/progress/update/${userId}`, data);

// Quizzes
export const getQuizzes = () => API.get('/api/quizzes');
export const getQuiz = (id) => API.get(`/api/quizzes/${id}`);
export const submitQuiz = (id, answers) =>
  API.post(`/api/quizzes/${id}/submit`, answers);

export default API;
