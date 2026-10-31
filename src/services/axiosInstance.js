import axios from 'axios';

// Get base URL from environment variables or default to localhost:8000/api
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const timeout = Number(import.meta.env.VITE_API_TIMEOUT) || 15000;

export const axiosInstance = axios.create({
  baseURL,
  timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if present in future auth phases
    const token = localStorage.getItem('sims_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      // Backend returned an error response (4xx, 5xx)
      const data = error.response.data;
      if (data && typeof data === 'object') {
        errorMessage = data.detail || data.message || `Server Error (${error.response.status})`;
      } else if (typeof data === 'string' && data.length < 200) {
        errorMessage = data;
      } else {
        errorMessage = `Request failed with status ${error.response.status}`;
      }
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'Request timed out. Please verify your connection or backend server.';
    } else if (error.request) {
      // No response received (backend offline, CORS issue, network down)
      errorMessage = 'Unable to connect to the backend server. Please verify FastAPI is running.';
    } else {
      errorMessage = error.message || errorMessage;
    }

    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.originalError = error;

    return Promise.reject(customError);
  }
);

export default axiosInstance;

