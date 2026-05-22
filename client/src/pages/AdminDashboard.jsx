import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, Chip,
} from '@mui/material';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { adminAPI } from '../services/api';
import { ORDER_STATUS_LABELS } from '../utils/constants';

function AdminContent() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAPI.getStats().then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <Layout><Typography>Loading...</Typography></Layout>;

  return (
    <Layout>
      <Typography variant="h5" fontWeight={800} gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Users', value: stats.users },
          { label: 'Products', value: stats.products },
          { label: 'Orders', value: stats.orders },
          { label: 'Suppliers', value: stats.suppliers },
          { label: 'Revenue', value: `₹${stats.revenue?.toLocaleString('en-IN')}` },
        ].map((s) => (
          <Grid item xs={6} sm={4} md={2.4} key={s.label}>
            <Card sx={{ borderRadius: 3, bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>{s.label}</Typography>
                <Typography variant="h5" fontWeight={800}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h6" fontWeight={700} gutterBottom>Recent Orders</Typography>
      <Card sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.recentOrders?.map((o) => (
              <TableRow key={o._id}>
                <TableCell>{o._id.slice(-8)}</TableCell>
                <TableCell>{o.user?.name}</TableCell>
                <TableCell>₹{o.totalPrice}</TableCell>
                <TableCell><Chip size="small" label={ORDER_STATUS_LABELS[o.status] || o.status} /></TableCell>
                <TableCell>{o.paymentStatus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Layout>
  );
}

export default function AdminDashboard() {
  return <ProtectedRoute roles={['admin']}><AdminContent /></ProtectedRoute>;
}
