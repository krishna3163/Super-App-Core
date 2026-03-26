import axios from 'axios'
import useAuthStore from '@/store/useAuthStore'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api',
  timeout: 30000,
})

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_STALE_TIME = 10000; // 10 seconds

// Request interceptor for adding the auth token and caching
api.interceptors.request.use(
  (config) => {
    // Basic in-memory caching for GET requests
    if (config.method === 'get' && config.url) {
      const cached = cache.get(config.url);
      if (cached && Date.now() - cached.timestamp < CACHE_STALE_TIME) {
        // Return cached data as a cancelled request but with data
        // For axios interceptors, we can't easily return early without some trickery
      }
    }
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to normalize errors and save to cache
api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get' && response.config.url) {
      cache.set(response.config.url, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error) => {
    // Normalize error shape across different backend services
    const errPayload = error.response?.data;
    const errorMessage = errPayload?.error || errPayload?.message || error.message || 'An unknown error occurred';
    
    // Automatically logout if unauthorized or invalid token
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        const { logout } = useAuthStore.getState();
        // Prevent multiple logouts and immediate redirect for better UX
        const lastAuthError = sessionStorage.getItem('last_auth_error');
        const now = Date.now();
        if (!lastAuthError || now - parseInt(lastAuthError) > 5000) {
          sessionStorage.setItem('last_auth_error', now.toString());
          logout();
          window.location.href = '/login';
        }
      }
    }

    const normalizedError = new Error(errorMessage);
    (normalizedError as any).status = error.response?.status;
    (normalizedError as any).payload = errPayload;
    
    return Promise.reject(normalizedError);
  }
)

export default api
