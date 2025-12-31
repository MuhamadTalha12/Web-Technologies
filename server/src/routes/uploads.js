import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../lib/env.js';
import { badRequest } from '../lib/http-error.js';
import { asyncHandler } from '../lib/async-handler.js';

export const uploadsRouter = Router();

const maxBytes = env.maxUploadMb * 1024 * 1024;

function isVercel() {
  return process.env.VERCEL === '1' || process.env.VERCEL === 'true';
}

function getUploadsRoot() {
  // Vercel serverless: only /tmp is writable, and it's ephemeral.
  if (isVercel()) return path.join('/tmp', env.uploadsDir);
  return path.join(process.cwd(), env.uploadsDir);
}

function getRequestBaseUrl(req) {
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').toString();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').toString();
  if (!host) return '';
  return `${proto}://${host}`;
}

function getBucket(req) {
  const fromQuery = req.query?.bucket;
  const fromHeader = req.headers['x-upload-bucket'];
  const fromBody = req.body?.bucket;
  const bucket = (fromQuery || fromHeader || fromBody || '').toString();
  return bucket;
}

function normalizeUploadError(err) {
  if (err?.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return badRequest(`File too large (max ${env.maxUploadMb}MB)`);
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return badRequest('Unexpected file field (expected "file")');
    }
    return badRequest(err.message || 'Upload failed');
  }
  return err;
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const bucket = getBucket(req);
    if (!['avatars', 'service-images'].includes(bucket)) return cb(badRequest('Invalid bucket'));

    const userId = req.auth.userId;
    const dest = path.join(getUploadsRoot(), bucket, userId);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: maxBytes },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(badRequest('Only image uploads are allowed'));
    cb(null, true);
  },
});

function uploadSingleFile(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err) return next(normalizeUploadError(err));
    return next();
  });
}

uploadsRouter.post(
  '/uploads',
  requireAuth,
  uploadSingleFile,
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('Missing file');

    const bucket = getBucket(req);
    const rel = `/${env.uploadsDir}/${bucket}/${req.auth.userId}/${req.file.filename}`;
    const base = getRequestBaseUrl(req);
    res.status(201).json({ url: base ? `${base}${rel}` : rel });
  })
);
