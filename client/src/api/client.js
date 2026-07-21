const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Access token lives in memory only (never localStorage) — the refresh token
// is an httpOnly cookie the browser sends automatically with credentials.
let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Paths that must never trigger the 401 → refresh → retry loop.
const NO_RETRY = ['/auth/refresh', '/auth/login', '/auth/register'];

async function tryRefresh() {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

async function request(path, options = {}, retry = true) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  // Access token expired? Refresh once, then replay the original request.
  if (res.status === 401 && retry && !NO_RETRY.includes(path)) {
    if (await tryRefresh()) return request(path, options, false);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'Request failed', res.status);
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
