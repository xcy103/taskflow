import { createContext, useContext, useEffect, useState } from 'react';
import { api, setAccessToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // restoring the session on load

  // On first load, try to restore a session from the refresh cookie.
  useEffect(() => {
    (async () => {
      try {
        const { user: restored, accessToken } = await api.post('/auth/refresh');
        setAccessToken(accessToken);
        setUser(restored);
      } catch {
        setUser(null); // no valid cookie — stay logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const { user: u, accessToken } = await api.post('/auth/login', { email, password });
    setAccessToken(accessToken);
    setUser(u);
  }

  async function register(name, email, password) {
    const { user: u, accessToken } = await api.post('/auth/register', { name, email, password });
    setAccessToken(accessToken);
    setUser(u);
  }

  function logout() {
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
