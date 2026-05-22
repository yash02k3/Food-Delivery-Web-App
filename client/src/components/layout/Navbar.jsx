import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Badge, Box, InputBase, Button, useTheme, alpha,
  Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { setCartOpen, selectCartCount } from '../../redux/slices/cartSlice';
import { logout } from '../../redux/slices/authSlice';
import { persistor } from '../../redux/store';
import { glassStyle } from '../../theme/theme';
import AddressManager from '../common/AddressManager';

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const mode = useSelector((s) => s.theme.mode);
  const cartCount = useSelector(selectCartCount);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [params, setParams] = useSearchParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const search = params.get('search') || '';

  const handleLogout = async () => {
    setAnchorEl(null);
    dispatch(logout());
    await persistor.purge();
    navigate('/login');
  };

  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const go = (path) => {
    closeMenu();
    navigate(path);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ ...glassStyle(mode), color: 'text.primary', top: 0, zIndex: 1100 }}
    >
      <Toolbar sx={{ gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' }, py: 1 }}>
        <Typography
          variant="h5"
          fontWeight={800}
          color="primary.main"
          sx={{ cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate('/')}
        >
          AgriLink
        </Typography>
        <AddressManager />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderRadius: 3,
            px: 2,
            py: 0.75,
            minWidth: { xs: '100%', md: 280 },
            order: { xs: 3, md: 0 },
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <SearchIcon color="action" fontSize="small" />
          <InputBase
            placeholder="Search cement, steel, tiles..."
            fullWidth
            value={search}
            onChange={(e) => {
              const v = e.target.value;
              const p = new URLSearchParams(params);
              if (v) p.set('search', v);
              else p.delete('search');
              setParams(p);
            }}
            sx={{ ml: 1, fontSize: 14 }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
          <IconButton onClick={() => dispatch(toggleTheme())} size="small">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <Button size="small" onClick={() => navigate('/about')} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
            About
          </Button>
          <IconButton onClick={() => dispatch(setCartOpen(true))}>
            <Badge badgeContent={cartCount} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {!isAuthenticated ? (
            <Button variant="contained" size="small" onClick={() => navigate('/login')} sx={{ ml: 1 }}>
              Login
            </Button>
          ) : (
            <>
              <Button
                onClick={openMenu}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  ml: 1,
                  textTransform: 'none',
                  color: 'text.primary',
                  borderRadius: 3,
                  px: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: 'primary.main', fontSize: 14 }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" fontWeight={700} lineHeight={1.2} noWrap sx={{ maxWidth: 100 }}>
                    {user?.name?.split(' ')[0]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {user?.role}
                  </Typography>
                </Box>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={closeMenu}
                PaperProps={{ sx: { minWidth: 220, borderRadius: 2, mt: 1 } }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography fontWeight={700}>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => go('/profile')}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>My Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => go('/orders')}>
                  <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>My Orders</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => go('/wishlist')}>
                  <ListItemIcon><FavoriteIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Wishlist</ListItemText>
                </MenuItem>
                {user?.role === 'admin' && (
                  <MenuItem onClick={() => go('/admin')}>
                    <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Admin Panel</ListItemText>
                  </MenuItem>
                )}
                {user?.role === 'supplier' && (
                  <MenuItem onClick={() => go('/supplier')}>
                    <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Supplier Dashboard</ListItemText>
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
