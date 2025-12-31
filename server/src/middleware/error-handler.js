import { ZodError } from 'zod';

export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request',
      details: err.flatten(),
    });
  }

  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = err?.message || 'Internal server error';

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return res.status(status).json({
    error: err?.code || 'SERVER_ERROR',
    message,
  });
}
