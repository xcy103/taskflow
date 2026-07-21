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

// Rewrite an ordered array of cards to positions 0..n-1 (persisting list changes too).
async function reindex(orderedCards) {
  for (let i = 0; i < orderedCards.length; i++) {
    orderedCards[i].position = i;
    await orderedCards[i].save();
  }
}

// Move a card within its list or to another list on the same board, at a given index.
// Body: { listId, position }. We rebuild the affected lists' ordering rather than
// nudging individual positions — simpler and avoids off-by-one bugs.
export async function moveCard(req, res) {
  const { listId } = req.body || {};
  if (!listId) throw httpError(400, 'listId is required');

  const card = await getOwnedCard(req.params.id, req.userId);
  const targetList = await getOwnedList(listId, req.userId);

  if (String(targetList.board) !== String(card.board)) {
    throw httpError(400, 'cannot move a card to a different board');
  }

  const rawPos = req.body.position;
  const desiredPos = Number.isInteger(rawPos) ? rawPos : Number.MAX_SAFE_INTEGER;
  const sameList = String(card.list) === String(listId);

  if (sameList) {
    const cards = await Card.find({ list: listId }).sort({ position: 1 });
    const others = cards.filter((c) => String(c._id) !== String(card._id));
    others.splice(Math.max(0, Math.min(desiredPos, others.length)), 0, card);
    await reindex(others);
  } else {
    // Close the gap in the source list.
    const sourceCards = (await Card.find({ list: card.list }).sort({ position: 1 })).filter(
      (c) => String(c._id) !== String(card._id)
    );
    await reindex(sourceCards);

    // Insert into the target list.
    card.list = listId;
    const targetCards = await Card.find({ list: listId }).sort({ position: 1 });
    targetCards.splice(Math.max(0, Math.min(desiredPos, targetCards.length)), 0, card);
    await reindex(targetCards);
  }

  const updated = await Card.findById(card._id);
  res.json({ card: updated });
}
