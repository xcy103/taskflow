import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

// Access token: short-lived, sent in the Authorization header on every request.
export function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, config.jwtAccessSecret, {
    expiresIn: config.accessTokenTtl,
  });
}

// Refresh token: longer-lived, stored in an httpOnly cookie; used only to mint
// new access tokens (Phase 1 Day 3).
export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId }, config.jwtRefreshSecret, {
    expiresIn: config.refreshTokenTtl,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwtRefreshSecret);
}
