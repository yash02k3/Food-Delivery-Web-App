import {
  Drawer, Box, Typography, IconButton, List, ListItem, ListItemAvatar, Avatar, ListItemText,
  Button, Divider, TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCartOpen, updateQuantity, removeFromCart, selectCartTotal, getCartKey } from '../../redux/slices/cartSlice';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isOpen } = useSelector((s) => s.cart);
  const total = useSelector(selectCartTotal);
  const delivery = total > 2000 ? 0 : 49;

  return (
    <Drawer anchor="right" open={isOpen} onClose={() => dispatch(setCartOpen(false))} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>Your Cart</Typography>
        <IconButton onClick={() => dispatch(setCartOpen(false))}><CloseIcon /></IconButton>
      </Box>
      <Divider />
      {items.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Your cart is empty</Typography>
          <Button sx={{ mt: 2 }} onClick={() => { dispatch(setCartOpen(false)); navigate('/'); }}>Browse Materials</Button>
        </Box>
      ) : (
        <>
          <List sx={{ flex: 1, overflow: 'auto', px: 1 }}>
            {items.map((item) => {
              const key = getCartKey(item);
              return (
              <ListItem key={key} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar variant="rounded" src={item.image} sx={{ width: 56, height: 56 }} />
                </ListItemAvatar>
                <ListItemText
                  primary={item.name}
                  secondary={`₹${item.price} / ${item.unit}`}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => dispatch(updateQuantity({ key, quantity: item.quantity - 1 }))}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography fontWeight={700}>{item.quantity}</Typography>
                  <IconButton size="small" onClick={() => dispatch(updateQuantity({ key, quantity: item.quantity + 1 }))}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => dispatch(removeFromCart(key))}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            );})}
          </List>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal</Typography>
              <Typography fontWeight={700}>₹{total.toLocaleString('en-IN')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography color="text.secondary">Delivery</Typography>
              <Typography>{delivery === 0 ? 'FREE' : `₹${delivery}`}</Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => { dispatch(setCartOpen(false)); navigate('/checkout'); }}
            >
              Checkout • ₹{(total + delivery).toLocaleString('en-IN')}
            </Button>
            <Button fullWidth sx={{ mt: 1 }} onClick={() => { dispatch(setCartOpen(false)); navigate('/cart'); }}>
              View Full Cart
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
}
