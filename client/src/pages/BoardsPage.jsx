import { useAuth } from '../context/AuthContext';

// Placeholder home for authenticated users. The real boards UI (list boards,
// create, open) arrives in Phase 3 Day 8.
export function BoardsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">TaskFlow</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-500">{user?.name}</span>
          <button onClick={logout} className="text-indigo-600 hover:underline">
            Log out
          </button>
        </div>
      </header>

      <main className="p-6">
        <p className="text-slate-600">
          Welcome, <strong>{user?.name}</strong>. Your boards will appear here (Day 8).
        </p>
      </main>
    </div>
  );
}
