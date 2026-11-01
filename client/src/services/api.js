import axios from 'axios';

// Robust API Base URL normalization for Production (Vercel) & Development
const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
const sanitizedUrl = rawApiUrl.replace(/\/+$/, '');
const API_BASE_URL = sanitizedUrl.endsWith('/api') ? sanitizedUrl : `${sanitizedUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token into all outbound requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staynest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401 unauthenticated errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (localStorage.getItem('staynest_token')) {
        localStorage.removeItem('staynest_token');
        localStorage.removeItem('staynest_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
