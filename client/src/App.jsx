import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import { getTheme } from './theme/theme';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import SupplierDashboard from './pages/SupplierDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SupplierDetails from './pages/SupplierDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Categories from './pages/Categories';
import Wishlist from './pages/Wishlist';
import StaticPage from './pages/StaticPage';

export default function App() {
  const mode = useSelector((s) => s.theme.mode);
  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderTracking />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/supplier" element={<SupplierDashboard />} />
        <Route path="/supplier/:id" element={<SupplierDetails />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/terms" element={<StaticPage type="terms" />} />
        <Route path="/privacy" element={<StaticPage type="privacy" />} />
      </Routes>
    </ThemeProvider>
  );
}
