import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { protect, authorize } from '../middleware/auth.js';
import { createInitialTracking, advanceTracking } from '../utils/orderTracking.js';

const router = express.Router();

const resolveItemPrice = (product, variantSku) => {
  if (variantSku && product.variants?.length) {
    const v = product.variants.find((x) => x.sku === variantSku);
    if (v) return { price: v.price, name: `${product.name} - ${v.label}`, brand: v.brand, image: v.image || product.image, unit: v.unit || product.unit, stock: v.stock };
  }
  return { price: product.price, name: product.name, brand: product.brand, image: product.image, unit: product.unit, stock: product.stock };
};

router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, notes, couponCode, paymentResult } = req.body;
    if (!orderItems?.length) return res.status(400).json({ message: 'No order items' });
    if (!shippingAddress?.street) return res.status(400).json({ message: 'Delivery address is required' });

    let itemsPrice = 0;
    const items = [];
    let supplierId = null;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product not found` });
      const resolved = resolveItemPrice(product, item.variantSku);
      if (resolved.stock < item.quantity) {
        return res.status(400).json({ message: `${resolved.name} has insufficient stock` });
      }
      itemsPrice += resolved.price * item.quantity;
      supplierId = product.supplier;
      items.push({
        product: product._id,
        variantSku: item.variantSku,
        name: resolved.name,
        brand: resolved.brand,
        image: resolved.image,
        price: resolved.price,
        quantity: item.quantity,
        unit: resolved.unit,
      });
      if (item.variantSku && product.variants?.length) {
        const v = product.variants.find((x) => x.sku === item.variantSku);
        if (v) v.stock -= item.quantity;
      } else {
        product.stock -= item.quantity;
      }
      await product.save();
    }

    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && itemsPrice >= coupon.minOrder) {
        couponDiscount = coupon.discountType === 'percent'
          ? Math.min(Math.round((itemsPrice * coupon.discountValue) / 100), coupon.maxDiscount)
          : coupon.discountValue;
      }
    }

    const taxPrice = Math.round(itemsPrice * 0.05);
    const deliveryPrice = itemsPrice > 2000 ? 0 : 49;
    const totalPrice = itemsPrice + taxPrice + deliveryPrice - couponDiscount;

    let advanceAmount = 0;
    let dueAmount = totalPrice;
    let paymentStatus = 'pending';
    let paidAmount = 0;

    if (paymentMethod === 'half_advance') {
      advanceAmount = Math.round(totalPrice * 0.5);
      dueAmount = totalPrice - advanceAmount;
      paymentStatus = 'partial';
      paidAmount = advanceAmount;
    } else if (paymentMethod === 'full_online') {
      advanceAmount = totalPrice;
      dueAmount = 0;
      paymentStatus = 'paid';
      paidAmount = totalPrice;
    } else if (paymentMethod === 'cod') {
      paymentStatus = 'pending';
    }

    const estimatedDelivery = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const order = await Order.create({
      user: req.user._id,
      orderItems: items,
      shippingAddress: { ...shippingAddress, phone: shippingAddress.phone || req.user.phone },
      paymentMethod,
      paymentStatus,
      advanceAmount,
      dueAmount,
      paidAmount,
      paymentResult: paymentResult || {},
      couponCode,
      couponDiscount,
      itemsPrice,
      taxPrice,
      deliveryPrice,
      totalPrice,
      supplier: supplierId,
      notes,
      tracking: createInitialTracking(),
      estimatedDelivery,
      invoiceNumber: `INV-${Date.now()}`,
      status: paymentMethod === 'full_online' || paymentMethod === 'half_advance' ? 'confirmed' : 'placed',
    });

    if (order.status === 'confirmed') {
      order.tracking = advanceTracking(order.tracking, 'confirmed');
      await order.save();
    }

    const populated = await Order.findById(order._id).populate('supplier', 'name logo phone');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/myorders', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('supplier', 'name logo phone').sort({ createdAt: -1 });
  res.json(orders);
});

router.get('/supplier/list', protect, authorize('supplier', 'admin'), async (req, res) => {
  const query = req.user.supplierId ? { supplier: req.user.supplierId } : {};
  const orders = await Order.find(query).populate('user', 'name email phone').sort({ createdAt: -1 });
  res.json(orders);
});

router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('supplier', 'name logo phone email');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const isOwner = order.user.toString() === req.user._id.toString();
  const isStaff = ['supplier', 'admin'].includes(req.user.role);
  if (!isOwner && !isStaff) return res.status(403).json({ message: 'Not authorized' });
  res.json(order);
});

router.put('/:id/pay', protect, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Order not found' });
  }
  const { amount, paymentId, razorpayPaymentId } = req.body;
  order.paidAmount = (order.paidAmount || 0) + (amount || order.dueAmount);
  order.dueAmount = Math.max(0, order.totalPrice - order.paidAmount);
  order.paymentStatus = order.dueAmount <= 0 ? 'paid' : 'partial';
  order.paymentResult = {
    id: paymentId || razorpayPaymentId || `pay_${Date.now()}`,
    razorpayPaymentId,
    status: 'captured',
  };
  if (order.paymentStatus === 'paid' || order.paymentStatus === 'partial') {
    order.status = 'confirmed';
    order.tracking = advanceTracking(order.tracking, 'confirmed');
  }
  await order.save();
  res.json(order);
});

router.put('/:id/status', protect, authorize('supplier', 'admin'), async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const { status } = req.body;
  order.status = status;
  order.tracking = advanceTracking(order.tracking, status);
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
  await order.save();
  res.json(order);
});

export default router;
