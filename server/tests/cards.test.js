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

// Create a board + list for a user and return their ids.
async function boardWithList(headers) {
  const board = await request(app).post('/api/boards').set(headers).send({ title: 'B' });
  const list = await request(app)
    .post(`/api/boards/${board.body.board._id}/lists`)
    .set(headers)
    .send({ title: 'To Do' });
  return { boardId: board.body.board._id, listId: list.body.list._id };
}

describe('Cards CRUD', () => {
  it('creates cards in order and lists them sorted by position', async () => {
    const alice = await authFor('alice@example.com');
    const { listId } = await boardWithList(alice);

    await request(app).post(`/api/lists/${listId}/cards`).set(alice).send({ title: 'First' });
    await request(app).post(`/api/lists/${listId}/cards`).set(alice).send({ title: 'Second' });

    const res = await request(app).get(`/api/lists/${listId}/cards`).set(alice);
    expect(res.status).toBe(200);
    expect(res.body.cards.map((c) => c.title)).toEqual(['First', 'Second']);
    expect(res.body.cards.map((c) => c.position)).toEqual([0, 1]);
  });

  it('requires a title (400)', async () => {
    const alice = await authFor('alice@example.com');
    const { listId } = await boardWithList(alice);
    const res = await request(app).post(`/api/lists/${listId}/cards`).set(alice).send({ title: '' });
    expect(res.status).toBe(400);
  });

  it('updates a card and deletes it', async () => {
    const alice = await authFor('alice@example.com');
    const { listId } = await boardWithList(alice);
    const created = await request(app)
      .post(`/api/lists/${listId}/cards`)
      .set(alice)
      .send({ title: 'Draft' });
    const id = created.body.card._id;

    const patched = await request(app)
      .patch(`/api/cards/${id}`)
      .set(alice)
      .send({ description: 'details', dueDate: '2026-08-01' });
    expect(patched.status).toBe(200);
    expect(patched.body.card.description).toBe('details');
    expect(patched.body.card.dueDate).toBeTruthy();

    const del = await request(app).delete(`/api/cards/${id}`).set(alice);
    expect(del.status).toBe(204);
    expect((await request(app).get(`/api/cards/${id}`).set(alice)).status).toBe(404);
  });
});

describe('Card ownership isolation', () => {
  it('blocks another user from creating or touching cards', async () => {
    const alice = await authFor('alice@example.com');
    const bob = await authFor('bob@example.com');
    const { listId } = await boardWithList(alice);

    // Bob can't add a card to Alice's list.
    expect(
      (await request(app).post(`/api/lists/${listId}/cards`).set(bob).send({ title: 'x' })).status
    ).toBe(404);

    const card = await request(app)
      .post(`/api/lists/${listId}/cards`)
      .set(alice)
      .send({ title: 'private' });
    const id = card.body.card._id;

    expect((await request(app).get(`/api/cards/${id}`).set(bob)).status).toBe(404);
    expect((await request(app).patch(`/api/cards/${id}`).set(bob).send({ title: 'h' })).status).toBe(404);
    expect((await request(app).delete(`/api/cards/${id}`).set(bob)).status).toBe(404);
  });
});

describe('Cascade delete', () => {
  it('deletes a list\'s cards when the list is deleted', async () => {
    const alice = await authFor('alice@example.com');
    const { listId } = await boardWithList(alice);
    await request(app).post(`/api/lists/${listId}/cards`).set(alice).send({ title: 'c' });

    await request(app).delete(`/api/lists/${listId}`).set(alice);

    const res = await request(app).get(`/api/lists/${listId}/cards`).set(alice);
    expect(res.status).toBe(404); // list gone → cards gone with it
  });

  it('deletes cards when their board is deleted', async () => {
    const alice = await authFor('alice@example.com');
    const { boardId, listId } = await boardWithList(alice);
    await request(app).post(`/api/lists/${listId}/cards`).set(alice).send({ title: 'c' });

    await request(app).delete(`/api/boards/${boardId}`).set(alice);

    // The whole board (and its lists/cards) is gone.
    expect((await request(app).get(`/api/boards/${boardId}`).set(alice)).status).toBe(404);
  });
});
