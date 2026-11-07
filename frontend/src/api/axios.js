import axios from 'axios';

// Create a custom instance of axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure your backend is running on port 5000
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR: Attaches the JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Handles expired or invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns a 401 Unauthorized (token expired/invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we aren't already on the login page to prevent loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;