import { Router } from 'express';
import mongoose from 'mongoose';

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

  res.json({
    ok: true,
    db: {
      readyState,
      state: stateLabel,
    },
  });
});
