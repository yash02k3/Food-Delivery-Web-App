import { useEffect } from 'react';
import { Grid, Typography, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import ProductCard from '../components/common/ProductCard';
import { fetchWishlist } from '../redux/slices/wishlistSlice';

function WishlistContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.wishlist.items);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  return (
    <Layout>
      <Typography variant="h5" fontWeight={800} gutterBottom>My Wishlist</Typography>
      {items.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          No items yet. <Button onClick={() => navigate('/')}>Browse materials</Button>
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {items.map((p) => (
            <Grid item xs={6} sm={4} md={3} key={p._id}><ProductCard product={p} /></Grid>
          ))}
        </Grid>
      )}
    </Layout>
  );
}

export default function Wishlist() {
  return <ProtectedRoute><WishlistContent /></ProtectedRoute>;
}
