import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  });
  mongoose.connection.on('disconnected', () => {
    // eslint-disable-next-line no-console
    console.warn('MongoDB disconnected');
  });
  mongoose.connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err?.message ?? err);
  });

  try {
    await mongoose.connect(env.mongoUri);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB initial connect failed:', err?.message ?? err);
    return false;
  }
}
