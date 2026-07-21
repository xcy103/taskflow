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

async function makeBoard(headers) {
  const board = await request(app).post('/api/boards').set(headers).send({ title: 'B' });
  return board.body.board._id;
}

async function makeList(headers, boardId, title) {
  const res = await request(app).post(`/api/boards/${boardId}/lists`).set(headers).send({ title });
  return res.body.list._id;
}

async function makeCard(headers, listId, title) {
  const res = await request(app).post(`/api/lists/${listId}/cards`).set(headers).send({ title });
  return res.body.card._id;
}

// Fetch a list's card titles in position order.
async function titles(headers, listId) {
  const res = await request(app).get(`/api/lists/${listId}/cards`).set(headers);
  return res.body.cards.map((c) => c.title);
}

describe('Reorder within a list', () => {
  it('moves a card to a new index and renumbers positions', async () => {
    const alice = await authFor('alice@example.com');
    const boardId = await makeBoard(alice);
    const listId = await makeList(alice, boardId, 'To Do');
    await makeCard(alice, listId, 'A');
    await makeCard(alice, listId, 'B');
    const cId = await makeCard(alice, listId, 'C');

    // Move C to the front.
    const res = await request(app)
      .patch(`/api/cards/${cId}/move`)
      .set(alice)
      .send({ listId, position: 0 });
    expect(res.status).toBe(200);

    expect(await titles(alice, listId)).toEqual(['C', 'A', 'B']);
    const cards = (await request(app).get(`/api/lists/${listId}/cards`).set(alice)).body.cards;
    expect(cards.map((c) => c.position)).toEqual([0, 1, 2]);
  });
});

describe('Move across lists', () => {
  it('moves a card to another list and closes the gap in the source', async () => {
    const alice = await authFor('alice@example.com');
    const boardId = await makeBoard(alice);
    const todo = await makeList(alice, boardId, 'To Do');
    const doing = await makeList(alice, boardId, 'Doing');
    const aId = await makeCard(alice, todo, 'A');
    await makeCard(alice, todo, 'B');
    await makeCard(alice, doing, 'X');

    // Move A to the top of Doing.
    const res = await request(app)
      .patch(`/api/cards/${aId}/move`)
      .set(alice)
      .send({ listId: doing, position: 0 });
    expect(res.status).toBe(200);

    expect(await titles(alice, todo)).toEqual(['B']); // gap closed
    expect(await titles(alice, doing)).toEqual(['A', 'X']);
  });
});

describe('Move guards', () => {
  it('blocks moving into another user\'s list (404)', async () => {
    const alice = await authFor('alice@example.com');
    const bob = await authFor('bob@example.com');
    const aBoard = await makeBoard(alice);
    const aList = await makeList(alice, aBoard, 'A');
    const cardId = await makeCard(alice, aList, 'card');

    const bBoard = await makeBoard(bob);
    const bList = await makeList(bob, bBoard, 'Bob list');

    // Bob can't move Alice's card...
    expect(
      (await request(app).patch(`/api/cards/${cardId}/move`).set(bob).send({ listId: bList })).status
    ).toBe(404);
    // ...and Alice can't move her card into Bob's list.
    expect(
      (await request(app).patch(`/api/cards/${cardId}/move`).set(alice).send({ listId: bList }))
        .status
    ).toBe(404);
  });

  it('rejects a move to a list on a different board (400)', async () => {
    const alice = await authFor('alice@example.com');
    const board1 = await makeBoard(alice);
    const board2 = await makeBoard(alice);
    const list1 = await makeList(alice, board1, 'L1');
    const list2 = await makeList(alice, board2, 'L2');
    const cardId = await makeCard(alice, list1, 'card');

    const res = await request(app)
      .patch(`/api/cards/${cardId}/move`)
      .set(alice)
      .send({ listId: list2 });
    expect(res.status).toBe(400);
  });
});
