import axios from 'axios';

// Determine raw API root from env or sensible defaults
const rawBaseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:1993'
    : 'https://it-inventory-system-coral.vercel.app');

// Normalize so we don't end up with /api/api/... when callers use "/api/..."
let baseURL = rawBaseURL.replace(/\/+$/, ''); // strip trailing slash
if (baseURL.endsWith('/api')) {
  baseURL = baseURL.replace(/\/api$/, '');
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
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

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
