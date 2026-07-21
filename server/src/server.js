import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

// Entry point: connect to the DB, then start listening.
async function start() {
  await connectDB(config.mongoUri);
  app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port} (${config.nodeEnv})`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
