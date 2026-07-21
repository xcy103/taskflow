import { Board } from '../models/Board.js';
import { List } from '../models/List.js';
import { httpError } from '../utils/httpError.js';

// Lists live under a board; ownership is enforced via the parent board.
// Returns the board if the user owns it, else throws 404 (don't reveal existence).
async function assertBoardOwned(boardId, userId) {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  if (!board) throw httpError(404, 'board not found');
  return board;
}

export async function createList(req, res) {
  const { boardId } = req.params;
  await assertBoardOwned(boardId, req.userId);

  const { title } = req.body || {};
  if (!title?.trim()) throw httpError(400, 'title is required');

  // Append to the end: position = current number of lists.
  const position = await List.countDocuments({ board: boardId });
  const list = await List.create({ title: title.trim(), board: boardId, position });
  res.status(201).json({ list });
}

export async function listLists(req, res) {
  const { boardId } = req.params;
  await assertBoardOwned(boardId, req.userId);

  const lists = await List.find({ board: boardId }).sort({ position: 1 });
  res.json({ lists });
}

export async function updateList(req, res) {
  const list = await List.findById(req.params.id);
  if (!list) throw httpError(404, 'list not found');
  await assertBoardOwned(list.board, req.userId);

  const { title, position } = req.body || {};
  if (title !== undefined) {
    if (!title.trim()) throw httpError(400, 'title cannot be empty');
    list.title = title.trim();
  }
  if (position !== undefined) list.position = position;

  await list.save();
  res.json({ list });
}

export async function deleteList(req, res) {
  const list = await List.findById(req.params.id);
  if (!list) throw httpError(404, 'list not found');
  await assertBoardOwned(list.board, req.userId);

  await list.deleteOne();
  res.status(204).send();
}
