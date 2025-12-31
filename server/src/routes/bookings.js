import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Booking } from '../models/Booking.js';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { badRequest, forbidden, notFoundError } from '../lib/http-error.js';

export const bookingsRouter = Router();

bookingsRouter.get(
  '/bookings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.auth.userId;
    const isAdmin = (req.auth.roles || []).includes('admin');

    const baseFilter = isAdmin
      ? {}
      : {
          $or: [{ customerId: userId }, { providerId: userId }],
        };

    const bookings = await Booking.find(baseFilter).sort({ createdAt: -1 }).lean();

    if (bookings.length === 0) return res.json({ items: [] });

    const serviceIds = [...new Set(bookings.map((b) => String(b.serviceId)))];
    const customerIds = [...new Set(bookings.map((b) => String(b.customerId)))];
    const providerIds = [...new Set(bookings.map((b) => String(b.providerId)))];
    const bookingIds = bookings.map((b) => String(b._id));

    const [services, customers, providers, reviews] = await Promise.all([
      Service.find({ _id: { $in: serviceIds } }).select('title image_url category location').lean(),
      User.find({ _id: { $in: customerIds } }).select('email profile.full_name').lean(),
      User.find({ _id: { $in: providerIds } }).select('email profile.full_name').lean(),
      Review.find({ bookingId: { $in: bookingIds } }).select('bookingId').lean(),
    ]);

    const reviewed = new Set(reviews.map((r) => String(r.bookingId)));

    const items = bookings.map((b) => ({
      ...b,
      id: String(b._id),
      service_id: String(b.serviceId),
      provider_id: String(b.providerId),
      customer_id: String(b.customerId),
      created_at: b.createdAt,
      updated_at: b.updatedAt,
      service:
        services
          .map((s) => ({
            id: String(s._id),
            title: s.title,
            image_url: s.image_url ?? null,
            category: s.category,
            location: s.location ?? null,
          }))
          .find((s) => s.id === String(b.serviceId)) || null,
      customerProfile:
        customers
          .map((u) => ({
            id: String(u._id),
            full_name: u.profile.full_name,
            email: u.email,
          }))
          .find((u) => u.id === String(b.customerId)) || null,
      providerProfile:
        providers
          .map((u) => ({
            id: String(u._id),
            full_name: u.profile.full_name,
            email: u.email,
          }))
          .find((u) => u.id === String(b.providerId)) || null,
      hasReview: reviewed.has(String(b._id)),
    }));

    res.json({ items });
  })
);

bookingsRouter.get(
  '/bookings/recent',
  requireAuth,
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '5', 10), 1), 20);
    const userId = req.auth.userId;
    const isAdmin = (req.auth.roles || []).includes('admin');

    const filter = isAdmin
      ? {}
      : {
          $or: [{ customerId: userId }, { providerId: userId }],
        };

    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

    if (bookings.length === 0) return res.json({ items: [] });

    const serviceIds = [...new Set(bookings.map((b) => String(b.serviceId)))];
    const customerIds = [...new Set(bookings.map((b) => String(b.customerId)))];
    const providerIds = [...new Set(bookings.map((b) => String(b.providerId)))];

    const [services, customers, providers] = await Promise.all([
      Service.find({ _id: { $in: serviceIds } }).select('title image_url category').lean(),
      User.find({ _id: { $in: customerIds } }).select('profile.full_name').lean(),
      User.find({ _id: { $in: providerIds } }).select('profile.full_name').lean(),
    ]);

    const items = bookings.map((b) => ({
      ...b,
      id: String(b._id),
      service_id: String(b.serviceId),
      provider_id: String(b.providerId),
      customer_id: String(b.customerId),
      created_at: b.createdAt,
      updated_at: b.updatedAt,
      service:
        services
          .map((s) => ({ id: String(s._id), title: s.title, image_url: s.image_url ?? null, category: s.category }))
          .find((s) => s.id === String(b.serviceId)) || null,
      customerProfile:
        customers
          .map((u) => ({ id: String(u._id), full_name: u.profile.full_name }))
          .find((u) => u.id === String(b.customerId)) || null,
      providerProfile:
        providers
          .map((u) => ({ id: String(u._id), full_name: u.profile.full_name }))
          .find((u) => u.id === String(b.providerId)) || null,
    }));

    res.json({ items });
  })
);

const createSchema = z.object({
  service_id: z.string().min(1),
  scheduled_date: z.string().min(1),
  scheduled_time: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

bookingsRouter.post(
  '/bookings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createSchema.parse(req.body);

    const service = await Service.findById(input.service_id);
    if (!service) throw notFoundError('Service not found');
    if (!service.is_active) throw badRequest('Service is not available');

    const booking = await Booking.create({
      serviceId: service._id,
      providerId: service.providerId,
      customerId: req.auth.userId,
      scheduled_date: input.scheduled_date,
      scheduled_time: input.scheduled_time ?? null,
      total_price: service.price,
      notes: input.notes ?? null,
      status: 'pending',
    });

    res.status(201).json({ booking: booking.toJSON() });
  })
);

const statusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
});

bookingsRouter.patch(
  '/bookings/:id/status',
  requireAuth,
  requireRole('provider', 'admin'),
  asyncHandler(async (req, res) => {
    const input = statusSchema.parse(req.body);

    const booking = await Booking.findById(req.params.id);
    if (!booking) throw notFoundError('Booking not found');

    const isOwner = String(booking.providerId) === req.auth.userId;
    const isAdmin = (req.auth.roles || []).includes('admin');
    if (!isOwner && !isAdmin) throw forbidden('Not allowed');

    booking.status = input.status;
    await booking.save();

    res.json({ booking: booking.toJSON() });
  })
);
