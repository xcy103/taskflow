import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Gate for authenticated pages: wait while the session is restored, then either
// render the page or bounce to /login.
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-slate-500">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
