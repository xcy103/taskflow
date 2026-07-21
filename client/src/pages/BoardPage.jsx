import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { api } from '../api/client';
import { Header } from '../components/Header';
import { Column } from '../components/board/Column';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';

export function BoardPage() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]); // each list carries its own cards[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newListTitle, setNewListTitle] = useState('');
  const [activeId, setActiveId] = useState(null);

  // Keep the latest lists in a ref so drag handlers never read stale state.
  const listsRef = useRef(lists);
  useEffect(() => {
    listsRef.current = lists;
  }, [lists]);

  // Small drag threshold so clicking edit/delete buttons doesn't start a drag.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [{ board: b }, { lists: ls }] = await Promise.all([
        api.get(`/boards/${id}`),
        api.get(`/boards/${id}/lists`),
      ]);
      const withCards = await Promise.all(
        ls.map(async (l) => {
          const { cards } = await api.get(`/lists/${l._id}/cards`);
          return { ...l, cards };
        })
      );
      setBoard(b);
      setLists(withCards);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --- Card CRUD (optimistic) ---
  async function addCard(listId, title) {
    try {
      const { card } = await api.post(`/lists/${listId}/cards`, { title });
      setLists((prev) =>
        prev.map((l) => (l._id === listId ? { ...l, cards: [...l.cards, card] } : l))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function editCard(cardId, title) {
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        cards: l.cards.map((c) => (c._id === cardId ? { ...c, title } : c)),
      }))
    );
    try {
      await api.patch(`/cards/${cardId}`, { title });
    } catch (err) {
      setError(err.message);
      load();
    }
  }

  async function deleteCard(cardId) {
    setLists((prev) =>
      prev.map((l) => ({ ...l, cards: l.cards.filter((c) => c._id !== cardId) }))
    );
    try {
      await api.delete(`/cards/${cardId}`);
    } catch (err) {
      setError(err.message);
      load();
    }
  }

  async function addList(e) {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const { list } = await api.post(`/boards/${id}/lists`, { title: newListTitle });
      setLists((prev) => [...prev, { ...list, cards: [] }]);
      setNewListTitle('');
    } catch (err) {
      setError(err.message);
    }
  }

  // --- Drag & drop ---
  // Which list (container) a draggable id belongs to. A list id is itself a container.
  function findContainer(dragId) {
    if (listsRef.current.some((l) => l._id === dragId)) return dragId;
    return listsRef.current.find((l) => l.cards.some((c) => c._id === dragId))?._id;
  }

  async function persistMove(cardId, listId, position) {
    try {
      await api.patch(`/cards/${cardId}/move`, { listId, position });
    } catch (err) {
      setError('Move failed — reloading.');
      load();
    }
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    if (!over) return;

    const from = findContainer(active.id);
    const to = findContainer(over.id);
    if (!from || !to) return;

    const current = listsRef.current;
    const fromList = current.find((l) => l._id === from);
    const toList = current.find((l) => l._id === to);
    const activeCard = fromList.cards.find((c) => c._id === active.id);
    if (!activeCard) return;

    // Target index: dropped on a card → its index; dropped on the column → end.
    const overIsColumn = over.id === to;
    const overIndex = overIsColumn ? toList.cards.length : toList.cards.findIndex((c) => c._id === over.id);

    let next;
    let finalIndex;
    if (from === to) {
      const oldIndex = fromList.cards.findIndex((c) => c._id === active.id);
      finalIndex = overIndex < 0 ? fromList.cards.length - 1 : overIndex;
      if (oldIndex === finalIndex) return;
      const reordered = arrayMove(fromList.cards, oldIndex, finalIndex);
      next = current.map((l) => (l._id === to ? { ...l, cards: reordered } : l));
    } else {
      finalIndex = overIndex < 0 ? toList.cards.length : overIndex;
      const newFrom = fromList.cards.filter((c) => c._id !== active.id);
      const newTo = [...toList.cards];
      newTo.splice(finalIndex, 0, activeCard);
      next = current.map((l) =>
        l._id === from ? { ...l, cards: newFrom } : l._id === to ? { ...l, cards: newTo } : l
      );
    }

    setLists(next);
    listsRef.current = next;
    persistMove(active.id, to, finalIndex);
  }

  const activeCard = activeId
    ? lists.flatMap((l) => l.cards).find((c) => c._id === activeId)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="p-6">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error && !board) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="p-6">
          <p className="text-red-600">{error}</p>
          <Link to="/" className="text-indigo-600 hover:underline">
            ← Back to boards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/" className="text-sm text-indigo-600 hover:underline">
            ← Boards
          </Link>
          <h2 className="text-xl font-semibold">{board?.title}</h2>
        </div>

        <ErrorBanner message={error} onDismiss={() => setError('')} />

        {lists.length === 0 && (
          <p className="mb-4 text-sm text-slate-500">
            This board is empty — add your first list to get started.
          </p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={({ active }) => setActiveId(active.id)}
          onDragCancel={() => setActiveId(null)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-start gap-4 overflow-x-auto pb-4">
            {lists.map((list) => (
              <Column
                key={list._id}
                list={list}
                onAddCard={addCard}
                onEditCard={editCard}
                onDeleteCard={deleteCard}
              />
            ))}

            <form onSubmit={addList} className="w-72 shrink-0 rounded-lg bg-slate-200/40 p-3">
              <input
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="+ Add a list"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </form>
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="rounded-md bg-white p-3 text-sm shadow-lg">{activeCard.title}</div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
