import { useState, useEffect } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StarIcon from '@mui/icons-material/Star';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { Alert, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { supplierPanelAPI, notificationAPI } from '../services/api';
import {
  SupplierOverview, SupplierAnalytics, SupplierInventory, SupplierOrders,
  SupplierOffers, SupplierDelivery, SupplierReviews, SupplierNotifications, SupplierSettings,
} from '../components/supplier/SupplierSections';

const MENU = [
  { id: 'overview', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'inventory', label: 'Inventory', icon: <InventoryIcon /> },
  { id: 'orders', label: 'Orders', icon: <ReceiptLongIcon /> },
  { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
  { id: 'offers', label: 'Offers & Coupons', icon: <LocalOfferIcon /> },
  { id: 'delivery', label: 'Delivery', icon: <LocalShippingIcon /> },
  { id: 'reviews', label: 'Reviews', icon: <StarIcon /> },
  { id: 'notifications', label: 'Notifications', icon: <NotificationsIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

function PanelContent() {
  const [section, setSection] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [unread, setUnread] = useState(0);
  const [blocked, setBlocked] = useState(null);

  const load = async () => {
    try {
      const me = await supplierPanelAPI.getMe();
      setSupplier(me.data);
      if (me.data.status !== 'approved') {
        setBlocked(me.data.status);
        return;
      }
      const [dash, notif] = await Promise.all([
        supplierPanelAPI.getDashboard(),
        notificationAPI.getAll(),
      ]);
      setDashboard(dash.data);
      setUnread(notif.data.unread);
      setBlocked(null);
    } catch (err) {
      setBlocked(err.response?.data?.status || 'error');
      if (err.response?.data?.status) setSupplier({ status: err.response.data.status });
    }
  };

  useEffect(() => { load(); }, [section]);

  if (blocked && blocked !== 'approved') {
    return (
      <DashboardLayout title="Supplier Panel" subtitle="AgriLink Seller Hub" menuItems={MENU} activeSection="overview" onSectionChange={setSection} notifications={0}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your supplier account is <strong>{blocked}</strong>. Only approved suppliers can manage inventory.
          Contact admin or wait for approval.
        </Alert>
        <SupplierSettings supplier={supplier} onSave={(f) => supplierPanelAPI.updateProfile(f).then(load)} />
      </DashboardLayout>
    );
  }

  const render = () => {
    switch (section) {
      case 'overview': return <SupplierOverview data={dashboard} onRefresh={load} />;
      case 'inventory': return <SupplierInventory />;
      case 'orders': return <SupplierOrders />;
      case 'analytics': return <SupplierAnalytics data={dashboard} />;
      case 'offers': return <SupplierOffers />;
      case 'delivery': return <SupplierDelivery supplier={supplier} onSave={(f) => supplierPanelAPI.updateDelivery(f).then(load)} />;
      case 'reviews': return <SupplierReviews />;
      case 'notifications': return <SupplierNotifications />;
      case 'settings': return <SupplierSettings supplier={supplier} onSave={(f) => supplierPanelAPI.updateProfile(f).then(load)} />;
      default: return null;
    }
  };

  return (
    <DashboardLayout
      title={MENU.find((m) => m.id === section)?.label || 'Supplier Panel'}
      subtitle={supplier?.name || 'Seller Hub'}
      menuItems={MENU}
      activeSection={section}
      onSectionChange={setSection}
      notifications={unread}
    >
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        {supplier?.name} • ⭐ {supplier?.rating} • {supplier?.deliveryTime}
      </Typography>
      {render()}
    </DashboardLayout>
  );
}

export default function SupplierPanel() {
  return <ProtectedRoute roles={['supplier', 'admin']}><PanelContent /></ProtectedRoute>;
}
