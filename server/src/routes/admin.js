import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { badRequest, notFoundError } from '../lib/http-error.js';

export const adminRouter = Router();

adminRouter.use('/admin', requireAuth, requireRole('admin'));

adminRouter.get(
  '/admin/users',
  asyncHandler(async (_req, res) => {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    const items = users.map((u) => ({
      id: String(u._id),
      email: u.email,
      full_name: u.profile.full_name,
      avatar_url: u.profile.avatar_url ?? null,
      phone: u.profile.phone ?? null,
      bio: u.profile.bio ?? null,
      location: u.profile.location ?? null,
      roles: u.roles || [],
      created_at: u.createdAt,
    }));

    res.json({ items });
  })
);

adminRouter.get(
  '/admin/services',
  asyncHandler(async (_req, res) => {
    const items = await Service.find({}).sort({ createdAt: -1 }).lean();
    res.json({ items });
  })
);

const roleSchema = z.object({ role: z.enum(['customer', 'provider', 'admin']) });

adminRouter.post(
  '/admin/users/:id/roles',
  asyncHandler(async (req, res) => {
    const input = roleSchema.parse(req.body);

    const user = await User.findById(req.params.id);
    if (!user) throw notFoundError('User not found');

    if (!user.roles.includes(input.role)) user.roles.push(input.role);
    await user.save();

    res.json({ ok: true, roles: user.roles });
  })
);

adminRouter.delete(
  '/admin/users/:id/roles',
  asyncHandler(async (req, res) => {
    const input = roleSchema.parse(req.body);

    const user = await User.findById(req.params.id);
    if (!user) throw notFoundError('User not found');

    if (input.role === 'admin') {
      const admins = await User.countDocuments({ roles: 'admin' });
      if (admins <= 1) throw badRequest('Cannot remove the last admin', 'LAST_ADMIN');
    }

    user.roles = (user.roles || []).filter((r) => r !== input.role);
    await user.save();

    res.json({ ok: true, roles: user.roles });
  })
);
