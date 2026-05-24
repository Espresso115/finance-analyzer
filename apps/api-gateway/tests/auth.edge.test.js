import request from 'supertest';
import app from '../src/index.js';
import User from '../src/models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Ensure test environment variables are loaded if not already
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

describe('Authentication & Database Edge Cases', () => {

  const testUser = {
    email: 'testedge@example.com',
    username: 'testedge',
    password: 'password123'
  };

  describe('1. Database Consistency', () => {
    
    it('should reject duplicate email inserts gracefully (409 error)', async () => {
      // First insert
      await request(app).post('/api/v1/auth/register').send(testUser);
      
      // Second insert (duplicate)
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      
      expect(res.statusCode).toBe(409);
      expect(res.body.error).toMatch(/exists/i);
    });

    it('should handle simultaneous writes (race conditions) securely', async () => {
      // Fire 5 identical requests simultaneously
      const requests = Array.from({ length: 5 }).map(() =>
        request(app).post('/api/v1/auth/register').send({
          email: 'race@example.com',
          username: 'raceuser',
          password: 'password123'
        })
      );

      const responses = await Promise.all(requests);
      
      const successes = responses.filter(r => r.statusCode === 201);
      const failures = responses.filter(r => r.statusCode === 409);
      const serverErrors = responses.filter(r => r.statusCode === 500);

      // Only ONE should succeed, the rest should hit the validation error, not crash the server
      expect(successes.length).toBe(1);
      expect(failures.length).toBe(4);
      expect(serverErrors.length).toBe(0);

      // Verify only 1 exists in DB
      const dbCount = await User.countDocuments({ email: 'race@example.com' });
      expect(dbCount).toBe(1);
    });
  });

  describe('2. API Contract Drift Validation', () => {
    
    it('should return exactly the expected payload shape on login', async () => {
      // Create user
      await request(app).post('/api/v1/auth/register').send(testUser);

      // Login
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(typeof res.body.token).toBe('string');
      expect(typeof res.body.accessToken).toBe('string');
      expect(typeof res.body.refreshToken).toBe('string');
      
      // Verify User object shape
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).toHaveProperty('username', testUser.username);
      expect(res.body.user).toHaveProperty('role', 'user');

      // Crucially, verify it DOES NOT leak the password hash or version key
      expect(res.body.user).not.toHaveProperty('passwordHash');
      expect(res.body.user).not.toHaveProperty('__v');
    });
  });

  describe('3. JWT & Auth Edge Cases', () => {
    
    // We need a dummy protected route to test middleware
    beforeAll(() => {
      // Dynamically import protect middleware
      import('../src/middleware/auth.middleware.js').then(({ protect }) => {
        app.get('/api/v1/test-protect', protect, (req, res) => {
          res.json({ success: true, userId: req.user._id });
        });
      });
    });

    let validToken;
    let userId;

    beforeEach(async () => {
      const res = await request(app).post('/api/v1/auth/register').send(testUser);
      validToken = res.body.token;
      userId = res.body.user.id;
    });

    it('should reject requests with missing Bearer prefix', async () => {
      const res = await request(app)
        .get('/api/v1/test-protect')
        .set('Authorization', `${validToken}`); // Missing 'Bearer '

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/Not authorized/i);
    });

    it('should reject tampered tokens', async () => {
      const tamperedToken = validToken.slice(0, -1) + 'a';
      
      const res = await request(app)
        .get('/api/v1/test-protect')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/token failed/i);
    });

    it('should reject expired tokens', async () => {
      // Generate manually expired token
      const expiredToken = jwt.sign(
        { id: userId, type: 'access' },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '-10s' }
      );

      const res = await request(app)
        .get('/api/v1/test-protect')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toMatch(/token failed/i);
    });

    it('should prevent Role Escalation during registration', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'hacker@example.com',
        username: 'hacker',
        password: 'password123',
        role: 'admin' // Attempting to set self as admin
      });

      expect(res.statusCode).toBe(201);
      // The role should default to 'user' despite the input
      expect(res.body.user.role).toBe('user');
      
      // Verify in DB directly
      const dbHacker = await User.findOne({ email: 'hacker@example.com' });
      expect(dbHacker.role).toBe('user');
    });
  });
});
