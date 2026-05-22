import { useState } from 'react';
import { Box, Card, TextField, Button, Typography, Alert, Link, Container, Divider, Chip } from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/slices/authSlice';
import { glassStyle } from '../theme/theme';

const DEMO_ACCOUNTS = [
  { role: 'User', email: 'user@agrilink.in', password: 'password123', desc: 'Shop materials, cart, checkout' },
  { role: 'Supplier', email: 'supplier@agrilink.in', password: 'password123', desc: 'Manage orders & inventory' },
  { role: 'Admin', email: 'admin@agrilink.in', password: 'password123', desc: 'Users, orders, analytics' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const mode = useSelector((s) => s.theme.mode);

  if (isAuthenticated) {
    navigate(location.state?.from?.pathname || '/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'supplier') navigate('/supplier');
      else navigate(location.state?.from?.pathname || '/');
    }
  };

  const fillDemo = (account) => setForm({ email: account.email, password: account.password });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
      <Container maxWidth="sm">
        <Card sx={{ ...glassStyle(mode), p: 4, borderRadius: 4 }}>
          <Typography variant="h4" fontWeight={800} color="primary.main" textAlign="center">AgriLink</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>Login to your account</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" margin="normal" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <TextField fullWidth label="Password" type="password" margin="normal" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 2 }}>Login</Button>
          </Box>
          <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
            <Link component={RouterLink} to="/forgot-password">Forgot password?</Link>
          </Typography>
          <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
            Don't have an account? <Link component={RouterLink} to="/signup">Sign up</Link>
          </Typography>

          <Divider sx={{ my: 3 }}><Chip label="Demo accounts (click to fill)" size="small" /></Divider>
          {DEMO_ACCOUNTS.map((acc) => (
            <Box
              key={acc.role}
              onClick={() => fillDemo(acc)}
              sx={{
                p: 1.5, mb: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                cursor: 'pointer', '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>{acc.role}</Typography>
              <Typography variant="caption" display="block">{acc.email} / {acc.password}</Typography>
              <Typography variant="caption" color="text.secondary">{acc.desc}</Typography>
            </Box>
          ))}
        </Card>
      </Container>
    </Box>
  );
}
