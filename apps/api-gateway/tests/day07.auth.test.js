import request from 'supertest';
import app from '../src/index.js';
import User from '../src/models/User.js';
import { authorizeRoles, protect } from '../src/middleware/auth.middleware.js';
import { generateRefreshToken } from '../src/utils/auth.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

describe('Day 7: Complete Authentication Flow', () => {
  const testUser = {
    email: 'day7@example.com',
    username: 'day7user',
    password: 'password123'
  };

  beforeAll(() => {
    app.get('/api/v1/test-admin-only', protect, authorizeRoles('admin'), (req, res) => {
      res.json({ success: true, userId: req.user._id });
    });
  });

  it('should complete register, protected request, refresh, and logout flow', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.accessToken).toBeDefined();
    expect(registerRes.body.refreshToken).toBeDefined();

    const profileRes = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${registerRes.body.accessToken}`);

    expect(profileRes.statusCode).toBe(200);
    expect(profileRes.body.user.email).toBe(testUser.email);

    const refreshRes = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: registerRes.body.refreshToken
    });

    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.accessToken).toBeDefined();
    expect(refreshRes.body.refreshToken).toBeUndefined();

    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${refreshRes.body.accessToken}`);

    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.body.success).toBe(true);
  });

  it('should reject weak passwords and malformed emails', async () => {
    const weakPasswordRes = await request(app).post('/api/v1/auth/register').send({
      email: 'weak@example.com',
      username: 'weakuser',
      password: 'short'
    });

    expect(weakPasswordRes.statusCode).toBe(422);

    const badEmailRes = await request(app).post('/api/v1/auth/register').send({
      email: 'not-an-email',
      username: 'bademail',
      password: 'password123'
    });

    expect(badEmailRes.statusCode).toBe(422);
  });

  it('should reject refresh attempts with access tokens', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(testUser);

    const refreshRes = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: registerRes.body.accessToken
    });

    expect(refreshRes.statusCode).toBe(401);
  });

  it('should enforce role-based route protection', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(testUser);

    const deniedRes = await request(app)
      .get('/api/v1/test-admin-only')
      .set('Authorization', `Bearer ${registerRes.body.accessToken}`);

    expect(deniedRes.statusCode).toBe(403);

    const admin = await User.create({
      email: 'admin@example.com',
      username: 'adminuser',
      passwordHash: 'not-used-in-this-test',
      role: 'admin'
    });
    const adminRefreshToken = generateRefreshToken(admin);
    const adminAccessRes = await request(app).post('/api/v1/auth/refresh').send({
      refreshToken: adminRefreshToken
    });

    const allowedRes = await request(app)
      .get('/api/v1/test-admin-only')
      .set('Authorization', `Bearer ${adminAccessRes.body.accessToken}`);

    expect(allowedRes.statusCode).toBe(200);
  });
});
