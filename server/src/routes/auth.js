import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { asyncHandler } from '../lib/async-handler.js';
import { badRequest, unauthorized } from '../lib/http-error.js';
import { User } from '../models/User.js';
import { signToken } from '../lib/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  role: z.enum(['customer', 'provider']).default('customer'),
});

authRouter.post(
  '/auth/register',
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);

    const existing = await User.findOne({ email: input.email.toLowerCase() }).lean();
    if (existing) throw badRequest('Email already in use', 'EMAIL_IN_USE');

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await User.create({
      email: input.email.toLowerCase(),
      passwordHash,
      roles: [input.role],
      profile: {
        full_name: input.fullName,
        avatar_url: null,
        phone: null,
        bio: null,
        location: null,
      },
    });

    const token = signToken({ sub: String(user._id) });

    res.status(201).json({
      token,
      user: user.toJSON(),
      roles: user.roles,
      profile: { id: String(user._id), email: user.email, ...user.profile },
    });
  })
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);

    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user) throw unauthorized('Invalid email or password');

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw unauthorized('Invalid email or password');

    const token = signToken({ sub: String(user._id) });

    res.json({
      token,
      user: user.toJSON(),
      roles: user.roles,
      profile: { id: String(user._id), email: user.email, ...user.profile },
    });
  })
);

authRouter.get(
  '/auth/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.auth.userId);
    if (!user) throw unauthorized('User not found');

    res.json({
      user: user.toJSON(),
      roles: user.roles,
      profile: { id: String(user._id), email: user.email, ...user.profile },
    });
  })
);
