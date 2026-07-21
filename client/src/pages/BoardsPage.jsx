import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Header } from '../components/Header';
import { Spinner } from '../components/ui/Spinner';
import { ErrorBanner } from '../components/ui/ErrorBanner';

export function BoardsPage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { boards: data } = await api.get('/boards');
        setBoards(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function createBoard(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError('');
    try {
      const { board } = await api.post('/boards', { title });
      setBoards((prev) => [board, ...prev]);
      setTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function deleteBoard(id, title) {
    if (!window.confirm(`Delete "${title}" and all its lists and cards?`)) return;
    try {
      await api.delete(`/boards/${id}`);
      setBoards((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl p-6">
        <h2 className="mb-4 text-xl font-semibold">Your boards</h2>

        <form onSubmit={createBoard} className="mb-6 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New board title"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Add board
          </button>
        </form>

        <ErrorBanner message={error} onDismiss={() => setError('')} />

        {loading ? (
          <Spinner />
        ) : boards.length === 0 ? (
          <p className="text-slate-500">No boards yet — create your first one above.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((b) => (
              <div
                key={b._id}
                className="group flex items-center justify-between rounded-lg bg-white p-5 shadow-sm hover:shadow"
              >
                <Link to={`/boards/${b._id}`} className="font-medium hover:text-indigo-600">
                  {b.title}
                </Link>
                <button
                  onClick={() => deleteBoard(b._id, b.title)}
                  className="text-xs text-slate-400 opacity-0 hover:text-red-600 group-hover:opacity-100"
                  aria-label={`Delete ${b.title}`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
