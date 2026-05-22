import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Chip, Alert } from '@mui/material';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import OrderTimeline from '../components/common/OrderTimeline';
import { orderAPI } from '../services/api';
import { ORDER_STATUS_LABELS } from '../utils/constants';

function TrackingContent() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetch = () => orderAPI.getById(id).then(({ data }) => setOrder(data));
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (!order) return <Layout><Typography>Loading order...</Typography></Layout>;

  return (
    <Layout>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        Order #{order._id.slice(-8).toUpperCase()}
      </Typography>
      <Chip label={ORDER_STATUS_LABELS[order.status]} color="primary" sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <OrderTimeline tracking={order.tracking} status={order.status} />
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Typography fontWeight={700}>Delivery Address</Typography>
              <Typography variant="body2" color="text.secondary">
                {order.shippingAddress?.street}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={700}>Items</Typography>
              {order.orderItems?.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography variant="body2">{item.name} x{item.quantity}</Typography>
                  <Typography variant="body2">₹{(item.price * item.quantity).toLocaleString('en-IN')}</Typography>
                </Box>
              ))}
              <Typography variant="h6" fontWeight={800} sx={{ mt: 2 }}>Total: ₹{order.totalPrice?.toLocaleString('en-IN')}</Typography>
            </CardContent>
          </Card>
          {order.estimatedDelivery && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Estimated delivery: {new Date(order.estimatedDelivery).toLocaleString('en-IN')}
            </Alert>
          )}
        </Grid>
      </Grid>
    </Layout>
  );
}

export default function OrderTracking() {
  return <ProtectedRoute><TrackingContent /></ProtectedRoute>;
}
