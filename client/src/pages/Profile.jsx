import { useEffect, useState } from 'react';
import { Box, Typography, Card, TextField, Button, Grid, List, ListItem, ListItemText, Chip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { fetchProfile, logout } from '../redux/slices/authSlice';
import { persistor } from '../redux/store';
import { authAPI } from '../services/api';

function ProfileContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const [form, setForm] = useState({ name: '', phone: '' });

  useEffect(() => { dispatch(fetchProfile()); }, [dispatch]);
  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const handleSave = async () => {
    await authAPI.updateProfile(form);
    dispatch(fetchProfile());
  };

  const handleLogout = async () => {
    dispatch(logout());
    await persistor.purge();
    navigate('/login');
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>My Profile</Typography>
        <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Chip label={user?.role?.toUpperCase()} color="primary" size="small" sx={{ mb: 2 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Typography fontWeight={700} gutterBottom>Personal Info</Typography>
            <TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} margin="normal" />
            <TextField fullWidth label="Email" value={user?.email || ''} margin="normal" disabled />
            <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} margin="normal" />
            <Button variant="contained" onClick={handleSave} sx={{ mt: 2, mr: 1 }}>Save Changes</Button>
            <Button variant="outlined" color="error" onClick={handleLogout} sx={{ mt: 2 }}>Logout</Button>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Typography fontWeight={700} gutterBottom>Saved Addresses</Typography>
            <List>
              {(user?.addresses || []).map((addr) => (
                <ListItem key={addr._id} divider>
                  <ListItemText primary={addr.label} secondary={`${addr.street}, ${addr.city} - ${addr.pincode}`} />
                </ListItem>
              ))}
              {(!user?.addresses || user.addresses.length === 0) && (
                <Typography variant="body2" color="text.secondary">Use the location selector in the navbar to add addresses.</Typography>
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default function Profile() {
  return <ProtectedRoute><ProfileContent /></ProtectedRoute>;
}
