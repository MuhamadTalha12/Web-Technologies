import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scheduled_date: { type: String, default: null },
    scheduled_time: { type: String, default: null },
    total_price: { type: Number, required: true, min: 0 },
    notes: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

bookingSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.service_id = String(ret.serviceId);
    ret.provider_id = String(ret.providerId);
    ret.customer_id = String(ret.customerId);
    ret.created_at = ret.createdAt;
    ret.updated_at = ret.updatedAt;
    delete ret._id;
    delete ret.__v;
    delete ret.serviceId;
    delete ret.providerId;
    delete ret.customerId;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export const Booking = mongoose.model('Booking', bookingSchema);
