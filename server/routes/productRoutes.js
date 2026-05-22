import express from 'express';
import Product, { CATEGORIES } from '../models/Product.js';

const router = express.Router();

router.get('/categories', (req, res) => {
  res.json(CATEGORIES);
});

router.get('/trending', async (req, res) => {
  const products = await Product.find({ isTrending: true })
    .populate('supplier', 'name rating deliveryTime logo')
    .limit(12);
  res.json(products);
});

router.get('/featured', async (req, res) => {
  const products = await Product.find({ isFeatured: true })
    .populate('supplier', 'name rating deliveryTime logo')
    .limit(12);
  res.json(products);
});

router.get('/', async (req, res) => {
  try {
    const { category, search, featured, trending, supplier, brand, limit = 50, page = 1 } = req.query;
    const query = { isApproved: { $ne: false } };
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (trending === 'true') query.isTrending = true;
    if (supplier) query.supplier = supplier;
    if (brand) query.brand = brand;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('supplier', 'name rating deliveryTime logo')
        .limit(Number(limit))
        .skip(skip)
        .sort({ isFeatured: -1, rating: -1, createdAt: -1 }),
      Product.countDocuments(query),
    ]);
    res.json({ products, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'supplier',
      'name description rating reviewCount phone email address deliveryTime minOrder logo'
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
