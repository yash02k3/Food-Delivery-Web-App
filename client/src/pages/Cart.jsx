import { Box, Typography, Button, IconButton, Grid, Card, CardMedia, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { updateQuantity, removeFromCart, selectCartTotal, getCartKey } from '../redux/slices/cartSlice';

export default function Cart() {
  const { items } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const delivery = total > 2000 ? 0 : 49;

  return (
    <Layout>
      <Typography variant="h5" fontWeight={800} gutterBottom>Your Cart</Typography>
      {items.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">Cart is empty</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>Shop Now</Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {items.map((item) => {
              const key = getCartKey(item);
              return (
              <Card key={key} sx={{ display: 'flex', mb: 2, borderRadius: 3, p: 1 }}>
                <CardMedia component="img" sx={{ width: 100, borderRadius: 2 }} image={item.image} alt={item.name} />
                <Box sx={{ flex: 1, p: 2 }}>
                  <Typography fontWeight={700}>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">₹{item.price} / {item.unit}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <IconButton size="small" onClick={() => dispatch(updateQuantity({ key, quantity: item.quantity - 1 }))}><RemoveIcon /></IconButton>
                    <Typography fontWeight={700} mx={1}>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => dispatch(updateQuantity({ key, quantity: item.quantity + 1 }))}><AddIcon /></IconButton>
                    <IconButton color="error" onClick={() => dispatch(removeFromCart(key))} sx={{ ml: 'auto' }}><DeleteOutlineIcon /></IconButton>
                  </Box>
                </Box>
                <Typography fontWeight={700} sx={{ p: 2 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Typography>
              </Card>
            );})}
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 100 }}>
              <Typography variant="h6" fontWeight={700}>Bill Details</Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Items</Typography><Typography>₹{total.toLocaleString('en-IN')}</Typography></Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography>Delivery</Typography><Typography>{delivery ? `₹${delivery}` : 'FREE'}</Typography></Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}><Typography fontWeight={700}>Total</Typography><Typography fontWeight={800}>₹{(total + delivery).toLocaleString('en-IN')}</Typography></Box>
              <Button fullWidth variant="contained" size="large" onClick={() => navigate('/checkout')}>Proceed to Checkout</Button>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
}
