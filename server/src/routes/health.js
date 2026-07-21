import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Liveness/readiness check. Also reports whether the DB connection is up
// (readyState 1 = connected) — handy for the Azure health probe later.
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
