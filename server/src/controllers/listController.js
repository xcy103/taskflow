import { List } from '../models/List.js';
import { Card } from '../models/Card.js';
import { getOwnedBoard, getOwnedList } from '../services/ownership.js';
import { httpError } from '../utils/httpError.js';

export async function createList(req, res) {
  const { boardId } = req.params;
  await getOwnedBoard(boardId, req.userId);

  const { title } = req.body || {};
  if (!title?.trim()) throw httpError(400, 'title is required');

  // Append to the end: position = current number of lists.
  const position = await List.countDocuments({ board: boardId });
  const list = await List.create({ title: title.trim(), board: boardId, position });
  res.status(201).json({ list });
}

export async function listLists(req, res) {
  const { boardId } = req.params;
  await getOwnedBoard(boardId, req.userId);

  const lists = await List.find({ board: boardId }).sort({ position: 1 });
  res.json({ lists });
}

export async function updateList(req, res) {
  const list = await getOwnedList(req.params.id, req.userId);

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
  const list = await getOwnedList(req.params.id, req.userId);

  await list.deleteOne();
  await Card.deleteMany({ list: list._id }); // cascade: drop the list's cards
  res.status(204).send();
}
