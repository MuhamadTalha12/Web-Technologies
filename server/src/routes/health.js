import { Router } from 'express';
import mongoose from 'mongoose';
import { getDbDebugInfo } from '../lib/db.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  const readyState = mongoose.connection.readyState;
  const stateLabel =
    readyState === 0
      ? 'disconnected'
      : readyState === 1
        ? 'connected'
        : readyState === 2
          ? 'connecting'
          : readyState === 3
            ? 'disconnecting'
            : 'unknown';

  const debug = getDbDebugInfo();

  res.json({
    ok: true,
    db: {
      readyState,
      state: stateLabel,
      mongoUriSet: Boolean(process.env.MONGODB_URI),
      lastError: debug.lastError,
    },
  });
});
