import express from 'express';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const suppliers = await Supplier.find({ isActive: true }).sort({ rating: -1 });
  res.json(suppliers);
});

router.put('/dashboard', protect, authorize('supplier', 'admin'), async (req, res) => {
  const supplier = await Supplier.findOne({ ownerId: req.user._id });
  if (!supplier) return res.status(404).json({ message: 'Supplier profile not found' });
  Object.assign(supplier, req.body);
  await supplier.save();
  res.json(supplier);
});

router.get('/dashboard/me', protect, authorize('supplier', 'admin'), async (req, res) => {
  const supplier = await Supplier.findOne({ ownerId: req.user._id });
  if (!supplier) return res.status(404).json({ message: 'Supplier profile not found' });
  const products = await Product.find({ supplier: supplier._id });
  res.json({ supplier, products });
});

router.get('/:id', async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
  const products = await Product.find({ supplier: supplier._id });
  res.json({ supplier, products });
});

export default router;
