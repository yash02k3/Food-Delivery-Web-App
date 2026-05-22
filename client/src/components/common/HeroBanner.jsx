import { Box, Typography, Button, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export default function HeroBanner() {
  const navigate = useNavigate();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        minHeight: { xs: 220, md: 320 },
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #4CAF50 100%)',
        mb: 3,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1486406146922-c627a92fd1ab?w=1200&h=600&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
        }}
      />
      <Container sx={{ position: 'relative', py: { xs: 4, md: 6 }, px: { xs: 3, md: 4 } }}>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, letterSpacing: 2 }}>
          CONSTRUCTION MATERIALS
        </Typography>
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, maxWidth: 600, fontSize: { xs: '1.75rem', md: '2.75rem' } }}>
          Build Faster with AgriLink Delivery
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1, maxWidth: 480 }}>
          Cement, steel, tiles & more — delivered to your site in 30 minutes
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<LocalShippingIcon />}
          onClick={() => navigate('/?category=Cement')}
          sx={{
            mt: 3,
            bgcolor: 'white',
            color: 'primary.dark',
            fontWeight: 700,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
          }}
        >
          Order Now
        </Button>
      </Container>
    </Box>
  );
}
