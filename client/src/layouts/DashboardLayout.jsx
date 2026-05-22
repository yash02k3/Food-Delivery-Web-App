import { useState } from 'react';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography,
  IconButton, useTheme, useMediaQuery, AppBar, Toolbar, Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { glassStyle } from '../theme/theme';

const DRAWER_WIDTH = 260;

export default function DashboardLayout({ title, subtitle, menuItems, activeSection, onSectionChange, children, notifications = 0 }) {
  const theme = useTheme();
  const mode = useSelector((s) => s.theme.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const drawer = (
    <Box sx={{ pt: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="h6" fontWeight={800} color="primary.main">AgriLink</Typography>
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
      </Box>
      <List sx={{ flex: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.id}
            selected={activeSection === item.id}
            onClick={() => { onSectionChange(item.id); setMobileOpen(false); }}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activeSection === item.id ? 700 : 500, fontSize: 14 }} />
          </ListItemButton>
        ))}
      </List>
      <ListItemButton onClick={() => navigate('/')} sx={{ mx: 1, mb: 2, borderRadius: 2 }}>
        <ListItemIcon><ArrowBackIcon /></ListItemIcon>
        <ListItemText primary="Back to Store" />
      </ListItemButton>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" elevation={0} sx={{ ...glassStyle(mode), color: 'text.primary', ml: { md: `${DRAWER_WIDTH}px` }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        <Toolbar>
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(!mobileOpen)}><MenuIcon /></IconButton>
          )}
          <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>{title}</Typography>
          {notifications > 0 && (
            <IconButton onClick={() => onSectionChange('notifications')}>
              <Badge badgeContent={notifications} color="error"><NotificationsIcon /></Badge>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: 8, ml: { md: 0 }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
        {children}
      </Box>
    </Box>
  );
}
