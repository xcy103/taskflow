import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

const router = Router();

// Returns the authenticated user — proves the whole auth chain end to end.
router.get(
  '/',
  authRequired,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }
    return res.json({ user });
  })
);

export default router;
