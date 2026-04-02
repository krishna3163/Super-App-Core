import axios from 'axios'
import useAuthStore from '@/store/useAuthStore'
import { saveOffline, loadOffline } from '@/lib/offlineStorage'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api',
  timeout: 30000,
})

// ── In-memory hot cache (10-second deduplication) ──────────────────────────
const memCache = new Map<string, { data: any; timestamp: number }>();
const MEM_STALE_TIME = 10_000; // 10 seconds

// ── Persistent offline cache TTL ─────────────────────────────────────────────
const OFFLINE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// ── Request interceptor — attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — normalize errors + auto-logout ────────────────────
api.interceptors.response.use(
  (response) => response,
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

// ── GET wrapper: mem-cache → network → IndexedDB offline fallback ─────────────
const originalGet = api.get;
api.get = async (url: string, config?: any) => {
  const cacheKey = 'api:' + url + (config?.params ? JSON.stringify(config.params) : '');

  // 1. Return from hot in-memory cache if still fresh (dedup rapid calls)
  const mem = memCache.get(cacheKey);
  if (mem && Date.now() - mem.timestamp < MEM_STALE_TIME) {
    return { data: mem.data, status: 200, statusText: 'OK', headers: {}, config: config || {} } as any;
  }

  try {
    // 2. Network request
    const response = await originalGet(url, config);
    // Store in both caches on success
    memCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    saveOffline(cacheKey, response.data, OFFLINE_TTL).catch(() => null);
    return response;
  } catch (err: any) {
    // 3. Offline fallback — serve IndexedDB data if network unavailable
    const isNetworkError = !err.status || err.status === 0 || 
      (typeof navigator !== 'undefined' && !navigator.onLine);
    if (isNetworkError) {
      const cached = await loadOffline<any>(cacheKey);
      if (cached) {
        // Return as a synthetic successful response
        return { data: cached, status: 200, statusText: 'OK (offline)', headers: {}, config: config || {} } as any;
      }
    }
    throw err;
  }
};

export default api
