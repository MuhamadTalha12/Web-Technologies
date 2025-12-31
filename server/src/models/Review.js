import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true, unique: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: null },
  },
  { timestamps: true }
);

reviewSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.booking_id = String(ret.bookingId);
    ret.service_id = String(ret.serviceId);
    ret.provider_id = String(ret.providerId);
    ret.customer_id = String(ret.customerId);
    ret.created_at = ret.createdAt;
    delete ret._id;
    delete ret.__v;
    delete ret.bookingId;
    delete ret.serviceId;
    delete ret.providerId;
    delete ret.customerId;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export const Review = mongoose.model('Review', reviewSchema);
