import { useState } from 'react';
import {
  Box, Typography, Dialog, DialogTitle, DialogContent, TextField, Button, List, ListItemButton, ListItemText, IconButton,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useDispatch, useSelector } from 'react-redux';
import { setDeliveryAddress } from '../../redux/slices/authSlice';

const DEFAULT_ADDRESSES = [
  { label: 'Home', street: '42, Green Park Extension', city: 'New Delhi', state: 'Delhi', pincode: '110016', landmark: 'Near Metro Gate 2' },
  { label: 'Site', street: 'Plot 15, Sector 62', city: 'Noida', state: 'UP', pincode: '201301', landmark: 'Opposite IT Park' },
];

export default function LocationSelector() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const address = useSelector((s) => s.auth.deliveryAddress) || JSON.parse(localStorage.getItem('agrilink_address') || 'null') || DEFAULT_ADDRESSES[0];
  const userAddresses = useSelector((s) => s.auth.user?.addresses) || [];

  const selectAddress = (addr) => {
    dispatch(setDeliveryAddress(addr));
    localStorage.setItem('agrilink_address', JSON.stringify(addr));
    setOpen(false);
  };

  const display = `${address.street?.slice(0, 30) || address.label}, ${address.city}`;

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', maxWidth: 220 }}
      >
        <LocationOnIcon color="primary" fontSize="small" />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Deliver to
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {display}
            </Typography>
            <KeyboardArrowDownIcon fontSize="small" />
          </Box>
        </Box>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={700}>Select Delivery Location</DialogTitle>
        <DialogContent>
          <List>
            {[...userAddresses, ...DEFAULT_ADDRESSES].map((addr, i) => (
              <ListItemButton key={i} onClick={() => selectAddress(addr)} selected={address.label === addr.label}>
                <ListItemText
                  primary={addr.label}
                  secondary={`${addr.street}, ${addr.city} - ${addr.pincode}`}
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
