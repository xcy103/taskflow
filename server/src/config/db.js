import mongoose from 'mongoose';

// Connect to MongoDB. Called once at startup (server.js); tests use an in-memory
// server instead, so this is deliberately kept separate from app.js.
export async function connectDB(uri) {
  if (!uri) throw new Error('MONGODB_URI is not set');

  mongoose.connection.on('connected', () => console.log('MongoDB connected'));
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));

  await mongoose.connect(uri);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
