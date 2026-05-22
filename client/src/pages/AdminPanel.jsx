import { useState, useEffect } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ImageIcon from '@mui/icons-material/Image';
import CampaignIcon from '@mui/icons-material/Campaign';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { adminAPI } from '../services/api';
import {
  AdminOverview, AdminUsers, AdminSuppliers, AdminProducts,
  AdminOrders, AdminCoupons, AdminBanners, AdminBroadcast,
} from '../components/admin/AdminSections';

const MENU = [
  { id: 'overview', label: 'Overview', icon: <DashboardIcon /> },
  { id: 'users', label: 'User Management', icon: <PeopleIcon /> },
  { id: 'suppliers', label: 'Supplier Approval', icon: <StoreIcon /> },
  { id: 'products', label: 'Product Moderation', icon: <InventoryIcon /> },
  { id: 'orders', label: 'All Orders', icon: <ReceiptLongIcon /> },
  { id: 'coupons', label: 'Coupons', icon: <LocalOfferIcon /> },
  { id: 'banners', label: 'Homepage Banners', icon: <ImageIcon /> },
  { id: 'notify', label: 'Notifications', icon: <CampaignIcon /> },
];

function PanelContent() {
  const [section, setSection] = useState('overview');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (section === 'overview') adminAPI.getStats().then(({ data }) => setStats(data));
  }, [section]);

  const render = () => {
    switch (section) {
      case 'overview': return <AdminOverview stats={stats} />;
      case 'users': return <AdminUsers />;
      case 'suppliers': return <AdminSuppliers />;
      case 'products': return <AdminProducts />;
      case 'orders': return <AdminOrders />;
      case 'coupons': return <AdminCoupons />;
      case 'banners': return <AdminBanners />;
      case 'notify': return <AdminBroadcast />;
      default: return null;
    }
  };

  return (
    <DashboardLayout
      title="Super Admin Panel"
      subtitle="AgriLink Platform Control"
      menuItems={MENU}
      activeSection={section}
      onSectionChange={setSection}
    >
      {render()}
    </DashboardLayout>
  );
}

export default function AdminPanel() {
  return <ProtectedRoute roles={['admin']}><PanelContent /></ProtectedRoute>;
}
