import express from 'express';
import Product, { CATEGORIES } from '../models/Product.js';
import Order from '../models/Order.js';
import Offer from '../models/Offer.js';
import Review from '../models/Review.js';
import Supplier from '../models/Supplier.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireApprovedSupplier, getSupplierForUser } from '../middleware/supplierAuth.js';
import { createNotification } from '../utils/notifications.js';
import { advanceTracking } from '../utils/orderTracking.js';

const router = express.Router();
router.use(protect, authorize('supplier', 'admin'));

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Profile & status (any supplier role, even pending)
router.get('/me', async (req, res) => {
  const supplier = await getSupplierForUser(req.user);
  if (!supplier) return res.status(404).json({ message: 'No supplier profile' });
  res.json(supplier);
});

router.put('/profile', async (req, res) => {
  const supplier = await getSupplierForUser(req.user);
  if (!supplier) return res.status(404).json({ message: 'No supplier profile' });
  Object.assign(supplier, req.body);
  await supplier.save();
  res.json(supplier);
});

router.use(requireApprovedSupplier);

// Dashboard overview
router.get('/dashboard', async (req, res) => {
  const sid = req.supplier._id;
  const [products, orders, offers, reviews] = await Promise.all([
    Product.find({ supplier: sid }),
    Order.find({ supplier: sid }),
    Offer.find({ supplier: sid, isActive: true }),
    Review.find({ supplier: sid }),
  ]);

  const revenue = orders
    .filter((o) => ['paid', 'partial'].includes(o.paymentStatus))
    .reduce((a, o) => a + o.totalPrice, 0);

  const pendingOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
  const lowStock = products.filter((p) => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock');

  const monthlyRevenue = await Order.aggregate([
    { $match: { supplier: sid, createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
    { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const topProducts = await Order.aggregate([
    { $match: { supplier: sid } },
    { $unwind: '$orderItems' },
    { $group: { _id: '$orderItems.product', sold: { $sum: '$orderItems.quantity' }, revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } } } },
    { $sort: { sold: -1 } },
    { $limit: 5 },
  ]);

  res.json({
    supplier: req.supplier,
    stats: {
      totalProducts: products.length,
      totalOrders: orders.length,
      pendingOrders,
      revenue,
      activeOffers: offers.length,
      avgRating: reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : req.supplier.rating,
      lowStockCount: lowStock.length,
    },
    lowStockProducts: lowStock.slice(0, 10),
    monthlyRevenue,
    topProducts,
    recentOrders: orders.slice(0, 5),
  });
});

// Inventory CRUD
router.get('/products', async (req, res) => {
  const { search, category, stockStatus } = req.query;
  const query = { supplier: req.supplier._id };
  if (category) query.category = category;
  if (stockStatus) query.stockStatus = stockStatus;
  if (search) query.name = { $regex: search, $options: 'i' };
  const products = await Product.find(query).sort({ updatedAt: -1 });
  res.json(products);
});

router.post('/products', async (req, res) => {
  const body = { ...req.body, supplier: req.supplier._id };
  if (!body.slug) body.slug = `${slugify(body.name)}-${Date.now()}`;
  if (!body.image && body.images?.length) body.image = body.images[0];
  const product = await Product.create(body);
  res.status(201).json(product);
});

router.put('/products/:id', async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, supplier: req.supplier._id });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  Object.assign(product, req.body);
  await product.save();
  res.json(product);
});

router.delete('/products/:id', async (req, res) => {
  const deleted = await Product.findOneAndDelete({ _id: req.params.id, supplier: req.supplier._id });
  if (!deleted) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
});

router.patch('/products/:id/stock', async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, supplier: req.supplier._id });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.stock = req.body.stock ?? product.stock;
  product.stockStatus = req.body.stockStatus;
  await product.save();
  if (product.stockStatus === 'low_stock' && req.user.supplierId) {
    await createNotification(req.user._id, {
      type: 'inventory',
      title: 'Low Stock Alert',
      message: `${product.name} is running low (${product.stock} left)`,
      data: { productId: product._id },
    });
  }
  res.json(product);
});

router.get('/categories', (req, res) => res.json(CATEGORIES));

// Orders
router.get('/orders', async (req, res) => {
  const orders = await Order.find({ supplier: req.supplier._id })
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });
  res.json(orders);
});

router.put('/orders/:id/status', async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, supplier: req.supplier._id });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const { status, rejectReason } = req.body;
  if (status === 'cancelled' && rejectReason) order.notes = rejectReason;
  order.status = status;
  order.tracking = advanceTracking(order.tracking, status);
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
  await order.save();
  if (order.user) {
    await createNotification(order.user, {
      type: 'order',
      title: 'Order Update',
      message: `Your order is now: ${status.replace(/_/g, ' ')}`,
      data: { orderId: order._id },
    });
  }
  res.json(order);
});

router.get('/orders/:id/invoice', async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, supplier: req.supplier._id })
    .populate('user', 'name email phone');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({
    invoiceNumber: order.invoiceNumber || `INV-${order._id.toString().slice(-8).toUpperCase()}`,
    order,
    supplier: req.supplier,
    generatedAt: new Date(),
  });
});

// Offers
router.get('/offers', async (req, res) => {
  const offers = await Offer.find({ supplier: req.supplier._id }).sort({ createdAt: -1 });
  res.json(offers);
});

router.post('/offers', async (req, res) => {
  const offer = await Offer.create({ ...req.body, supplier: req.supplier._id });
  res.status(201).json(offer);
});

router.put('/offers/:id', async (req, res) => {
  const offer = await Offer.findOneAndUpdate(
    { _id: req.params.id, supplier: req.supplier._id },
    req.body,
    { new: true }
  );
  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  res.json(offer);
});

router.delete('/offers/:id', async (req, res) => {
  await Offer.findOneAndDelete({ _id: req.params.id, supplier: req.supplier._id });
  res.json({ message: 'Offer removed' });
});

// Reviews
router.get('/reviews', async (req, res) => {
  const reviews = await Review.find({ supplier: req.supplier._id }).populate('user', 'name').sort({ createdAt: -1 });
  res.json(reviews);
});

// Delivery settings
router.put('/delivery', async (req, res) => {
  req.supplier.deliveryTime = req.body.deliveryTime || req.supplier.deliveryTime;
  req.supplier.minOrder = req.body.minOrder ?? req.supplier.minOrder;
  await req.supplier.save();
  res.json(req.supplier);
});

export default router;
