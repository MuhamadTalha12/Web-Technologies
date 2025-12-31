import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import mongoose from 'mongoose';

import { env } from './lib/env.js';
import { connectDb } from './lib/db.js';
import { notFound } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { servicesRouter } from './routes/services.js';
import { bookingsRouter } from './routes/bookings.js';
import { reviewsRouter } from './routes/reviews.js';
import { adminRouter } from './routes/admin.js';
import { uploadsRouter } from './routes/uploads.js';

function isVercel() {
  return process.env.VERCEL === '1' || process.env.VERCEL === 'true';
}

function getUploadsRoot() {
  // NOTE: Vercel serverless filesystem is ephemeral. /tmp is writable.
  // This makes uploads work but they are NOT guaranteed to persist.
  if (isVercel()) return path.join('/tmp', env.uploadsDir);
  return path.join(process.cwd(), env.uploadsDir);
}

// Start the API even if MongoDB is temporarily unavailable.
// Routes that require DB will return 503 until connected.
void connectDb();

const app = express();
app.disable('x-powered-by');

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Static uploads
app.use(`/${env.uploadsDir}`, express.static(getUploadsRoot()));

app.use(async (req, res, next) => {
  const isHealth = req.path === '/api/health' || req.path === '/health';
  const isUploads = req.path.startsWith('/api/uploads') || req.path.startsWith(`/${env.uploadsDir}`);
  if (isHealth || isUploads) return next();

  const readyState = mongoose.connection.readyState;
  if (readyState !== 1) {
    // On serverless, wait for the initial connection instead of endlessly returning 503.
    await connectDb();
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database unavailable',
      db: { readyState: mongoose.connection.readyState },
    });
  }
  return next();
});

app.use('/api', healthRouter);
app.use('/api', authRouter);
app.use('/api', usersRouter);
app.use('/api', servicesRouter);
app.use('/api', bookingsRouter);
app.use('/api', reviewsRouter);
app.use('/api', adminRouter);
app.use('/api', uploadsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
