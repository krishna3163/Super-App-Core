import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5050';

export const options = {
  scenarios: {
    quick_load: {
      executor: 'constant-vus',
      vus: 1000,
      duration: '1m',
    },
    // To reach 10k, we ramp up
    ramp_to_10k: {
      executor: 'ramping-vus',
      startVUs: 1000,
      stages: [
        { duration: '2m', target: 5000 },
        { duration: '5m', target: 10000 },
        { duration: '10m', target: 10000 },
        { duration: '2m', target: 1000 }
      ]
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500', 'p(99)<1000']
  }
};

export default function () {
  // 1. Pick a random user from the 10k seeded
  const userId = Math.floor(Math.random() * 10000);
  const email = `user${userId}@example.com`;
  const password = 'password123';

  // 2. Login
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: email,
    password: password
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  const loginSuccess = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'has access token': (r) => r.json().token !== undefined
  });

  if (loginSuccess) {
    const token = loginRes.json().token;
    const authHeaders = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 3. Get Profile
    const profileRes = http.get(`${BASE_URL}/api/users/profile/${loginRes.json().userId}`, {
      headers: authHeaders
    });
    check(profileRes, {
      'get profile status is 200': (r) => r.status === 200
    });

    // 4. Get Social Feed
    const feedRes = http.get(`${BASE_URL}/api/social/feed?page=1&limit=10`, {
      headers: authHeaders
    });
    check(feedRes, {
      'get feed status is 200': (r) => r.status === 200
    });

    // 5. Get Marketplace Products
    const marketRes = http.get(`${BASE_URL}/api/marketplace/products?limit=10`, {
      headers: authHeaders
    });
    check(marketRes, {
      'get marketplace status is 200': (r) => r.status === 200
    });
  }

  sleep(Math.random() * 2 + 1); // Think time 1-3s
}
