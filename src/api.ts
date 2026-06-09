import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Automatically inject JWT token to every request from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecotrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle authorization errors or token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Auto logout on token expiry
      const message = error.response.data?.message || '';
      if (message.includes('expired') || message.includes('token') || error.response.status === 401) {
        console.warn('Authentication token expired or invalid. Logging out.');
        localStorage.removeItem('ecotrack_token');
        localStorage.removeItem('ecotrack_user');
        // Simple window redirect or reload if not handled by React Router state
        if (window.location.pathname !== '/' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
