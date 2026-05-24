import request from 'supertest';
import app from '../src/index.js';
import ApiKey from '../src/models/ApiKey.js';
import User from '../src/models/User.js';
import { hashApiKey } from '../src/utils/apiKeys.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

describe('Day 8-9: User Management, Settings, and API Keys', () => {
  const testUser = {
    email: 'week2@example.com',
    username: 'week2user',
    password: 'password123'
  };

  let token;
  let userId;

  beforeEach(async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(testUser);
    token = registerRes.body.accessToken;
    userId = registerRes.body.user.id;
  });

  it('should return the current user and allow self lookup by id', async () => {
    const meRes = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.user.email).toBe(testUser.email);
    expect(meRes.body.user).not.toHaveProperty('passwordHash');

    const byIdRes = await request(app)
      .get(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(byIdRes.statusCode).toBe(200);
    expect(byIdRes.body.user.id).toBe(userId);
  });

  it('should block users from reading another user profile by id', async () => {
    const otherUser = await User.create({
      email: 'other@example.com',
      username: 'otheruser',
      passwordHash: 'not-used'
    });

    const res = await request(app)
      .get(`/api/v1/users/${otherUser._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  it('should read and update user settings safely', async () => {
    const updateRes = await request(app)
      .put('/api/v1/users/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        theme: 'dark',
        notificationsEnabled: false,
        marketAlertsEnabled: true,
        defaultWatchlist: ['aapl', ' msft ', '']
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.settings.theme).toBe('dark');
    expect(updateRes.body.settings.notificationsEnabled).toBe(false);
    expect(updateRes.body.settings.marketAlertsEnabled).toBe(true);
    expect(updateRes.body.settings.defaultWatchlist).toEqual(['AAPL', 'MSFT']);

    const getRes = await request(app)
      .get('/api/v1/users/settings')
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.settings.theme).toBe('dark');
  });

  it('should change password only with the correct current password', async () => {
    const rejectedRes = await request(app)
      .post('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      });

    expect(rejectedRes.statusCode).toBe(401);

    const acceptedRes = await request(app)
      .post('/api/v1/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: testUser.password,
        newPassword: 'newpassword123'
      });

    expect(acceptedRes.statusCode).toBe(200);

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'newpassword123'
    });

    expect(loginRes.statusCode).toBe(200);
  });

  it('should create, list, and revoke hashed API keys', async () => {
    const createRes = await request(app)
      .post('/api/v1/users/api-keys')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Research terminal' });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.apiKey.key).toMatch(/^fai_/);
    expect(createRes.body.apiKey.keyPrefix).toBe(createRes.body.apiKey.key.slice(0, 12));

    const dbKey = await ApiKey.findById(createRes.body.apiKey.id);
    expect(dbKey.keyHash).toBe(hashApiKey(createRes.body.apiKey.key));
    expect(dbKey.keyHash).not.toBe(createRes.body.apiKey.key);

    const listRes = await request(app)
      .get('/api/v1/users/api-keys')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.statusCode).toBe(200);
    expect(listRes.body.apiKeys).toHaveLength(1);
    expect(listRes.body.apiKeys[0]).not.toHaveProperty('keyHash');
    expect(listRes.body.apiKeys[0]).not.toHaveProperty('key');

    const revokeRes = await request(app)
      .delete(`/api/v1/users/api-keys/${createRes.body.apiKey.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(revokeRes.statusCode).toBe(200);
    expect(revokeRes.body.apiKey.revokedAt).toBeTruthy();
  });

  it('should upload an avatar and store its URL on the profile', async () => {
    const res = await request(app)
      .post('/api/v1/users/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', Buffer.from('fake image bytes'), {
        filename: 'avatar.png',
        contentType: 'image/png'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.avatarUrl).toMatch(/^\/uploads\/avatars\//);
    expect(res.body.user.profile.avatarUrl).toBe(res.body.avatarUrl);
  });

  it('should soft delete the account and revoke active API keys', async () => {
    await request(app)
      .post('/api/v1/users/api-keys')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Temporary key' });

    const res = await request(app)
      .delete('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    const user = await User.findById(userId);
    const activeKeys = await ApiKey.countDocuments({ userId, revokedAt: null });

    expect(user.deletedAt).toBeTruthy();
    expect(activeKeys).toBe(0);
  });
});
