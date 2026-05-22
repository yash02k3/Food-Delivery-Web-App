import { useState } from 'react';
import { Box, Card, TextField, Button, Typography, Alert, Link, Container } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/slices/authSlice';
import { glassStyle } from '../theme/theme';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const mode = useSelector((s) => s.theme.mode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
      <Container maxWidth="sm">
        <Card sx={{ ...glassStyle(mode), p: 4, borderRadius: 4 }}>
          <Typography variant="h4" fontWeight={800} color="primary.main" textAlign="center">Join AgriLink</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>Create your account</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Full Name" margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField fullWidth label="Email" type="email" margin="normal" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <TextField fullWidth label="Phone" margin="normal" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField fullWidth label="Password" type="password" margin="normal" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ mt: 2 }}>Sign Up</Button>
          </Box>
          <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
            Already have an account? <Link component={RouterLink} to="/login">Login</Link>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}
