import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/validate', protect, async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
  if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Coupon expired' });
  }
  if (orderAmount < coupon.minOrder) {
    return res.status(400).json({ message: `Minimum order ₹${coupon.minOrder} required` });
  }
  let discount = 0;
  if (coupon.discountType === 'percent') {
    discount = Math.round((orderAmount * coupon.discountValue) / 100);
    discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.discountValue;
  }
  res.json({ code: coupon.code, discount, description: coupon.description });
});

router.get('/', async (req, res) => {
  const coupons = await Coupon.find({ isActive: true }).select('-__v');
  res.json(coupons);
});

export default router;
