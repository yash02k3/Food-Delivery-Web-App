import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Supplier from '../models/Supplier.js';
import Coupon from '../models/Coupon.js';
import Banner from '../models/Banner.js';
import Offer from '../models/Offer.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/stats', async (req, res) => {
  const [users, products, orders, suppliers, pendingSuppliers, revenue, recentOrders] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Supplier.countDocuments({ status: 'approved' }),
    Supplier.countDocuments({ status: 'pending' }),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.find().populate('user', 'name').populate('supplier', 'name').sort({ createdAt: -1 }).limit(10),
  ]);

  const monthlyData = await Order.aggregate([
    { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
    { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  res.json({
    users,
    products,
    orders,
    suppliers,
    pendingSuppliers,
    revenue: revenue[0]?.total || 0,
    recentOrders,
    monthlyData,
    usersByRole,
  });
});

// Users
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

router.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
});

router.put('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { name, email, phone, role, isSuspended, isBanned, password } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (typeof isSuspended === 'boolean') user.isSuspended = isSuspended;
  if (typeof isBanned === 'boolean') user.isBanned = isBanned;
  if (password) user.password = password;
  await user.save();
  res.json(await User.findById(user._id).select('-password'));
});

router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

router.put('/users/:id/role', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
  res.json(user);
});

// Suppliers approval
router.get('/suppliers', async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const suppliers = await Supplier.find(query).populate('ownerId', 'name email phone').sort({ createdAt: -1 });
  res.json(suppliers);
});

router.put('/suppliers/:id/approve', async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', verifiedAt: new Date(), rejectionReason: '' },
    { new: true }
  ).populate('ownerId');
  if (supplier?.ownerId) {
    await User.findByIdAndUpdate(supplier.ownerId._id, { role: 'supplier', supplierId: supplier._id });
    await createNotification(supplier.ownerId._id, {
      type: 'approval',
      title: 'Supplier Approved',
      message: 'Your supplier account is approved. You can now sell on AgriLink.',
      data: { supplierId: supplier._id },
    });
  }
  res.json(supplier);
});

router.put('/suppliers/:id/reject', async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected', rejectionReason: req.body.reason || 'Not verified' },
    { new: true }
  ).populate('ownerId');
  if (supplier?.ownerId) {
    await createNotification(supplier.ownerId._id, {
      type: 'approval',
      title: 'Supplier Application Rejected',
      message: supplier.rejectionReason,
    });
  }
  res.json(supplier);
});

router.put('/suppliers/:id/suspend', async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, { status: 'suspended', isActive: false }, { new: true });
  res.json(supplier);
});

// Products moderation
router.get('/products', async (req, res) => {
  const products = await Product.find().populate('supplier', 'name').sort({ createdAt: -1 });
  res.json(products);
});

router.put('/products/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

router.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product removed' });
});

router.put('/products/:id/feature', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isFeatured: req.body.isFeatured }, { new: true });
  res.json(product);
});

// Orders
router.get('/orders', async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').populate('supplier', 'name').sort({ createdAt: -1 });
  res.json(orders);
});

router.put('/orders/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(order);
});

// Coupons
router.get('/coupons', async (req, res) => {
  res.json(await Coupon.find().sort({ createdAt: -1 }));
});

router.post('/coupons', async (req, res) => {
  res.status(201).json(await Coupon.create(req.body));
});

router.delete('/coupons/:id', async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Banners
router.get('/banners', async (req, res) => {
  res.json(await Banner.find().sort({ order: 1 }));
});

router.post('/banners', async (req, res) => {
  res.status(201).json(await Banner.create(req.body));
});

router.put('/banners/:id', async (req, res) => {
  res.json(await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

router.delete('/banners/:id', async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Broadcast notification
router.post('/notifications/broadcast', async (req, res) => {
  const { title, message, role } = req.body;
  const query = role ? { role } : {};
  const users = await User.find(query);
  await Promise.all(
    users.map((u) => createNotification(u._id, { type: 'system', title, message }))
  );
  res.json({ sent: users.length });
});

// Categories list
router.get('/categories', async (req, res) => {
  const { CATEGORIES } = await import('../models/Product.js');
  res.json(CATEGORIES);
});

export default router;
