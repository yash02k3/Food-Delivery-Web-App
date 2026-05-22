import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user.addresses || []);
});

router.post('/', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json(user.addresses);
});

router.put('/:id', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) return res.status(404).json({ message: 'Address not found' });
  Object.assign(addr, req.body);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = a._id.toString() === req.params.id;
    });
  }
  await user.save();
  res.json(user.addresses);
});

router.delete('/:id', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.pull(req.params.id);
  await user.save();
  res.json(user.addresses);
});

router.put('/:id/default', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.forEach((a) => {
    a.isDefault = a._id.toString() === req.params.id;
  });
  await user.save();
  res.json(user.addresses);
});

export default router;
