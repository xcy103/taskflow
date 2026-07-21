import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <Link to="/" className="text-lg font-semibold">
        TaskFlow
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-500">{user?.name}</span>
        <button onClick={logout} className="text-indigo-600 hover:underline">
          Log out
        </button>
      </div>
    </header>
  );
}
