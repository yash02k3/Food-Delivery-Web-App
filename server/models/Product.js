import mongoose from 'mongoose';

export const CATEGORIES = [
  'Cement', 'Bricks', 'Sand', 'Steel', 'Tiles', 'Paint',
  'Pipes', 'Plumbing', 'Electrical', 'Tools',
];

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  label: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  stock: { type: Number, default: 50 },
  image: String,
  unit: { type: String, default: 'piece' },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    category: { type: String, enum: CATEGORIES, required: true },
    subcategory: { type: String, default: '' },
    image: { type: String, required: true },
    images: [String],
    unit: { type: String, default: 'piece' },
    stock: { type: Number, default: 100 },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
    },
    lowStockThreshold: { type: Number, default: 10 },
    rating: { type: Number, default: 4.2, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    brand: { type: String, default: '' },
    brands: [String],
    variants: [variantSchema],
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    discount: { type: Number, default: 0 },
    dealEndsAt: Date,
    tags: [String],
    deliveryEstimate: { type: String, default: '30-45 mins' },
    minOrderQty: { type: Number, default: 1 },
    gstPercent: { type: Number, default: 18 },
    weight: { value: Number, unit: { type: String, default: 'kg' } },
    dimensions: { length: Number, width: Number, height: Number, unit: { type: String, default: 'cm' } },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.stock <= 0) this.stockStatus = 'out_of_stock';
  else if (this.stock <= (this.lowStockThreshold || 10)) this.stockStatus = 'low_stock';
  else this.stockStatus = 'in_stock';
  next();
});

productSchema.index({ supplier: 1 });
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);
