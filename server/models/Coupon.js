import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  discountType: { type: String, enum: ['percent', 'flat'], default: 'percent' },
  discountValue: { type: Number, required: true },
  minOrder: { type: Number, default: 500 },
  maxDiscount: { type: Number, default: 500 },
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
});

export default mongoose.model('Coupon', couponSchema);
