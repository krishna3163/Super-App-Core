import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import Snap from '../models/Snap.js';
import Streak from '../models/Streak.js';

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
  await Snap.deleteMany({});
  await Streak.deleteMany({});
});

describe('Snap Service Tests', () => {
  const senderId = 'user1';
  const receiverId = 'user2';

  test('POST /send should create a snap and a streak', async () => {
    const res = await request(app)
      .post('/send')
      .send({
        senderId,
        receiverId,
        mediaUrl: 'http://example.com/image.jpg',
        mediaType: 'image'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.snap.senderId).toBe(senderId);
    expect(res.body.data.streak.count).toBe(1);
  });

  test('POST /:id/open should mark snap as viewed and set expiry', async () => {
    const snap = await Snap.create({
      senderId,
      receiverId,
      mediaUrl: 'http://example.com/image.jpg',
      viewOnce: true
    });

    const res = await request(app)
      .post(`/${snap._id}/open`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isViewed).toBe(true);
    // Should be set to expire soon
    const expiresAt = new Date(res.body.data.expiresAt);
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  test('PATCH /screenshot/:snapId should mark as screenshotted', async () => {
    const snap = await Snap.create({
      senderId,
      receiverId,
      mediaUrl: 'http://example.com/image.jpg'
    });

    const res = await request(app)
      .patch(`/screenshot/${snap._id}`)
      .send({ userId: receiverId });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.snap.isScreenshotted).toBe(true);
  });

  test('GET /inbox should return unviewed snaps', async () => {
    await Snap.create([
      { senderId, receiverId, mediaUrl: 'url1' },
      { senderId, receiverId, mediaUrl: 'url2' },
      { senderId, receiverId, mediaUrl: 'url3', isViewed: true, expiresAt: new Date(Date.now() - 1000) }
    ]);

    const res = await request(app).get(`/inbox?userId=${receiverId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toBe(2);
  });

  test('POST /:id/replay should allow one replay', async () => {
    const snap = await Snap.create({ senderId, receiverId, mediaUrl: 'url', isViewed: true });
    
    const res = await request(app).post(`/${snap._id}/replay`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.replayCount).toBe(1);

    const secondRes = await request(app).post(`/${snap._id}/replay`);
    expect(secondRes.statusCode).toEqual(403);
    expect(secondRes.body.errorCode).toBe('REPLAY_LIMIT_REACHED');
  });

  test('Story audience access: blocked user should not have access', async () => {
    await request(app).put('/story/audience').send({
      userId: senderId,
      blockedUserIds: ['blocked-user']
    });

    const res = await request(app).get('/story/access').query({
      storyOwnerId: senderId,
      viewerId: 'blocked-user'
    });

    expect(res.body.hasAccess).toBe(false);
    expect(res.body.reason).toBe('BLOCKED');
  });

  test('POST /map/location should update user location', async () => {
    const res = await request(app).post('/map/location').send({
      userId: senderId,
      latitude: 12.34,
      longitude: 56.78
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.location.latitude).toBe(12.34);
  });
});
