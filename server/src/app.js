import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import healthRouter from './routes/health.js';

// The Express app with no server.listen — so tests can import it directly
// (Supertest drives it without opening a port). server.js adds the listen.
const app = express();

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/health', healthRouter);

// Fallthrough 404 for unknown API routes.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
