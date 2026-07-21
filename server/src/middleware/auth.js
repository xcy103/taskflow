import { verifyAccessToken } from '../utils/tokens.js';

// Gate for protected routes. Expects `Authorization: Bearer <accessToken>`,
// verifies it, and attaches req.userId for downstream handlers.
export function authRequired(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'authentication required' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}
