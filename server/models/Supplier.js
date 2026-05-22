import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    businessName: { type: String, default: '' },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    address: { street: String, city: String, state: String, pincode: String },
    categories: [{ type: String }],
    deliveryTime: { type: String, default: '30-45 mins' },
    minOrder: { type: Number, default: 500 },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'approved',
    },
    rejectionReason: { type: String, default: '' },
    documents: [{ name: String, url: String }],
    verifiedAt: Date,
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bankDetails: { accountName: String, accountNo: String, ifsc: String },
  },
  { timestamps: true }
);

export default mongoose.model('Supplier', supplierSchema);
