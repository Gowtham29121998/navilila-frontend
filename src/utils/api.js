import axios from 'axios';
import { store } from '../redux/store.js';
import { logout } from '../redux/userSlice.js';

// Retrieve the base URL from Vite's environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Attach auth tokens automatically
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Global error handling & session timeout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 401: Unauthorized / Session Expired / Logged in elsewhere
      if (error.response.status === 401) {
        console.error('Session expired or unauthorized. Logging out...');
        localStorage.removeItem('userInfo');
        store.dispatch(logout());
        // Redirect to home or reload to refresh state if needed
        if (typeof window !== 'undefined') {
          window.location.href = '/?session_expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
