import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    avatar_url: { type: String, default: null },
    phone: { type: String, default: null },
    bio: { type: String, default: null },
    location: { type: String, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    roles: {
      type: [String],
      enum: ['customer', 'provider', 'admin'],
      default: [],
    },
    profile: { type: profileSchema, required: true },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
