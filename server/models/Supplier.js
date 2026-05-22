import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    categories: [{ type: String }],
    deliveryTime: { type: String, default: '30-45 mins' },
    minOrder: { type: Number, default: 500 },
    isActive: { type: Boolean, default: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Supplier = mongoose.model('Supplier', supplierSchema);
export default Supplier;
