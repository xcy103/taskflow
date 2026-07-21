import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import meRouter from './routes/me.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// The Express app with no server.listen — so tests can import it directly
// (Supertest drives it without opening a port). server.js adds the listen.
const app = express();

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/me', meRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
