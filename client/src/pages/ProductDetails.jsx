import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Chip, Rating, IconButton, Card, CardContent, Alert,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import ProductSkeleton from '../components/common/ProductSkeleton';
import { productAPI } from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const wishlist = useSelector((s) => s.wishlist.items);
  const isWishlisted = wishlist.some((p) => p._id === id);

  useEffect(() => {
    setLoading(true);
    productAPI.getById(id)
      .then(({ data }) => {
        setProduct(data);
        setSelectedVariant(data.variants?.[0] || null);
      })
      .catch((err) => setError(err.friendlyMessage || 'Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><ProductSkeleton count={1} /></Layout>;
  if (error || !product) return <Layout><Alert severity="error">{error || 'Not found'}</Alert></Layout>;

  const price = selectedVariant?.price ?? product.price;
  const originalPrice = selectedVariant?.originalPrice ?? product.originalPrice;
  const image = selectedVariant?.image || product.image;

  const cartItem = () => ({
    ...product,
    price,
    image,
    brand: selectedVariant?.brand || product.brand,
    variantSku: selectedVariant?.sku,
    variantLabel: selectedVariant?.label,
    name: selectedVariant ? `${product.name} (${selectedVariant.label})` : product.name,
    quantity: qty,
  });

  return (
    <Layout>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}><ArrowBackIcon /></IconButton>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Box component="img" src={image} alt={product.name} sx={{ width: '100%', borderRadius: 4, maxHeight: 420, objectFit: 'cover' }} />
        </Grid>
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip label={product.category} color="primary" size="small" />
            {product.subcategory && <Chip label={product.subcategory} size="small" variant="outlined" />}
          </Box>
          <Typography variant="h4" fontWeight={800}>{product.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
            <Rating value={product.rating} precision={0.1} readOnly size="small" />
            <Typography variant="body2">({product.reviewCount} reviews)</Typography>
            <IconButton onClick={() => dispatch(toggleWishlist(product._id))} size="small">
              {isWishlisted ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
          </Box>
          <Typography variant="body1" color="text.secondary" paragraph>{product.description}</Typography>

          {product.variants?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography fontWeight={700} gutterBottom>Select Variant</Typography>
              <ToggleButtonGroup
                value={selectedVariant?.sku}
                exclusive
                onChange={(_, v) => {
                  const variant = product.variants.find((x) => x.sku === v);
                  if (variant) setSelectedVariant(variant);
                }}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                {product.variants.map((v) => (
                  <ToggleButton key={v.sku} value={v.sku} sx={{ borderRadius: 2 }}>
                    {v.label} — {v.brand} — ₹{v.price}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          )}

          <Typography variant="h4" fontWeight={800} color="primary.main">₹{price.toLocaleString('en-IN')}</Typography>
          {originalPrice && (
            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
              ₹{originalPrice.toLocaleString('en-IN')}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            per {selectedVariant?.unit || product.unit} • Delivery: {product.deliveryEstimate}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
              <IconButton onClick={() => setQty(Math.max(1, qty - 1))}><RemoveIcon /></IconButton>
              <Typography fontWeight={700} px={2}>{qty}</Typography>
              <IconButton onClick={() => setQty(qty + 1)}><AddIcon /></IconButton>
            </Box>
            <Button variant="contained" size="large" onClick={() => dispatch(addToCart(cartItem()))}>Add to Cart</Button>
            <Button variant="outlined" size="large" startIcon={<FlashOnIcon />} onClick={() => { dispatch(addToCart(cartItem())); navigate('/checkout'); }}>Buy Now</Button>
          </Box>

          {product.supplier && (
            <Card sx={{ mt: 4, borderRadius: 3, cursor: 'pointer' }} onClick={() => navigate(`/supplier/${product.supplier._id}`)}>
              <CardContent>
                <Typography fontWeight={700}>{product.supplier.name}</Typography>
                <Typography variant="body2" color="text.secondary">⭐ {product.supplier.rating} • {product.supplier.deliveryTime}</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Layout>
  );
}
