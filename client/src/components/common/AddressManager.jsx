import { useState, useEffect } from 'react';
import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, List, ListItemButton, ListItemText, IconButton, Chip, MenuItem, Alert,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useDispatch, useSelector } from 'react-redux';
import { setDeliveryAddress } from '../../redux/slices/authSlice';
import { addressAPI } from '../../services/api';

const LABELS = ['Home', 'Work', 'Site', 'Other'];

export default function AddressManager() {
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({ label: 'Home', street: '', city: '', state: '', pincode: '', landmark: '' });
  const [detecting, setDetecting] = useState(false);
  const dispatch = useDispatch();
  const { deliveryAddress, isAuthenticated, user } = useSelector((s) => s.auth);

  const loadAddresses = async () => {
    if (isAuthenticated) {
      try {
        const { data } = await addressAPI.getAll();
        setAddresses(data);
        const def = data.find((a) => a.isDefault) || data[0];
        if (def && !deliveryAddress) dispatch(setDeliveryAddress(def));
      } catch {
        setAddresses(user?.addresses || []);
      }
    } else {
      const guest = JSON.parse(localStorage.getItem('agrilink_guest_addresses') || '[]');
      setAddresses(guest);
    }
  };

  useEffect(() => { loadAddresses(); }, [isAuthenticated]);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          setForm((f) => ({
            ...f,
            street: data.display_name?.split(',').slice(0, 2).join(', ') || '',
            city: data.address?.city || data.address?.town || data.address?.state_district || '',
            state: data.address?.state || '',
            pincode: data.address?.postcode || '',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }));
        } catch {
          setForm((f) => ({ ...f, landmark: `Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}` }));
        }
        setDetecting(false);
        setFormOpen(true);
      },
      () => setDetecting(false)
    );
  };

  const saveAddress = async () => {
    if (!form.street || !form.city || !form.pincode) return;
    if (isAuthenticated) {
      const { data } = await addressAPI.create({ ...form, isDefault: addresses.length === 0 });
      setAddresses(data);
      dispatch(setDeliveryAddress(data.find((a) => a.isDefault) || data[data.length - 1]));
    } else {
      const guest = [...addresses, { ...form, _id: Date.now().toString(), isDefault: addresses.length === 0 }];
      localStorage.setItem('agrilink_guest_addresses', JSON.stringify(guest));
      setAddresses(guest);
      dispatch(setDeliveryAddress(guest[guest.length - 1]));
    }
    setFormOpen(false);
    setForm({ label: 'Home', street: '', city: '', state: '', pincode: '', landmark: '' });
  };

  const selectAddress = (addr) => {
    dispatch(setDeliveryAddress(addr));
    setOpen(false);
  };

  const active = deliveryAddress || addresses.find((a) => a.isDefault) || addresses[0];
  const display = active
    ? `${active.label}: ${(active.street || '').slice(0, 28)}${active.street?.length > 28 ? '…' : ''}, ${active.city}`
    : 'Select delivery location';

  return (
    <>
      <Box onClick={() => setOpen(true)} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', maxWidth: 240 }}>
        <LocationOnIcon color="primary" fontSize="small" />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Deliver to</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight={700} noWrap>{display}</Typography>
            <KeyboardArrowDownIcon fontSize="small" />
          </Box>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delivery Address</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button startIcon={<MyLocationIcon />} variant="outlined" size="small" onClick={detectLocation} disabled={detecting}>
              {detecting ? 'Detecting…' : 'Use current location'}
            </Button>
            <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => setFormOpen(true)}>Add new</Button>
          </Box>
          {!isAuthenticated && (
            <Alert severity="info" sx={{ mb: 2 }}>Login to save addresses permanently</Alert>
          )}
          <List>
            {addresses.map((addr) => (
              <ListItemButton key={addr._id} onClick={() => selectAddress(addr)} selected={active?._id === addr._id}>
                <ListItemText
                  primary={<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>{addr.label} {addr.isDefault && <Chip label="Default" size="small" />}</Box>}
                  secondary={`${addr.street}, ${addr.city} - ${addr.pincode}`}
                />
              </ListItemButton>
            ))}
            {addresses.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={2}>No addresses. Add one to continue.</Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Address</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} margin="dense">
            {LABELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Street / Building" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} margin="dense" required />
          <TextField fullWidth label="Landmark" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} margin="dense" />
          <TextField fullWidth label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} margin="dense" required />
          <TextField fullWidth label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} margin="dense" />
          <TextField fullWidth label="PIN Code" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} margin="dense" required inputProps={{ maxLength: 6 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveAddress}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
