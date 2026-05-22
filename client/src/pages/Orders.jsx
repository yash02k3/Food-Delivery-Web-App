import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Button, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { orderAPI } from '../services/api';
import { ORDER_STATUS_LABELS } from '../utils/constants';

const statusColor = {
  placed: 'default',
  confirmed: 'info',
  packed: 'warning',
  out_for_delivery: 'primary',
  delivered: 'success',
  cancelled: 'error',
};

function OrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    orderAPI.getMyOrders().then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <Typography variant="h5" fontWeight={800} gutterBottom>Order History</Typography>
      {loading && <Typography>Loading...</Typography>}
      {!loading && orders.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">No orders yet</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>Start Shopping</Button>
        </Box>
      )}
      <Grid container spacing={2}>
        {orders.map((order) => (
          <Grid item xs={12} key={order._id}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography fontWeight={700}>Order #{order._id.slice(-8).toUpperCase()}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.createdAt).toLocaleString('en-IN')} • {order.orderItems?.length} items
                    </Typography>
                  </Box>
                  <Chip label={ORDER_STATUS_LABELS[order.status] || order.status} color={statusColor[order.status] || 'default'} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>₹{order.totalPrice?.toLocaleString('en-IN')}</Typography>
                <Button size="small" sx={{ mt: 1 }} onClick={() => navigate(`/orders/${order._id}`)}>Track Live</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

export default function Orders() {
  return <ProtectedRoute><OrdersContent /></ProtectedRoute>;
}
