import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Banner from '../models/Banner.js';
import { generateProducts, suppliersData, couponsData } from './productsCatalog.js';

dotenv.config();

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Supplier.deleteMany(),
    Product.deleteMany(),
    Coupon.deleteMany(),
    Banner.deleteMany(),
  ]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@agrilink.in',
    password: 'password123',
    role: 'admin',
    phone: '9999999999',
  });

  const user = await User.create({
    name: 'Demo User',
    email: 'user@agrilink.in',
    password: 'password123',
    role: 'user',
    phone: '8888888888',
    addresses: [{
      label: 'Home',
      street: '42, Green Park Extension',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110016',
      landmark: 'Near Metro Gate 2',
      isDefault: true,
    }],
  });

  const supplierUser = await User.create({
    name: 'Supplier Owner',
    email: 'supplier@agrilink.in',
    password: 'password123',
    role: 'supplier',
    phone: '7777777777',
  });

  const suppliers = [];
  for (let i = 0; i < suppliersData.length; i++) {
    const owner = i === 0 ? supplierUser : admin;
    const s = await Supplier.create({ ...suppliersData[i], ownerId: owner._id, status: 'approved', verifiedAt: new Date() });
    if (i === 0) {
      supplierUser.supplierId = s._id;
      await supplierUser.save();
    }
    suppliers.push(s);
  }

  const supplierIds = suppliers.map((s) => s._id);
  const catalog = generateProducts(supplierIds);
  await Product.insertMany(catalog);
  await Coupon.insertMany(couponsData);
  await Banner.insertMany([
    { title: 'Build Faster', subtitle: 'Cement & Steel delivered in 30 mins', image: 'https://images.unsplash.com/photo-1486406146922-c627a92fd1ab?w=900&h=400&fit=crop', link: '/?category=Cement', order: 1 },
    { title: 'Bulk Order Deals', subtitle: '50% advance on construction bulk orders', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&h=400&fit=crop', link: '/categories', order: 2 },
  ]);

  console.log(`\n✅ Seed complete!`);
  console.log(`   Products: ${catalog.length}`);
  console.log(`   Suppliers: ${suppliers.length}`);
  console.log(`   Coupons: ${couponsData.length}`);
  console.log(`\n   Admin:    admin@agrilink.in / password123`);
  console.log(`   User:     user@agrilink.in / password123`);
  console.log(`   Supplier: supplier@agrilink.in / password123\n`);
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
