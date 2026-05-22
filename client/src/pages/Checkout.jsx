import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, Button, RadioGroup, FormControlLabel, Radio,
  Divider, Alert, Stepper, Step, StepLabel, TextField, Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AddressManager from '../components/common/AddressManager';
import { selectCartItems, selectCartTotal, clearCart } from '../redux/slices/cartSlice';
import { orderAPI, paymentAPI, couponAPI } from '../services/api';
import { glassStyle } from '../theme/theme';

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when materials are delivered' },
  { value: 'half_advance', label: '50% Advance Payment', desc: '50% advance payment required for bulk construction orders' },
  { value: 'full_online', label: 'Full Online Payment', desc: 'Pay 100% now via Razorpay (TEST mode)' },
];

function CheckoutContent() {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const mode = useSelector((s) => s.theme.mode);
  const address = useSelector((s) => s.auth.deliveryAddress);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (subtotal > 0) {
      paymentAPI.calculate({ itemsPrice: subtotal, paymentMethod, couponDiscount })
        .then(({ data }) => setPricing(data))
        .catch(() => {
          const tax = Math.round(subtotal * 0.05);
          const delivery = subtotal > 2000 ? 0 : 49;
          const total = subtotal + tax + delivery - couponDiscount;
          setPricing({
            itemsPrice: subtotal, taxPrice: tax, deliveryPrice: delivery,
            couponDiscount, totalPrice: total,
            advanceAmount: paymentMethod === 'half_advance' ? Math.round(total * 0.5) : paymentMethod === 'full_online' ? total : 0,
            dueAmount: paymentMethod === 'half_advance' ? total - Math.round(total * 0.5) : paymentMethod === 'cod' ? total : 0,
            advanceNote: paymentMethod === 'half_advance' ? '50% advance payment required for bulk construction orders.' : null,
          });
        });
    }
  }, [subtotal, paymentMethod, couponDiscount]);

  const applyCoupon = async () => {
    try {
      const { data } = await couponAPI.validate({ code: couponCode, orderAmount: subtotal });
      setCouponDiscount(data.discount);
    } catch (err) {
      setError(err.friendlyMessage || 'Invalid coupon');
    }
  };

  const processPayment = async () => {
    if (!address?.street) {
      setError('Please select a delivery address');
      setStep(0);
      return;
    }
    setLoading(true);
    setError('');
    try {
      let paymentResult = {};
      const payAmount = pricing?.advanceAmount || pricing?.totalPrice || subtotal;

      if (paymentMethod === 'full_online' || paymentMethod === 'half_advance') {
        const { data: rzOrder } = await paymentAPI.createRazorpayOrder({
          amount: payAmount,
          receipt: `AGR_${Date.now()}`,
        });
        const { data: verified } = await paymentAPI.verifyRazorpay({
          razorpay_order_id: rzOrder.id,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: 'test_signature_agrilink',
        });
        paymentResult = {
          razorpayOrderId: rzOrder.id,
          razorpayPaymentId: verified.razorpay_payment_id,
          status: 'captured',
        };
      }

      const { data: order } = await orderAPI.create({
        orderItems: items.map((i) => ({
          product: i._id,
          quantity: i.quantity,
          variantSku: i.variantSku,
        })),
        shippingAddress: { ...address, phone: user?.phone },
        paymentMethod,
        couponCode: couponDiscount ? couponCode : undefined,
        paymentResult,
        notes: paymentMethod === 'half_advance' ? '50% advance paid' : '',
      });

      setOrderId(order._id);
      dispatch(clearCart());
      setStep(2);
    } catch (err) {
      setError(err.friendlyMessage || err.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderId) {
    return (
      <Layout>
        <Alert severity="info">Your cart is empty</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>Continue Shopping</Button>
      </Layout>
    );
  }

  const p = pricing || {};

  return (
    <Layout>
      <Typography variant="h5" fontWeight={800} gutterBottom>Checkout</Typography>
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        <Step><StepLabel>Address</StepLabel></Step>
        <Step><StepLabel>Payment</StepLabel></Step>
        <Step><StepLabel>Done</StepLabel></Step>
      </Stepper>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          {step === 0 && (
            <Card sx={{ ...glassStyle(mode), p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700} gutterBottom>Delivery Address</Typography>
              <AddressManager />
              {address && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="body2"><strong>{address.label}</strong></Typography>
                  <Typography variant="body2">{address.street}, {address.city} - {address.pincode}</Typography>
                </Box>
              )}
              <Button variant="contained" sx={{ mt: 2 }} disabled={!address} onClick={() => setStep(1)}>Continue</Button>
            </Card>
          )}

          {step === 1 && (
            <Card sx={{ ...glassStyle(mode), p: 3, borderRadius: 3 }}>
              <Typography fontWeight={700} gutterBottom>Payment Method</Typography>
              <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {PAYMENT_OPTIONS.map((opt) => (
                  <Box key={opt.value} sx={{ mb: 1, p: 1.5, border: 1, borderColor: paymentMethod === opt.value ? 'primary.main' : 'divider', borderRadius: 2 }}>
                    <FormControlLabel value={opt.value} control={<Radio />} label={<Box><Typography fontWeight={600}>{opt.label}</Typography><Typography variant="caption" color="text.secondary">{opt.desc}</Typography></Box>} />
                  </Box>
                ))}
              </RadioGroup>
              {p.advanceNote && <Alert severity="warning" sx={{ mt: 2 }}>{p.advanceNote}</Alert>}
              {paymentMethod !== 'cod' && (
                <Alert severity="info" sx={{ mt: 2 }}>Razorpay TEST mode — payment simulated automatically</Alert>
              )}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField size="small" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                <Button variant="outlined" onClick={applyCoupon}>Apply</Button>
              </Box>
              {couponDiscount > 0 && <Chip label={`₹${couponDiscount} off`} color="success" sx={{ mt: 1 }} />}
              <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} disabled={loading} onClick={processPayment}>
                {loading ? 'Processing…' : `Place Order — ₹${(p.advanceAmount || p.totalPrice || 0).toLocaleString('en-IN')}`}
              </Button>
              <Button sx={{ mt: 1 }} onClick={() => setStep(0)}>Back</Button>
            </Card>
          )}

          {step === 2 && (
            <Card sx={{ ...glassStyle(mode), p: 4, borderRadius: 3, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: 'success.main' }} />
              <Typography variant="h5" fontWeight={800} sx={{ mt: 2 }}>Order Confirmed!</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Invoice generated. Track your delivery live.</Typography>
              {p.advanceAmount > 0 && p.dueAmount > 0 && (
                <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
                  Advance paid: ₹{p.advanceAmount} • Due on delivery: ₹{p.dueAmount}
                </Alert>
              )}
              <Button variant="contained" sx={{ mt: 3, mr: 1 }} onClick={() => navigate(`/orders/${orderId}`)}>Track Order</Button>
              <Button sx={{ mt: 3 }} onClick={() => navigate('/orders')}>All Orders</Button>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, borderRadius: 3, ...glassStyle(mode), position: 'sticky', top: 90 }}>
            <Typography fontWeight={700} gutterBottom>Bill Details (GST Invoice)</Typography>
            {items.map((i) => (
              <Box key={`${i._id}-${i.variantSku}`} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography variant="body2" noWrap sx={{ maxWidth: '60%' }}>{i.name} x{i.quantity}</Typography>
                <Typography variant="body2">₹{((i.price || 0) * i.quantity).toLocaleString('en-IN')}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Row label="Subtotal" value={p.itemsPrice} />
            <Row label="GST (5%)" value={p.taxPrice} />
            <Row label="Delivery" value={p.deliveryPrice} free={p.deliveryPrice === 0} />
            {couponDiscount > 0 && <Row label="Coupon" value={-couponDiscount} />}
            <Divider sx={{ my: 2 }} />
            <Row label="Total" value={p.totalPrice} bold />
            {p.advanceAmount > 0 && <Row label="Pay Now" value={p.advanceAmount} bold color="primary.main" />}
            {p.dueAmount > 0 && <Row label="Due on Delivery" value={p.dueAmount} />}
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

function Row({ label, value, bold, free, color }) {
  if (value === undefined) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" fontWeight={bold ? 800 : 400} color={color}>
        {free ? 'FREE' : `₹${Number(value).toLocaleString('en-IN')}`}
      </Typography>
    </Box>
  );
}

export default function Checkout() {
  return <ProtectedRoute><CheckoutContent /></ProtectedRoute>;
}
