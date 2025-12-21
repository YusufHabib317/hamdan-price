import axios from 'axios';

export const ApiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for adding auth headers if needed
ApiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Response interceptor for handling common errors
ApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized - redirect to sign in
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  },
);
