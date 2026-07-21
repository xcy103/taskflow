import { Card } from '../models/Card.js';
import { getOwnedList } from '../services/ownership.js';
import { httpError } from '../utils/httpError.js';

// Load a card and confirm the user owns it (via its list's board), else 404.
async function getOwnedCard(cardId, userId) {
  const card = await Card.findById(cardId);
  if (!card) throw httpError(404, 'card not found');
  await getOwnedList(card.list, userId);
  return card;
}

export async function createCard(req, res) {
  const { listId } = req.params;
  const list = await getOwnedList(listId, req.userId);

  const { title, description, dueDate } = req.body || {};
  if (!title?.trim()) throw httpError(400, 'title is required');

  const position = await Card.countDocuments({ list: listId });
  const card = await Card.create({
    title: title.trim(),
    description: description?.trim() || '',
    list: listId,
    board: list.board,
    position,
    dueDate: dueDate || undefined,
  });
  res.status(201).json({ card });
}

export async function listCards(req, res) {
  const { listId } = req.params;
  await getOwnedList(listId, req.userId);

  const cards = await Card.find({ list: listId }).sort({ position: 1 });
  res.json({ cards });
}

export async function getCard(req, res) {
  const card = await getOwnedCard(req.params.id, req.userId);
  res.json({ card });
}

export async function updateCard(req, res) {
  const card = await getOwnedCard(req.params.id, req.userId);

  const { title, description, dueDate } = req.body || {};
  if (title !== undefined) {
    if (!title.trim()) throw httpError(400, 'title cannot be empty');
    card.title = title.trim();
  }
  if (description !== undefined) card.description = description.trim();
  if (dueDate !== undefined) card.dueDate = dueDate || undefined;

  await card.save();
  res.json({ card });
}

export async function deleteCard(req, res) {
  const card = await getOwnedCard(req.params.id, req.userId);
  await card.deleteOne();
  res.status(204).send();
}
