import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantSku: String,
  name: String,
  brand: String,
  image: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  unit: String,
});

const trackingStepSchema = new mongoose.Schema({
  status: String,
  title: String,
  description: String,
  timestamp: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      label: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
      phone: String,
      lat: Number,
      lng: Number,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'half_advance', 'full_online', 'upi', 'card', 'netbanking'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    advanceAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentResult: {
      id: String,
      razorpayOrderId: String,
      razorpayPaymentId: String,
      status: String,
    },
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },
    itemsPrice: { type: Number, default: 0 },
    taxPrice: { type: Number, default: 0 },
    deliveryPrice: { type: Number, default: 49 },
    totalPrice: { type: Number, default: 0 },
    invoiceNumber: String,
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    tracking: [trackingStepSchema],
    estimatedDelivery: Date,
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    notes: String,
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
