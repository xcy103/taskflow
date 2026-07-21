import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

const validUser = { email: 'alice@example.com', password: 'supersecret', name: 'Alice' };

// Register and return both the access token and the refresh cookie.
async function registerAndGetAuth() {
  const res = await request(app).post('/api/auth/register').send(validUser);
  return { token: res.body.accessToken, cookie: res.headers['set-cookie'] };
}

describe('GET /api/me', () => {
  it('rejects a request with no token (401)', async () => {
    const res = await request(app).get('/api/me');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed token (401)', async () => {
    const res = await request(app).get('/api/me').set('Authorization', 'Bearer not.a.jwt');
    expect(res.status).toBe(401);
  });

  it('returns the current user with a valid token', async () => {
    const { token } = await registerAndGetAuth();
    const res = await request(app).get('/api/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });
});

describe('POST /api/auth/refresh', () => {
  it('mints a new access token from the refresh cookie', async () => {
    const { cookie } = await registerAndGetAuth();
    const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
  });

  it('rejects a refresh with no cookie (401)', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});
