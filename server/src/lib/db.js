import mongoose from 'mongoose';
import { env } from './env.js';

const GLOBAL_KEY = '__local_connect_mongoose__';

function getGlobalCache() {
  const g = globalThis;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      listenersAttached: false,
      promise: null,
      connected: false,
      lastError: null,
    };
  }
  return g[GLOBAL_KEY];
}

export function getDbDebugInfo() {
  const cache = getGlobalCache();
  return {
    readyState: mongoose.connection.readyState,
    connected: cache.connected,
    lastError: cache.lastError,
  };
}

export async function connectDb() {
  mongoose.set('strictQuery', true);

  const cache = getGlobalCache();

  if (!cache.listenersAttached) {
    cache.listenersAttached = true;
    mongoose.connection.on('connected', () => {
      cache.connected = true;
      // eslint-disable-next-line no-console
      console.log('MongoDB connected');
    });
    mongoose.connection.on('disconnected', () => {
      cache.connected = false;
      // eslint-disable-next-line no-console
      console.warn('MongoDB disconnected');
    });
    mongoose.connection.on('error', (err) => {
      cache.connected = false;
      cache.lastError = {
        at: new Date().toISOString(),
        name: err?.name ?? 'Error',
        message: err?.message ?? String(err),
      };
      // eslint-disable-next-line no-console
      console.error('MongoDB connection error:', err?.message ?? err);
    });
  }

  // Fast path: already connected
  if (mongoose.connection.readyState === 1) return true;

  // If a connect is already in progress, await it.
  if (cache.promise) {
    try {
      await cache.promise;
      return mongoose.connection.readyState === 1;
    } catch {
      return false;
    }
  }

  cache.promise = mongoose
    .connect(env.mongoUri, {
      // Serverless-friendly defaults: avoid hanging forever on DNS/network issues.
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 5,
    })
    .then(() => true)
    .catch((err) => {
      cache.lastError = {
        at: new Date().toISOString(),
        name: err?.name ?? 'Error',
        message: err?.message ?? String(err),
      };
      // eslint-disable-next-line no-console
      console.error('MongoDB initial connect failed:', err?.message ?? err);
      throw err;
    })
    .finally(() => {
      cache.promise = null;
    });

  try {
    await cache.promise;
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
}
