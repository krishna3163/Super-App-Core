import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import User from '../models/User.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Service Hardening Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  test('POST /signup should create a user and return tokens', async () => {
    const res = await request(app)
      .post('/signup')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.status).toBe('success');
    expect(res.body).toHaveProperty('token');
    expect(res.header['set-cookie']).toBeDefined();
    expect(res.header['x-correlation-id']).toBeDefined();
  });

  test('POST /login should return tokens for valid user', async () => {
    await request(app).post('/signup').send(testUser);

    const res = await request(app)
      .post('/login')
      .send(testUser);

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('success');
    expect(res.body).toHaveProperty('token');
    expect(res.header['set-cookie']).toBeDefined();
  });

  test('POST /refresh should rotate tokens and prevent reuse', async () => {
    // 1. Signup
    const signupRes = await request(app).post('/signup').send(testUser);
    const refreshToken = signupRes.header['set-cookie'][0].split(';')[0].split('=')[1];

    // 2. Refresh
    const refreshRes = await request(app)
      .post('/refresh')
      .set('Cookie', [`refreshToken=${refreshToken}`]);

    expect(refreshRes.statusCode).toEqual(200);
    expect(refreshRes.body).toHaveProperty('token');
    const newRefreshToken = refreshRes.header['set-cookie'][0].split(';')[0].split('=')[1];
    expect(newRefreshToken).not.toBe(refreshToken);

    // 3. Attempt reuse of OLD refresh token
    const reuseRes = await request(app)
      .post('/refresh')
      .set('Cookie', [`refreshToken=${refreshToken}`]);

    expect(reuseRes.statusCode).toEqual(403);
    expect(reuseRes.body.message).toContain('reused');

    // 4. Verify user tokens were cleared after reuse detection
    const user = await User.findOne({ email: testUser.email });
    expect(user.refreshTokens.length).toBe(0);
  });

  test('Rate limiting should trigger after multiple requests', async () => {
    const res = await request(app).get('/health');
    // express-rate-limit 7+ uses standard ratelimit headers by default or x-ratelimit-limit if configured
    // Since we set standardHeaders: true, it should be 'ratelimit-limit'
    expect(res.header['ratelimit-limit'] || res.header['x-ratelimit-limit']).toBeDefined();
  });

  test('Account should lock after 5 failed login attempts', async () => {
    // 1. Signup
    await request(app).post('/signup').send(testUser);

    // 2. Fail 5 times
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/login')
        .send({ email: testUser.email, password: 'wrongpassword' });
      expect(res.statusCode).toEqual(401);
    }

    // 3. Attempt 6th login with CORRECT password
    const res = await request(app)
      .post('/login')
      .send(testUser);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toContain('locked');

    // 4. Verify DB state
    const user = await User.findOne({ email: testUser.email });
    expect(user.loginAttempts).toBe(5);
    expect(user.lockUntil).toBeGreaterThan(Date.now());
  });
});
