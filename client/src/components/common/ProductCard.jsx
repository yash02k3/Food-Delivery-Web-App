import { Card, CardMedia, CardContent, Typography, Box, Chip, IconButton, Button } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../redux/slices/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const discount = product.discount || (product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0);

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Card
        sx={{
          borderRadius: 3,
          cursor: 'pointer',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={() => navigate(`/product/${product._id}`)}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia component="img" height="160" image={product.image} alt={product.name} sx={{ objectFit: 'cover' }} />
          {discount > 0 && (
            <Chip label={`${discount}% OFF`} size="small" color="secondary" sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 700 }} />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {product.category} • {product.unit}
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <StarIcon sx={{ fontSize: 14, color: '#FFB300' }} />
            <Typography variant="caption">{product.rating}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                ₹{product.price.toLocaleString('en-IN')}
              </Typography>
              {product.originalPrice && (
                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </Typography>
              )}
            </Box>
            <IconButton
              size="small"
              color="primary"
              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
              onClick={(e) => {
                e.stopPropagation();
                dispatch(addToCart({ ...product, quantity: 1 }));
              }}
            >
              <AddShoppingCartIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}
