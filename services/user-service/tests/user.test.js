import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import User from '../models/User.js';
import UserSettings from '../models/UserSettings.js';

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
  await UserSettings.deleteMany({});
});

describe('User Service Tests', () => {
  const userId = 'user-123';

  test('POST /profile should create or update profile', async () => {
    const res = await request(app)
      .post('/profile')
      .send({
        userId,
        name: 'Test User',
        bio: 'Hello world'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.name).toBe('Test User');

    const user = await User.findOne({ userId });
    expect(user.name).toBe('Test User');
  });

  test('GET /settings should return default settings if not exists', async () => {
    const res = await request(app)
      .get('/settings')
      .query({ userId });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.userId).toBe(userId);
    expect(res.body.data.onboardingCompleted).toBe(false);
  });

  test('PUT /settings should update permissions', async () => {
    const res = await request(app)
      .put('/settings')
      .send({
        userId,
        permissions: {
          camera: 'granted',
          location: 'denied'
        }
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.permissions.camera).toBe('granted');
    expect(res.body.data.permissions.location).toBe('denied');
    expect(res.body.data.permissions.microphone).toBe('prompt'); // Default
  });
});
