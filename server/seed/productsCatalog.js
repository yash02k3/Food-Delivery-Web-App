import { pickProductImage, SUPPLIER_IMAGES } from './imagePool.js';

const BRANDS = {
  Cement: ['UltraTech', 'ACC', 'Ambuja', 'Shree', 'JK', 'Dalmia'],
  Bricks: ['Bharat', 'GreenBuild', 'Siporex', 'Renacon', 'Local', 'Wienerberger'],
  Sand: ['RoboSand', 'QuarryPro', 'RiverPure', 'StoneMax', 'BuildSand'],
  Steel: ['TATA', 'JSW', 'SAIL', 'Jindal', 'RINL', 'Essar'],
  Tiles: ['Kajaria', 'Somany', 'Johnson', 'Nitco', 'Orient Bell', 'Cera'],
  Paint: ['Asian Paints', 'Berger', 'Dulux', 'Nerolac', 'Indigo', 'Jotun'],
  Pipes: ['Supreme', 'Finolex', 'Astral', 'Ashirvad', 'Plasto', 'Prince'],
  Plumbing: ['Jaquar', 'Cera', 'Parryware', 'Hindware', 'Kohler', 'Grohe'],
  Electrical: ['Havells', 'Anchor', 'Philips', 'Legrand', 'Schneider', 'Crompton'],
  Tools: ['Bosch', 'Stanley', 'Taparia', 'DeWalt', 'Makita', 'Black+Decker'],
};

const SUBCATEGORIES = {
  Bricks: ['Red Clay Brick', 'Fly Ash Brick', 'AAC Block', 'Hollow Brick', 'Concrete Brick'],
  Cement: ['PPC', 'OPC 43', 'OPC 53', 'White Cement', 'Waterproof'],
  Steel: ['TMT Bar', 'MS Angle', 'MS Channel', 'Binding Wire', 'Wire Mesh'],
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function generateProducts(supplierIds) {
  const products = [];
  const supplierMap = {
    Cement: 0, Bricks: 0, Sand: 0, Steel: 1, Tiles: 2, Paint: 2,
    Pipes: 3, Plumbing: 3, Electrical: 3, Tools: 1,
  };

  Object.entries(BRANDS).forEach(([category, brands]) => {
    const subs = SUBCATEGORIES[category] || [category];
    subs.forEach((sub, si) => {
      brands.forEach((brand, bi) => {
        const basePrice = Math.round(200 + Math.random() * 8000 + si * 300 + bi * 150);
        const variants = [];
        const sizes = category === 'Steel' ? ['8mm', '10mm', '12mm', '16mm'] :
          category === 'Cement' ? ['50kg', '25kg'] :
          category === 'Tiles' ? ['2x2 ft', '4x4 ft'] : ['Standard', 'Premium'];

        sizes.forEach((size, vi) => {
          const vPrice = basePrice + vi * Math.round(50 + Math.random() * 200);
          const variantImage = pickProductImage(category, bi, si, vi + 1);
          variants.push({
            sku: `${slug(category)}-${slug(brand)}-${slug(size)}-${vi}`,
            label: size,
            brand,
            price: vPrice,
            originalPrice: Math.round(vPrice * 1.12),
            stock: Math.floor(20 + Math.random() * 180),
            image: variantImage,
            unit: category === 'Cement' ? 'bag' : category === 'Sand' ? 'ton' : 'piece',
          });
        });

        const productImage = pickProductImage(category, bi, si, 0);
        const name = `${brand} ${sub} ${category === 'Bricks' ? '' : category}`.trim();
        products.push({
          name,
          slug: `${slug(name)}-${si}-${bi}`,
          description: `Premium ${sub} from ${brand}. ISI certified, ideal for residential and commercial construction across India.`,
          price: variants[0].price,
          originalPrice: variants[0].originalPrice,
          category,
          subcategory: sub,
          image: productImage,
          images: variants.map((v) => v.image),
          unit: variants[0].unit,
          stock: variants.reduce((a, v) => a + v.stock, 0),
          rating: +(3.8 + Math.random() * 1.1).toFixed(1),
          reviewCount: Math.floor(10 + Math.random() * 500),
          brand,
          brands: [brand],
          variants,
          supplier: supplierIds[supplierMap[category] ?? 0],
          isFeatured: Math.random() > 0.85,
          isTrending: Math.random() > 0.88,
          discount: Math.floor(Math.random() * 20),
          tags: [category, sub, brand],
          deliveryEstimate: `${20 + Math.floor(Math.random() * 30)}-${40 + Math.floor(Math.random() * 20)} mins`,
        });
      });
    });
  });

  return products;
}

export const suppliersData = [
  {
    name: 'BuildMart India',
    description: 'Premium construction materials with pan-India delivery',
    rating: 4.8, reviewCount: 1240, phone: '9876543210', email: 'buildmart@agrilink.in',
    address: { street: 'Plot 12, Industrial Area', city: 'Gurgaon', state: 'Haryana', pincode: '122001' },
    categories: ['Cement', 'Bricks', 'Sand'], deliveryTime: '25-40 mins', minOrder: 500,
  },
  {
    name: 'SteelHub Pro',
    description: 'TMT bars, structural steel & reinforcement solutions',
    rating: 4.6, reviewCount: 890, phone: '9876543211', email: 'steelhub@agrilink.in',
    address: { street: 'Sector 18, MIDC', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400705' },
    categories: ['Steel', 'Tools'], deliveryTime: '35-50 mins', minOrder: 1000,
  },
  {
    name: 'TileWorld Express',
    description: 'Ceramic, vitrified & designer tiles at best prices',
    rating: 4.7, reviewCount: 650, phone: '9876543212', email: 'tileworld@agrilink.in',
    address: { street: 'Ring Road, Peenya', city: 'Bangalore', state: 'Karnataka', pincode: '560058' },
    categories: ['Tiles', 'Paint'], deliveryTime: '30-45 mins', minOrder: 800,
  },
  {
    name: 'PlumbFix Depot',
    description: 'Pipes, fittings, electrical & plumbing essentials',
    rating: 4.5, reviewCount: 520, phone: '9876543213', email: 'plumbfix@agrilink.in',
    address: { street: 'Anna Salai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600002' },
    categories: ['Pipes', 'Electrical', 'Plumbing'], deliveryTime: '20-35 mins', minOrder: 400,
  },
  {
    name: 'MegaBuild Wholesale',
    description: 'Bulk orders for contractors and builders',
    rating: 4.4, reviewCount: 380, phone: '9876543214', email: 'megabuild@agrilink.in',
    address: { street: 'NH-8, Manesar', city: 'Gurgaon', state: 'Haryana', pincode: '122050' },
    categories: ['Cement', 'Steel', 'Sand', 'Bricks'], deliveryTime: '45-60 mins', minOrder: 2000,
  },
].map((s, i) => ({
  ...s,
  logo: SUPPLIER_IMAGES[i].logo,
  coverImage: SUPPLIER_IMAGES[i].cover,
}));

export const couponsData = [
  { code: 'BUILD10', description: '10% off on orders above ₹1000', discountType: 'percent', discountValue: 10, minOrder: 1000, maxDiscount: 500 },
  { code: 'FLAT200', description: '₹200 off on orders above ₹1500', discountType: 'flat', discountValue: 200, minOrder: 1500, maxDiscount: 200 },
  { code: 'AGRI50', description: '₹50 off first order', discountType: 'flat', discountValue: 50, minOrder: 500, maxDiscount: 50 },
];
