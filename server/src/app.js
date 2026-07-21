import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';

// The Express app with no server.listen — so tests can import it directly
// (Supertest drives it without opening a port). server.js adds the listen.
const app = express();

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

// Fallthrough 404 for unknown API routes.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Basic error handler (formalized in Phase 1 Day 3). Catches errors forwarded
// by asyncHandler so requests never hang.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export default app;
