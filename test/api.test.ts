import request from 'supertest';
import app from '../src/app';

describe('Server Health Check', () => {
  it('should return a 200 status and confirmation message', async () => {
    const response = await request(app).get('/speck/v1/serverHealth');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Server is healthy');
  });
});

describe('Authentication Routes', () => {
  it('should return 401 for unauthorized access to protected routes', async () => {
    const response = await request(app).get('/speck/v1/user');
    expect(response.status).toBe(401);
  });
});

describe('CORS Configuration', () => {
  it('should allow requests from allowed origins', async () => {
    const response = await request(app)
      .options('/speck/v1/serverHealth')
      .set('Origin', process.env.URL_FRONTEND || 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(process.env.URL_FRONTEND || 'http://localhost:3000');
  });
});

describe('Session Management', () => {
  it('should set a session cookie on login', async () => {
    const response = await request(app)
      .post('/speck/v1/auth/login')
      .send({ username: 'testuser', password: 'password' });

    expect(response.status).toBe(401); // Expected failure without a valid user
    expect(response.headers['set-cookie']).toBeDefined();
  });
});
