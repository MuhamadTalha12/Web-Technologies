import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';
import { badRequest, forbidden, notFoundError } from '../lib/http-error.js';

export const servicesRouter = Router();

servicesRouter.get(
  '/services',
  asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 50);
    const search = (req.query.search || '').toString().trim();
    const category = (req.query.category || '').toString().trim();
    const sort = (req.query.sort || 'created_at').toString();

    const filter = { is_active: true };
    if (category) filter.category = category;

    const query = Service.find(filter);
    if (search) {
      query.find({ $text: { $search: search } });
    }

    if (sort === 'price_asc') query.sort({ price: 1 });
    else if (sort === 'price_desc') query.sort({ price: -1 });
    else if (sort === 'rating') query.sort({ rating: -1 });
    else query.sort({ createdAt: -1 });

    const [docs, total] = await Promise.all([
      query.skip((page - 1) * limit).limit(limit),
      Service.countDocuments(search ? { ...filter, $text: { $search: search } } : filter),
    ]);

    res.json({ items: docs.map((d) => d.toJSON()), total, page, limit });
  })
);

servicesRouter.get(
  '/services/mine',
  requireAuth,
  requireRole('provider', 'admin'),
  asyncHandler(async (req, res) => {
    const docs = await Service.find({ providerId: req.auth.userId }).sort({ createdAt: -1 });
    res.json({ items: docs.map((d) => d.toJSON()) });
  })
);

servicesRouter.get(
  '/services/:id',
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) throw notFoundError('Service not found');

    const provider = await User.findById(service.providerId).lean();

    res.json({
      service: service.toJSON(),
      provider: provider
        ? {
            id: String(provider._id),
            email: provider.email,
            full_name: provider.profile.full_name,
            avatar_url: provider.profile.avatar_url,
            phone: provider.profile.phone,
            bio: provider.profile.bio,
            location: provider.profile.location,
          }
        : null,
    });
  })
);

const upsertSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  duration_hours: z.number().int().positive().nullable().optional(),
  location: z.string().nullable().optional(),
  image_url: z
    .union([z.string().url(), z.string().startsWith('/'), z.literal('')])
    .nullable()
    .optional(),
});

servicesRouter.post(
  '/services',
  requireAuth,
  requireRole('provider', 'admin'),
  asyncHandler(async (req, res) => {
    const input = upsertSchema.parse(req.body);

    const created = await Service.create({
      ...input,
      image_url: input.image_url || null,
      providerId: req.auth.userId,
      is_active: true,
      rating: 0,
      total_reviews: 0,
    });

    res.status(201).json({ service: created.toJSON() });
  })
);

servicesRouter.put(
  '/services/:id',
  requireAuth,
  requireRole('provider', 'admin'),
  asyncHandler(async (req, res) => {
    const input = upsertSchema.parse(req.body);

    const service = await Service.findById(req.params.id);
    if (!service) throw notFoundError('Service not found');

    const isOwner = String(service.providerId) === req.auth.userId;
    const isAdmin = (req.auth.roles || []).includes('admin');
    if (!isOwner && !isAdmin) throw forbidden('Not allowed');

    service.title = input.title;
    service.description = input.description;
    service.category = input.category;
    service.price = input.price;
    service.duration_hours = input.duration_hours ?? null;
    service.location = input.location ?? null;
    service.image_url = input.image_url ? input.image_url : null;

    await service.save();

    res.json({ service: service.toJSON() });
  })
);

servicesRouter.patch(
  '/services/:id',
  requireAuth,
  requireRole('provider', 'admin'),
  asyncHandler(async (req, res) => {
    const schema = z.object({ is_active: z.boolean().optional() });
    const input = schema.parse(req.body);

    const service = await Service.findById(req.params.id);
    if (!service) throw notFoundError('Service not found');

    const isOwner = String(service.providerId) === req.auth.userId;
    const isAdmin = (req.auth.roles || []).includes('admin');
    if (!isOwner && !isAdmin) throw forbidden('Not allowed');

    if (typeof input.is_active === 'boolean') service.is_active = input.is_active;

    await service.save();
    res.json({ service: service.toJSON() });
  })
);

servicesRouter.delete(
  '/services/:id',
  requireAuth,
  requireRole('provider', 'admin'),
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) throw notFoundError('Service not found');

    const isOwner = String(service.providerId) === req.auth.userId;
    const isAdmin = (req.auth.roles || []).includes('admin');
    if (!isOwner && !isAdmin) throw forbidden('Not allowed');

    await service.deleteOne();
    res.status(204).send();
  })
);

servicesRouter.post(
  '/services/seed-demo',
  requireAuth,
  requireRole('provider', 'admin'),
  asyncHandler(async (req, res) => {
    const existingCount = await Service.countDocuments({ providerId: req.auth.userId });
    if (existingCount > 0) throw badRequest('Demo seeding only allowed when you have no services', 'SEED_NOT_ALLOWED');

    const demo = (req.body?.demoServices || []).slice(0, 50);
    if (!Array.isArray(demo) || demo.length === 0) throw badRequest('No demo services provided');

    const toInsert = demo.map((s) => ({
      providerId: req.auth.userId,
      title: s.title,
      description: s.description,
      category: s.category,
      price: s.price,
      duration_hours: s.duration_hours ?? null,
      location: s.location ?? null,
      image_url: s.image_url ?? null,
      is_active: true,
      rating: s.rating ?? 0,
      total_reviews: s.total_reviews ?? 0,
    }));

    await Service.insertMany(toInsert);
    res.status(201).json({ ok: true });
  })
);
