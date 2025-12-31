import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    duration_hours: { type: Number, default: null },
    location: { type: String, default: null },
    image_url: { type: String, default: null },
    is_active: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    total_reviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceSchema.index({ title: 'text', description: 'text' });

serviceSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    ret.provider_id = String(ret.providerId);
    ret.created_at = ret.createdAt;
    ret.updated_at = ret.updatedAt;
    delete ret._id;
    delete ret.__v;
    delete ret.providerId;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export const Service = mongoose.model('Service', serviceSchema);
