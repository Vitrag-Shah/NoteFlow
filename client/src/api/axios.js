import axios from 'axios';

const isProduction = import.meta.env.MODE === 'production';
const baseURL = import.meta.env.VITE_API_URL || (isProduction ? '/api' : 'http://localhost:5000');

if (isProduction && baseURL.includes('localhost')) {
  console.warn('WARNING: Running in production mode, but API URL contains "localhost". This might cause connection issues.');
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ─── Request Interceptor: attach JWT ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: handle 401 globally ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config) {
      console.error('API Request Failed:', {
        url: error.config.url,
        status: error.response?.status,
        message: error.message
      });
    }

    if (error.code === 'ERR_CONNECTION_REFUSED' || error.message.includes('Network Error')) {
      console.error(`💥 Connection refused: Cannot reach API at ${error.config?.baseURL || ''}${error.config?.url || ''}. Check if the API URL is correct and the backend is running.`);
    }

    // If it's a 401 and NOT a login request, redirect to login
    // We don't want to redirect on login failure because we need to show the error toast
    if (error.response?.status === 401 && error.config && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
