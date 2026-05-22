import express from 'express';
import crypto from 'crypto';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Razorpay TEST mode simulation
router.post('/razorpay/create-order', protect, async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;
  const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
  res.json({
    id: orderId,
    entity: 'order',
    amount: Math.round(amount * 100),
    amount_due: Math.round(amount * 100),
    currency,
    receipt: receipt || `AGR_${Date.now()}`,
    status: 'created',
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_agrilink',
    message: 'Razorpay TEST mode — use test card 4111 1111 1111 1111',
  });
});

router.post('/razorpay/verify', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'agrilink_test_secret')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  const verified = razorpay_signature === expected || razorpay_payment_id?.startsWith('pay_test_');
  res.json({
    verified,
    razorpay_order_id,
    razorpay_payment_id: razorpay_payment_id || `pay_test_${Date.now()}`,
    status: verified ? 'captured' : 'failed',
  });
});

router.post('/calculate', protect, async (req, res) => {
  const { itemsPrice, paymentMethod, couponDiscount = 0 } = req.body;
  const taxPrice = Math.round(itemsPrice * 0.05);
  const deliveryPrice = itemsPrice > 2000 ? 0 : 49;
  const subtotal = itemsPrice + taxPrice + deliveryPrice - couponDiscount;
  let advanceAmount = 0;
  let dueAmount = subtotal;
  let paymentStatus = 'pending';

  if (paymentMethod === 'half_advance') {
    advanceAmount = Math.round(subtotal * 0.5);
    dueAmount = subtotal - advanceAmount;
    paymentStatus = 'partial';
  } else if (paymentMethod === 'full_online') {
    advanceAmount = subtotal;
    dueAmount = 0;
    paymentStatus = 'paid';
  } else if (paymentMethod === 'cod') {
    advanceAmount = 0;
    dueAmount = subtotal;
    paymentStatus = 'pending';
  }

  res.json({
    itemsPrice,
    taxPrice,
    deliveryPrice,
    couponDiscount,
    totalPrice: subtotal,
    advanceAmount,
    dueAmount,
    paymentStatus,
    advanceNote: paymentMethod === 'half_advance'
      ? '50% advance payment required for bulk construction orders.'
      : null,
  });
});

export default router;
