import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { unauthorized } from '../lib/http-error.js';

export const usersRouter = Router();

const updateMeSchema = z.object({
  full_name: z.string().min(1),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable().or(z.literal('')),
});

usersRouter.get(
  '/users/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.auth.userId);
    if (!user) throw unauthorized('User not found');

    res.json({
      profile: { id: String(user._id), email: user.email, ...user.profile },
      roles: user.roles,
      user: user.toJSON(),
    });
  })
);

usersRouter.put(
  '/users/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = updateMeSchema.parse(req.body);

    const user = await User.findById(req.auth.userId);
    if (!user) throw unauthorized('User not found');

    user.profile.full_name = input.full_name;
    user.profile.phone = input.phone ?? null;
    user.profile.location = input.location ?? null;
    user.profile.bio = input.bio ?? null;
    user.profile.avatar_url = input.avatar_url ? input.avatar_url : null;

    await user.save();

    res.json({
      profile: { id: String(user._id), email: user.email, ...user.profile },
      roles: user.roles,
      user: user.toJSON(),
    });
  })
);
