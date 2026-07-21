import dotenv from 'dotenv';

dotenv.config();

// Central place that reads process.env, so the rest of the app never touches it directly.
export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};
