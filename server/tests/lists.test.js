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

async function authFor(email) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'supersecret', name: email });
  return { Authorization: `Bearer ${res.body.accessToken}` };
}

async function boardWithList(headers, title = 'To Do') {
  const board = await request(app).post('/api/boards').set(headers).send({ title: 'B' });
  const list = await request(app)
    .post(`/api/boards/${board.body.board._id}/lists`)
    .set(headers)
    .send({ title });
  return { boardId: board.body.board._id, listId: list.body.list._id };
}

describe('PATCH /api/lists/:id', () => {
  it('renames a list', async () => {
    const alice = await authFor('alice@example.com');
    const { listId } = await boardWithList(alice);

    const res = await request(app).patch(`/api/lists/${listId}`).set(alice).send({ title: 'Doing' });
    expect(res.status).toBe(200);
    expect(res.body.list.title).toBe('Doing');
  });

  it('updates a list position', async () => {
    const alice = await authFor('alice@example.com');
    const { listId } = await boardWithList(alice);

    const res = await request(app).patch(`/api/lists/${listId}`).set(alice).send({ position: 3 });
    expect(res.status).toBe(200);
    expect(res.body.list.position).toBe(3);
  });

  it('rejects an empty title (400)', async () => {
    const alice = await authFor('alice@example.com');
    const { listId } = await boardWithList(alice);

    const res = await request(app).patch(`/api/lists/${listId}`).set(alice).send({ title: '   ' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/lists/:id', () => {
  it('deletes a list', async () => {
    const alice = await authFor('alice@example.com');
    const { boardId, listId } = await boardWithList(alice);

    const del = await request(app).delete(`/api/lists/${listId}`).set(alice);
    expect(del.status).toBe(204);

    const after = await request(app).get(`/api/boards/${boardId}/lists`).set(alice);
    expect(after.body.lists).toHaveLength(0);
  });
});

describe('List ownership isolation', () => {
  it('blocks another user from renaming or deleting a list (404)', async () => {
    const alice = await authFor('alice@example.com');
    const bob = await authFor('bob@example.com');
    const { listId } = await boardWithList(alice);

    expect(
      (await request(app).patch(`/api/lists/${listId}`).set(bob).send({ title: 'hacked' })).status
    ).toBe(404);
    expect((await request(app).delete(`/api/lists/${listId}`).set(bob)).status).toBe(404);
  });
});

describe('Invalid ids', () => {
  it('returns 400 for a malformed board id', async () => {
    const alice = await authFor('alice@example.com');
    const res = await request(app).get('/api/boards/not-a-valid-id').set(alice);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid id');
  });
});
