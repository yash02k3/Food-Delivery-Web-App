import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import ApiStatusBanner from '../common/ApiStatusBanner';

export default function Layout({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ApiStatusBanner />
      <Navbar />
      <Container maxWidth="lg" sx={{ flex: 1, py: 3, px: { xs: 2, sm: 3 } }}>
        {children}
      </Container>
      <Footer />
      <CartDrawer />
    </Box>
  );
}
