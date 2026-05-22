import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['percentage', 'flat', 'bulk', 'free_delivery', 'bogo'],
      default: 'percentage',
    },
    discountValue: { type: Number, default: 0 },
    couponCode: { type: String, uppercase: true },
    minOrder: { type: Number, default: 0 },
    bulkQty: { type: Number },
    freeQty: { type: Number },
    freeDeliveryAbove: { type: Number },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    category: { type: String },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Offer', offerSchema);
