import { useEffect, useState } from 'react';
import { Grid, Typography, Box, Alert, Card, CardContent, Button } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Layout from '../components/layout/Layout';
import HeroBanner from '../components/common/HeroBanner';
import CategoryBar from '../components/common/CategoryBar';
import ProductCard from '../components/common/ProductCard';
import ProductSkeleton from '../components/common/ProductSkeleton';
import { productAPI, supplierAPI, checkApiHealth } from '../services/api';
import { setApiConnected } from '../redux/slices/authSlice';

const TESTIMONIALS = [
  { name: 'Ravi Contractors', text: 'AgriLink delivers TMT bars to our site within 40 minutes. Game changer!' },
  { name: 'Priya Builders', text: 'Best prices on cement and bricks. Bulk orders with 50% advance work perfectly.' },
  { name: 'Amit Construction', text: 'Like Blinkit but for construction. Premium quality materials every time.' },
];

export default function Home() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const category = params.get('category') || '';
  const search = params.get('search') || '';

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      try {
        await checkApiHealth();
        dispatch(setApiConnected(true));
        const [listRes, featRes, supRes] = await Promise.all([
          productAPI.getAll({ category: category || undefined, search: search || undefined, limit: 24 }),
          productAPI.getFeatured(),
          supplierAPI.getAll(),
        ]);
        setProducts(listRes.data.products || []);
        setFeatured(featRes.data || []);
        setSuppliers(supRes.data || []);
      } catch (err) {
        dispatch(setApiConnected(false));
        setError(err.friendlyMessage || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [category, search, dispatch]);

  const handleCategory = (cat) => {
    const p = new URLSearchParams(params);
    if (cat) p.set('category', cat);
    else p.delete('category');
    setParams(p);
  };

  const displayProducts = category || search ? products : (featured.length ? featured : products);

  return (
    <Layout>
      <HeroBanner />
      <CategoryBar selected={category} onSelect={handleCategory} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button size="small" sx={{ ml: 2 }} onClick={() => window.location.reload()}>Retry</Button>
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {search ? `Results for "${search}"` : category || 'Trending Materials'}
        </Typography>
        <Button size="small" onClick={() => navigate('/categories')}>View all categories</Button>
      </Box>

      {loading ? <ProductSkeleton /> : (
        <Grid container spacing={2}>
          {displayProducts.map((p) => (
            <Grid item xs={6} sm={4} md={3} key={p._id}>
              <ProductCard product={p} />
            </Grid>
          ))}
        </Grid>
      )}
      {!loading && displayProducts.length === 0 && !error && (
        <Typography textAlign="center" color="text.secondary" py={4}>No products found</Typography>
      )}

      {suppliers.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Top Suppliers</Typography>
          <Grid container spacing={2}>
            {suppliers.slice(0, 5).map((s) => (
              <Grid item xs={12} sm={6} md={2.4} key={s._id}>
                <Card sx={{ borderRadius: 3, cursor: 'pointer', height: '100%' }} onClick={() => navigate(`/supplier/${s._id}`)}>
                  <CardContent>
                    <Typography fontWeight={700} noWrap>{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary">⭐ {s.rating} • {s.deliveryTime}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Box sx={{ mt: 6, p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #FF6F00, #FFA040)', color: 'white' }}>
        <Typography variant="h6" fontWeight={800}>🎉 BUILD10 — 10% off orders above ₹1000</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>Use coupon at checkout. 50% advance available for bulk orders.</Typography>
      </Box>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>What Builders Say</Typography>
        <Grid container spacing={2}>
          {TESTIMONIALS.map((t) => (
            <Grid item xs={12} md={4} key={t.name}>
              <Card sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" fontStyle="italic">"{t.text}"</Typography>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>— {t.name}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Layout>
  );
}
