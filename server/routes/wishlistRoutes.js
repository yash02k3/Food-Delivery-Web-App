import express from 'express';
import Wishlist from '../models/Wishlist.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const getOrCreate = async (userId) => {
  let list = await Wishlist.findOne({ user: userId }).populate('products');
  if (!list) list = await Wishlist.create({ user: userId, products: [] });
  return list;
};

router.get('/', protect, async (req, res) => {
  const list = await getOrCreate(req.user._id);
  await list.populate('products');
  res.json(list.products);
});

router.post('/:productId', protect, async (req, res) => {
  const list = await getOrCreate(req.user._id);
  const id = req.params.productId;
  if (!list.products.includes(id)) list.products.push(id);
  await list.save();
  await list.populate('products');
  res.json(list.products);
});

router.delete('/:productId', protect, async (req, res) => {
  const list = await getOrCreate(req.user._id);
  list.products = list.products.filter((p) => p.toString() !== req.params.productId);
  await list.save();
  await list.populate('products');
  res.json(list.products);
});

export default router;
