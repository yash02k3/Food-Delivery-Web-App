import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl,
  InputLabel, IconButton, Alert, Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { motion } from 'framer-motion';
import { supplierPanelAPI, notificationAPI } from '../../services/api';
import { ORDER_STATUS_LABELS, CATEGORIES } from '../../utils/constants';

const STOCK_COLORS = { in_stock: 'success', low_stock: 'warning', out_of_stock: 'error' };

const emptyProduct = {
  name: '', description: '', category: 'Cement', price: '', stock: 100, unit: 'piece',
  brand: '', image: '', images: [], minOrderQty: 1, gstPercent: 18, discount: 0,
  deliveryEstimate: '30-45 mins', subcategory: '', variants: [],
};

export function SupplierOverview({ data, onRefresh }) {
  if (!data) return <Typography>Loading...</Typography>;
  const { stats, lowStockProducts, recentOrders } = data;
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Revenue', value: `₹${(stats.revenue || 0).toLocaleString('en-IN')}`, color: '#2E7D32' },
          { label: 'Products', value: stats.totalProducts, color: '#1565C0' },
          { label: 'Pending Orders', value: stats.pendingOrders, color: '#FF6F00' },
          { label: 'Low Stock', value: stats.lowStockCount, color: '#C62828' },
        ].map((s, i) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card component={motion.div} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} sx={{ borderRadius: 3, borderLeft: `4px solid ${s.color}` }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                <Typography variant="h5" fontWeight={800}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {lowStockProducts?.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>⚠️ {lowStockProducts.length} products need restocking</Alert>
      )}
      <Typography variant="h6" fontWeight={700} gutterBottom>Recent Orders</Typography>
      <Table size="small">
        <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Amount</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
        <TableBody>
          {recentOrders?.map((o) => (
            <TableRow key={o._id}><TableCell>{o._id.slice(-8)}</TableCell><TableCell>₹{o.totalPrice}</TableCell>
              <TableCell><Chip size="small" label={ORDER_STATUS_LABELS[o.status]} /></TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export function SupplierAnalytics({ data }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = (data?.monthlyRevenue || []).map((m) => ({
    month: months[m._id - 1] || m._id,
    revenue: m.total,
    orders: m.count,
  }));
  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>Revenue Analytics</Typography>
      <Paper sx={{ p: 2, borderRadius: 3, mb: 3, height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" /><YAxis /><Tooltip formatter={(v) => `₹${v}`} />
            <Bar dataKey="revenue" fill="#2E7D32" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
      <Paper sx={{ p: 2, borderRadius: 3, height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" /><YAxis /><Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#FF6F00" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}

export function SupplierInventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [editing, setEditing] = useState(null);

  const load = () => {
    supplierPanelAPI.getProducts({ search, stockStatus: filter || undefined })
      .then(({ data }) => setProducts(data));
  };
  useEffect(() => { load(); }, [search, filter]);

  const openAdd = () => { setEditing(null); setForm(emptyProduct); setDialog(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      ...p,
      images: p.images || [],
      imagesText: (p.images || []).join('\n'),
      price: p.price,
      stock: p.stock,
    });
    setDialog(true);
  };

  const save = async () => {
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      minOrderQty: Number(form.minOrderQty),
      gstPercent: Number(form.gstPercent),
      discount: Number(form.discount),
      images: form.imagesText ? form.imagesText.split('\n').map((s) => s.trim()).filter(Boolean) : form.images,
      image: form.image || (form.imagesText?.split('\n')[0]) || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500',
    };
    delete payload.imagesText;
    if (editing) await supplierPanelAPI.updateProduct(editing, payload);
    else await supplierPanelAPI.createProduct(payload);
    setDialog(false);
    load();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField size="small" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 200 }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Stock</InputLabel>
          <Select value={filter} label="Stock" onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="in_stock">In Stock</MenuItem>
            <MenuItem value="low_stock">Low Stock</MenuItem>
            <MenuItem value="out_of_stock">Out of Stock</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Product</Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell><TableCell>Category</TableCell><TableCell>Price</TableCell>
            <TableCell>Stock</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p._id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="img" src={p.image} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }} />
                  <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                </Box>
              </TableCell>
              <TableCell>{p.category}</TableCell>
              <TableCell>₹{p.price}</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell><Chip size="small" color={STOCK_COLORS[p.stockStatus]} label={p.stockStatus?.replace(/_/g, ' ')} /></TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => openEdit(p)}><EditIcon /></IconButton>
                <IconButton size="small" color="error" onClick={() => supplierPanelAPI.deleteProduct(p._id).then(load)}><DeleteIcon /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Product Title" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Min Order Qty" value={form.minOrderQty} onChange={(e) => setForm({ ...form, minOrderQty: e.target.value })} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="GST %" value={form.gstPercent} onChange={(e) => setForm({ ...form, gstPercent: e.target.value })} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Discount %" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth label="Delivery Time" value={form.deliveryEstimate} onChange={(e) => setForm({ ...form, deliveryEstimate: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Main Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Additional Images (one URL per line)" value={form.imagesText || ''} onChange={(e) => setForm({ ...form, imagesText: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setDialog(false)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
    </Box>
  );
}

export function SupplierOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const load = () => supplierPanelAPI.getOrders().then(({ data }) => setOrders(data));
  useEffect(() => { load(); }, []);

  const update = (id, status) => supplierPanelAPI.updateOrderStatus(id, { status }).then(load);

  return (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Order</TableCell><TableCell>Customer</TableCell><TableCell>Phone</TableCell>
            <TableCell>Total</TableCell><TableCell>Payment</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o._id} hover>
              <TableCell>{o._id.slice(-8)}</TableCell>
              <TableCell>{o.user?.name}</TableCell>
              <TableCell>{o.shippingAddress?.phone || o.user?.phone}</TableCell>
              <TableCell>₹{o.totalPrice}</TableCell>
              <TableCell><Chip size="small" label={o.paymentStatus} /></TableCell>
              <TableCell>
                <Select size="small" value={o.status} onChange={(e) => update(o._id, e.target.value)} sx={{ minWidth: 130 }}>
                  {['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => (
                    <MenuItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <Button size="small" onClick={() => setSelected(o)}>Details</Button>
                <Button size="small" onClick={() => supplierPanelAPI.getInvoice(o._id).then(({ data }) => alert(`Invoice: ${data.invoiceNumber}`))}>Invoice</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle>Order #{selected._id.slice(-8)}</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" fontWeight={700}>Delivery Address</Typography>
              <Typography variant="body2">{selected.shippingAddress?.street}, {selected.shippingAddress?.city} - {selected.shippingAddress?.pincode}</Typography>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2 }}>Items</Typography>
              {selected.orderItems?.map((i, idx) => (
                <Typography key={idx} variant="body2">{i.name} x{i.quantity} — ₹{i.price * i.quantity}</Typography>
              ))}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export function SupplierOffers() {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({ title: '', type: 'percentage', discountValue: 10, minOrder: 500, expiresAt: '', couponCode: '' });
  const [open, setOpen] = useState(false);
  const load = () => supplierPanelAPI.getOffers().then(({ data }) => setOffers(data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    await supplierPanelAPI.createOffer({ ...form, expiresAt: new Date(form.expiresAt), discountValue: Number(form.discountValue) });
    setOpen(false);
    load();
  };

  return (
    <Box>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ mb: 2 }}>Create Offer</Button>
      <Grid container spacing={2}>
        {offers.map((o) => (
          <Grid item xs={12} md={6} key={o._id}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight={700}>{o.title}</Typography>
                <Typography variant="body2" color="text.secondary">{o.description || o.type}</Typography>
                <Chip label={o.couponCode || o.type} size="small" sx={{ mt: 1, mr: 1 }} />
                <Chip label={o.isActive ? 'Active' : 'Expired'} color={o.isActive ? 'success' : 'default'} size="small" />
                <IconButton size="small" color="error" sx={{ float: 'right' }} onClick={() => supplierPanelAPI.deleteOffer(o._id).then(load)}><DeleteIcon /></IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Offer / Coupon</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" margin="dense" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextField select fullWidth label="Type" margin="dense" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['percentage', 'flat', 'bulk', 'free_delivery', 'bogo'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField fullWidth type="number" label="Discount Value" margin="dense" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
          <TextField fullWidth label="Coupon Code" margin="dense" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} />
          <TextField fullWidth type="date" label="Expires" margin="dense" InputLabelProps={{ shrink: true }} value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save}>Create</Button></DialogActions>
      </Dialog>
    </Box>
  );
}

export function SupplierDelivery({ supplier, onSave }) {
  const [form, setForm] = useState({ deliveryTime: supplier?.deliveryTime || '', minOrder: supplier?.minOrder || 500 });
  useEffect(() => setForm({ deliveryTime: supplier?.deliveryTime || '', minOrder: supplier?.minOrder || 500 }), [supplier]);
  return (
    <Card sx={{ p: 3, borderRadius: 3, maxWidth: 480 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>Delivery Management</Typography>
      <TextField fullWidth label="Delivery Time" margin="normal" value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} />
      <TextField fullWidth type="number" label="Minimum Order (₹)" margin="normal" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
      <Button variant="contained" sx={{ mt: 2 }} onClick={() => onSave(form)}>Save Settings</Button>
    </Card>
  );
}

export function SupplierReviews() {
  const [reviews, setReviews] = useState([]);
  useEffect(() => { supplierPanelAPI.getReviews().then(({ data }) => setReviews(data)); }, []);
  return (
    <Box>
      {reviews.length === 0 ? <Typography color="text.secondary">No reviews yet</Typography> : reviews.map((r) => (
        <Card key={r._id} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
          <Typography fontWeight={600}>{r.user?.name} — {'⭐'.repeat(r.rating)}</Typography>
          <Typography variant="body2">{r.comment}</Typography>
        </Card>
      ))}
    </Box>
  );
}

export function SupplierNotifications() {
  const [data, setData] = useState({ notifications: [], unread: 0 });
  const load = () => notificationAPI.getAll().then(({ data }) => setData(data));
  useEffect(() => { load(); }, []);
  return (
    <Box>
      <Button size="small" onClick={() => notificationAPI.markAllRead().then(load)} sx={{ mb: 2 }}>Mark all read</Button>
      {data.notifications?.map((n) => (
        <Card key={n._id} sx={{ mb: 1, p: 2, borderRadius: 2, bgcolor: n.read ? 'background.paper' : 'action.hover' }}>
          <Chip size="small" label={n.type} sx={{ mr: 1 }} />
          <Typography fontWeight={600}>{n.title}</Typography>
          <Typography variant="body2">{n.message}</Typography>
        </Card>
      ))}
    </Box>
  );
}

export function SupplierSettings({ supplier, onSave }) {
  const [form, setForm] = useState({ name: '', businessName: '', phone: '', email: '', description: '', gstNumber: '' });
  useEffect(() => {
    if (supplier) setForm({
      name: supplier.name, businessName: supplier.businessName || '', phone: supplier.phone,
      email: supplier.email, description: supplier.description, gstNumber: supplier.gstNumber || '',
    });
  }, [supplier]);
  return (
    <Card sx={{ p: 3, borderRadius: 3, maxWidth: 560 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>Profile Settings</Typography>
      <Chip label={`Status: ${supplier?.status}`} color={supplier?.status === 'approved' ? 'success' : 'warning'} sx={{ mb: 2 }} />
      {['name', 'businessName', 'phone', 'email', 'gstNumber'].map((f) => (
        <TextField key={f} fullWidth label={f} margin="dense" value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
      ))}
      <TextField fullWidth multiline rows={2} label="description" margin="dense" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <Button variant="contained" sx={{ mt: 2 }} onClick={() => onSave(form)}>Save Profile</Button>
    </Card>
  );
}
