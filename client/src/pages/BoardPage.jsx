import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Header } from '../components/Header';

export function BoardPage() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]); // each list carries its own cards[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newListTitle, setNewListTitle] = useState('');

  useEffect(() => {
    (async () => {
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
    })();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <p className="p-6 text-slate-500">Loading…</p>
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

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          {lists.map((list) => (
            <section
              key={list._id}
              className="w-72 shrink-0 rounded-lg bg-slate-200/70 p-3"
            >
              <h3 className="mb-2 px-1 font-medium">{list.title}</h3>
              <div className="space-y-2">
                {list.cards.map((card) => (
                  <div key={card._id} className="rounded-md bg-white p-3 text-sm shadow-sm">
                    {card.title}
                  </div>
                ))}
                {list.cards.length === 0 && (
                  <p className="px-1 py-2 text-xs text-slate-400">No cards yet.</p>
                )}
              </div>
            </section>
          ))}

          {/* Add-list column */}
          <form
            onSubmit={addList}
            className="w-72 shrink-0 rounded-lg bg-slate-200/40 p-3"
          >
            <input
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="+ Add a list"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </form>
        </div>
      </main>
    </div>
  );
}
