import { Board } from '../models/Board.js';
import { List } from '../models/List.js';
import { httpError } from '../utils/httpError.js';

// All queries are scoped by owner === req.userId, so a user only ever sees
// or touches their own boards.

export async function createBoard(req, res) {
  const { title } = req.body || {};
  if (!title?.trim()) throw httpError(400, 'title is required');

  const board = await Board.create({ title: title.trim(), owner: req.userId });
  res.status(201).json({ board });
}

export async function listBoards(req, res) {
  const boards = await Board.find({ owner: req.userId }).sort({ createdAt: -1 });
  res.json({ boards });
}

export async function getBoard(req, res) {
  const board = await Board.findOne({ _id: req.params.id, owner: req.userId });
  if (!board) throw httpError(404, 'board not found');
  res.json({ board });
}

export async function updateBoard(req, res) {
  const { title } = req.body || {};
  if (!title?.trim()) throw httpError(400, 'title is required');

  const board = await Board.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { title: title.trim() },
    { new: true }
  );
  if (!board) throw httpError(404, 'board not found');
  res.json({ board });
}

export async function deleteBoard(req, res) {
  const board = await Board.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!board) throw httpError(404, 'board not found');

  // Cascade: remove the board's lists (cards are handled in Day 5).
  await List.deleteMany({ board: board._id });
  res.status(204).send();
}
