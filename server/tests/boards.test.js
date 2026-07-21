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

// Register a user and return an Authorization header for them.
async function authFor(email) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'supersecret', name: email });
  return { Authorization: `Bearer ${res.body.accessToken}` };
}

describe('Boards CRUD', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/boards');
    expect(res.status).toBe(401);
  });

  it('creates and lists the user\'s own boards', async () => {
    const alice = await authFor('alice@example.com');

    const created = await request(app).post('/api/boards').set(alice).send({ title: 'Sprint 1' });
    expect(created.status).toBe(201);
    expect(created.body.board.title).toBe('Sprint 1');

    const list = await request(app).get('/api/boards').set(alice);
    expect(list.status).toBe(200);
    expect(list.body.boards).toHaveLength(1);
  });

  it('rejects a board with no title (400)', async () => {
    const alice = await authFor('alice@example.com');
    const res = await request(app).post('/api/boards').set(alice).send({ title: '  ' });
    expect(res.status).toBe(400);
  });

  it('updates and deletes a board', async () => {
    const alice = await authFor('alice@example.com');
    const { body } = await request(app).post('/api/boards').set(alice).send({ title: 'Old' });
    const id = body.board._id;

    const patched = await request(app).patch(`/api/boards/${id}`).set(alice).send({ title: 'New' });
    expect(patched.body.board.title).toBe('New');

    const del = await request(app).delete(`/api/boards/${id}`).set(alice);
    expect(del.status).toBe(204);

    const after = await request(app).get(`/api/boards/${id}`).set(alice);
    expect(after.status).toBe(404);
  });
});

describe('Board ownership isolation', () => {
  it('never lets a user see or touch another user\'s board', async () => {
    const alice = await authFor('alice@example.com');
    const bob = await authFor('bob@example.com');

    const { body } = await request(app).post('/api/boards').set(alice).send({ title: 'Private' });
    const id = body.board._id;

    // Bob's board list is empty.
    const bobList = await request(app).get('/api/boards').set(bob);
    expect(bobList.body.boards).toHaveLength(0);

    // Bob can't read, update, or delete Alice's board.
    expect((await request(app).get(`/api/boards/${id}`).set(bob)).status).toBe(404);
    expect(
      (await request(app).patch(`/api/boards/${id}`).set(bob).send({ title: 'hacked' })).status
    ).toBe(404);
    expect((await request(app).delete(`/api/boards/${id}`).set(bob)).status).toBe(404);
  });
});

describe('Lists under a board', () => {
  it('creates lists (appended in order) and lists them sorted', async () => {
    const alice = await authFor('alice@example.com');
    const { body } = await request(app).post('/api/boards').set(alice).send({ title: 'B' });
    const boardId = body.board._id;

    await request(app).post(`/api/boards/${boardId}/lists`).set(alice).send({ title: 'To Do' });
    await request(app).post(`/api/boards/${boardId}/lists`).set(alice).send({ title: 'Doing' });

    const res = await request(app).get(`/api/boards/${boardId}/lists`).set(alice);
    expect(res.status).toBe(200);
    expect(res.body.lists.map((l) => l.title)).toEqual(['To Do', 'Doing']);
    expect(res.body.lists.map((l) => l.position)).toEqual([0, 1]);
  });

  it('blocks creating a list on someone else\'s board (404)', async () => {
    const alice = await authFor('alice@example.com');
    const bob = await authFor('bob@example.com');
    const { body } = await request(app).post('/api/boards').set(alice).send({ title: 'B' });

    const res = await request(app)
      .post(`/api/boards/${body.board._id}/lists`)
      .set(bob)
      .send({ title: 'sneaky' });
    expect(res.status).toBe(404);
  });
});
