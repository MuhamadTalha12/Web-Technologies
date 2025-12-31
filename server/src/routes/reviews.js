import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/async-handler.js';
import { requireAuth } from '../middleware/auth.js';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';
import { badRequest, forbidden, notFoundError } from '../lib/http-error.js';

export const reviewsRouter = Router();

reviewsRouter.get(
  '/services/:id/reviews',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);

    const reviews = await Review.find({ serviceId: req.params.id }).sort({ createdAt: -1 }).limit(limit).lean();

    if (reviews.length === 0) return res.json({ items: [] });

    const customerIds = [...new Set(reviews.map((r) => String(r.customerId)))];
    const customers = await User.find({ _id: { $in: customerIds } }).select('email profile.full_name avatar_url profile.avatar_url').lean();

    const items = reviews.map((r) => ({
      ...r,
      id: String(r._id),
      booking_id: String(r.bookingId),
      service_id: String(r.serviceId),
      provider_id: String(r.providerId),
      customer_id: String(r.customerId),
      created_at: r.createdAt,
      customerProfile:
        customers
          .map((u) => ({
            id: String(u._id),
            email: u.email,
            full_name: u.profile.full_name,
            avatar_url: u.profile.avatar_url ?? null,
          }))
          .find((u) => u.id === String(r.customerId)) || null,
    }));

    res.json({ items });
  })
);

const createSchema = z.object({
  booking_id: z.string().min(1),
  service_id: z.string().min(1),
  provider_id: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().nullable().optional(),
});

reviewsRouter.post(
  '/reviews',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createSchema.parse(req.body);

    const booking = await Booking.findById(input.booking_id);
    if (!booking) throw notFoundError('Booking not found');

    const isOwner = String(booking.customerId) === req.auth.userId;
    if (!isOwner) throw forbidden('Not allowed');

    if (booking.status !== 'completed') throw badRequest('You can only review completed bookings');

    const service = await Service.findById(booking.serviceId);
    if (!service) throw notFoundError('Service not found');

    // Ensure payload matches booking
    if (String(service._id) !== input.service_id) throw badRequest('Mismatched service');
    if (String(service.providerId) !== input.provider_id) throw badRequest('Mismatched provider');

    const review = await Review.create({
      bookingId: booking._id,
      serviceId: service._id,
      providerId: service.providerId,
      customerId: booking.customerId,
      rating: input.rating,
      comment: input.comment ?? null,
    });

    // Update service aggregates
    const agg = await Review.aggregate([
      { $match: { serviceId: service._id } },
      { $group: { _id: '$serviceId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const row = agg[0];
    service.rating = row ? Math.round(row.avg * 10) / 10 : 0;
    service.total_reviews = row ? row.count : 0;
    await service.save();

    res.status(201).json({ review: review.toJSON() });
  })
);
