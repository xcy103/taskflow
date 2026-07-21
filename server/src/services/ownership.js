import { Board } from '../models/Board.js';
import { List } from '../models/List.js';
import { httpError } from '../utils/httpError.js';

// Single source of truth for "does this user own this resource?" checks.
// Everything is scoped through the owning board; a miss throws 404 so we never
// reveal that a resource exists to a user who can't access it.

export async function getOwnedBoard(boardId, userId) {
  const board = await Board.findOne({ _id: boardId, owner: userId });
  if (!board) throw httpError(404, 'board not found');
  return board;
}

export async function getOwnedList(listId, userId) {
  const list = await List.findById(listId);
  if (!list) throw httpError(404, 'list not found');
  await getOwnedBoard(list.board, userId); // enforce ownership via the parent board
  return list;
}
