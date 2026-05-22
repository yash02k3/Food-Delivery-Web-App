import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Supplier from '../models/Supplier.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/stats', async (req, res) => {
  const [users, products, orders, suppliers, revenue] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Supplier.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);
  res.json({
    users,
    products,
    orders,
    suppliers,
    revenue: revenue[0]?.total || 0,
    recentOrders: await Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(10),
  });
});

router.get('/users', async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

router.put('/users/:id/role', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
  res.json(user);
});

router.get('/orders', async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').populate('supplier', 'name').sort({ createdAt: -1 });
  res.json(orders);
});

router.put('/orders/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(order);
});

router.post('/products', async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

router.put('/products/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

router.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product removed' });
});

router.get('/suppliers', async (req, res) => {
  const suppliers = await Supplier.find().populate('ownerId', 'name email');
  res.json(suppliers);
});

router.post('/suppliers', async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json(supplier);
});

router.put('/suppliers/:id', async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(supplier);
});

export default router;
