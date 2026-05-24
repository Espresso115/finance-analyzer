import request from 'supertest';
import app from '../src/index.js';

describe('Day 10-11: API Architecture and Documentation', () => {
  it('should attach a request id to responses', async () => {
    const res = await request(app).get('/health').set('X-Request-Id', 'test-request-id');

    expect(res.statusCode).toBe(200);
    expect(res.headers['x-request-id']).toBe('test-request-id');
  });

  it('should expose OpenAPI documentation JSON', async () => {
    const res = await request(app).get('/api/v1/docs/openapi.json');

    expect(res.statusCode).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.paths).toHaveProperty('/api/v1/auth/login');
    expect(res.body.paths).toHaveProperty('/api/v1/users/api-keys');
  });

  it('should return a standardized 404 response for unknown routes', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.details.requestId).toBeDefined();
  });
});
