import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { supplierAPI, orderAPI } from '../services/api';
import { ORDER_STATUS_LABELS } from '../utils/constants';

function SupplierContent() {
  const [data, setData] = useState({ supplier: null, products: [] });
  const [orders, setOrders] = useState([]);

  const load = () => {
    supplierAPI.getDashboard().then(({ data }) => setData(data)).catch(() => {});
    orderAPI.getSupplierOrders().then(({ data }) => setOrders(data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (orderId, status) => {
    await orderAPI.updateStatus(orderId, { status });
    load();
  };

  return (
    <Layout>
      <Typography variant="h5" fontWeight={800} gutterBottom>Supplier Dashboard</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}><CardContent><Typography color="text.secondary">Store</Typography><Typography variant="h6" fontWeight={700}>{data.supplier?.name || '—'}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}><CardContent><Typography color="text.secondary">Products</Typography><Typography variant="h6" fontWeight={700}>{data.products?.length || 0}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3 }}><CardContent><Typography color="text.secondary">Orders</Typography><Typography variant="h6" fontWeight={700}>{orders.length}</Typography></CardContent></Card>
        </Grid>
      </Grid>
      <Typography variant="h6" fontWeight={700} gutterBottom>Order Management</Typography>
      <Card sx={{ borderRadius: 3, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o._id}>
                <TableCell>{o._id.slice(-8)}</TableCell>
                <TableCell>{o.user?.name}</TableCell>
                <TableCell>₹{o.totalPrice}</TableCell>
                <TableCell>{ORDER_STATUS_LABELS[o.status]}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                      {['confirmed', 'packed', 'out_for_delivery', 'delivered'].map((s) => (
                        <MenuItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Layout>
  );
}

export default function SupplierDashboard() {
  return <ProtectedRoute roles={['supplier', 'admin']}><SupplierContent /></ProtectedRoute>;
}
