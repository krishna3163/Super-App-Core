import axios from 'axios';

// =========================================================================
// SUPER APP - PHASE 2 FRONTEND ARCHITECTURE (AXIOS + REDUX TOOLKIT QUERY)
// =========================================================================

// Global API Base Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5050/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10s timeout for fast microservice communication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT Tokens to every request (Auth Service Integration)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('superapp_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Phase S11: Add Device ID for active sessions tracking
    config.headers['x-device-id'] = localStorage.getItem('device_fingerprint') || 'web-app';
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified Error Handling across all 39 Microservices
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Session expired, logging out from Super App...');
      localStorage.removeItem('superapp_token');
      window.location.href = '/login';
    }
    if (error.response?.status === 504) {
      console.error('API Gateway Timeout - Microservice might be sleeping or MongoDB is off.');
    }
    return Promise.reject(error);
  }
);

// =========================================================================
// CORE SUPER APP FRONTEND SERVICES HOOKS (Next.js / React Native Ready)
// =========================================================================

export const SuperAppAPI = {
  // Auth & Profile
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getUnifiedProfile: (userId) => apiClient.get(`/aggr/profile/${userId}`), // Uses aggregator-service

  // Social & AI Feed Algorithm (Master Algorithm)
  getRankedFeed: (userCtx, limit = 10) => apiClient.post('/ai/rank-feed', { user: userCtx, itemsLimit: limit }),
  postReel: (reelData) => apiClient.post('/social/posts', reelData),

  // Uber/Zomato (Ride & Food)
  requestRide: (rideDetails) => apiClient.post('/ride/request', rideDetails),
  orderFood: (orderData) => apiClient.post('/food/order', orderData),

  // Business B2B CRM
  bookBusinessAppointment: (bookingData) => apiClient.post('/crm/bookings', bookingData),
  askBusinessAiBot: (botPrompt) => apiClient.post('/crm/chatbot/simulate', botPrompt),

  // WebRTC Omegle Random Chat
  joinRandomChatQueue: (interests) => apiClient.post('/advanced-interact/random-chat/match', { interests }),
};

export default apiClient;
