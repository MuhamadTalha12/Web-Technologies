import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(`/${env.uploadsDir}`, express.static(path.join(__dirname, '..', '..', env.uploadsDir)));

app.use((req, res, next) => {
  const isHealth = req.path === '/api/health' || req.path === '/health';
  const isUploads = req.path.startsWith('/api/uploads');
  if (isHealth || isUploads) return next();

  const readyState = mongoose.connection.readyState;
  if (readyState !== 1) {
    return res.status(503).json({
      error: 'Database unavailable',
      db: { readyState },
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

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.port}`);
});
