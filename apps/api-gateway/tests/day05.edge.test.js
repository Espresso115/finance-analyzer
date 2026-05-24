import request from 'supertest';
import app from '../src/index.js';
import User from '../src/models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import redisClient from '../src/config/redis.js';

dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';

describe('Day 5: Profile Management & Market Quote Caching', () => {
  const testUser = {
    email: 'profiletest@example.com',
    username: 'profiletest',
    password: 'password123'
  };

  let token;
  let userId;
  let cacheMock = {};
  let getCalls = [];
  let setExCalls = [];

  beforeAll(async () => {
    // Stub Redis client methods to guarantee consistent test behavior without requiring active Redis process
    Object.defineProperty(redisClient, 'isOpen', {
      get: () => true,
      configurable: true
    });
    redisClient.get = async (key) => {
      getCalls.push(key);
      return cacheMock[key] || null;
    };
    redisClient.setEx = async (key, ttl, value) => {
      setExCalls.push({ key, ttl, value });
      cacheMock[key] = value;
      return 'OK';
    };
  });

  beforeEach(async () => {
    cacheMock = {};
    getCalls = [];
    setExCalls = [];
    
    // Register test user
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    token = res.body.token;
    userId = res.body.user.id;
  });

  describe('1. User Profile Endpoints', () => {
    it('should reject profile retrieval if not authorized', async () => {
      const res = await request(app).get('/api/v1/users/profile');
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/Not authorized/i);
    });

    it('should successfully get authorized user profile details (excluding password hash)', async () => {
      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).toHaveProperty('username', testUser.username);
      expect(res.body.user).not.toHaveProperty('passwordHash');
      expect(res.body.user.profile).toBeDefined();
    });

    it('should update profile fields and persist to database', async () => {
      const updateData = {
        bio: 'Senior Portfolio Manager specializing in tech derivatives',
        company: 'Antigravity Capital',
        preferences: {
          theme: 'dark',
          notificationsEnabled: false
        }
      };

      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.profile.bio).toBe(updateData.bio);
      expect(res.body.user.profile.company).toBe(updateData.company);
      expect(res.body.user.profile.preferences.theme).toBe('dark');
      expect(res.body.user.profile.preferences.notificationsEnabled).toBe(false);

      // Verify in DB directly
      const dbUser = await User.findById(userId);
      expect(dbUser.profile.bio).toBe(updateData.bio);
      expect(dbUser.profile.company).toBe(updateData.company);
      expect(dbUser.profile.preferences.theme).toBe('dark');
    });

    it('should ignore unsupported fields during profile update', async () => {
      const updateData = {
        bio: 'Updated bio',
        role: 'admin', // Hack attempt
        email: 'hacker@example.com' // Unauthorized field
      };

      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      
      // Verify DB direct check
      const dbUser = await User.findById(userId);
      expect(dbUser.profile.bio).toBe('Updated bio');
      expect(dbUser.role).toBe('user'); // Unchanged
      expect(dbUser.email).toBe(testUser.email); // Unchanged
    });
  });

  describe('2. Market Data Retrieval & Redis Caching', () => {
    it('should reject market requests if not authorized', async () => {
      const res = await request(app).get('/api/v1/market/quote/AAPL');
      expect(res.statusCode).toBe(401);
    });

    it('should fetch market quote and cache the result in Redis', async () => {
      const res1 = await request(app)
        .get('/api/v1/market/quote/AAPL')
        .set('Authorization', `Bearer ${token}`);

      expect(res1.statusCode).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.data.symbol).toBe('AAPL');
      expect(res1.body.data.price).toBeDefined();
      expect(res1.body.data.cached).toBe(false);

      // Verify Redis setEx was called with standard prefix
      expect(setExCalls.length).toBeGreaterThan(0);
      expect(setExCalls[0].key).toBe('market:quote:AAPL');
      
      // Secondary request within 60s should read from cache (Cache HIT)
      const res2 = await request(app)
        .get('/api/v1/market/quote/AAPL')
        .set('Authorization', `Bearer ${token}`);

      expect(res2.statusCode).toBe(200);
      expect(res2.body.data.cached).toBe(true);
      expect(res2.body.data.price).toBe(res1.body.data.price); // Exact same price returned from cache
      
      expect(getCalls).toContain('market:quote:AAPL');
    });
  });
});
