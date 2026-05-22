import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, IconButton, Tab, Tabs,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminAPI } from '../../services/api';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

const COLORS = ['#2E7D32', '#FF6F00', '#1565C0', '#C62828'];

export function AdminOverview({ stats }) {
  if (!stats) return null;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = (stats.monthlyData || []).map((m) => ({ month: months[m._id - 1], revenue: m.revenue, orders: m.orders }));
  const roleData = (stats.usersByRole || []).map((r) => ({ name: r._id, value: r.count }));
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { l: 'Users', v: stats.users }, { l: 'Products', v: stats.products },
          { l: 'Orders', v: stats.orders }, { l: 'Suppliers', v: stats.suppliers },
          { l: 'Pending Suppliers', v: stats.pendingSuppliers }, { l: 'Revenue', v: `₹${(stats.revenue || 0).toLocaleString('en-IN')}` },
        ].map((s) => (
          <Grid item xs={6} md={2} key={s.l}>
            <Card sx={{ borderRadius: 3, bgcolor: 'primary.main', color: 'white' }}>
              <CardContent><Typography variant="caption">{s.l}</Typography><Typography fontWeight={800}>{s.v}</Typography></CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2, borderRadius: 3, height: 300 }}>
            <Typography fontWeight={700} gutterBottom>Platform Revenue</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData}><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="revenue" fill="#2E7D32" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 3, height: 300 }}>
            <Typography fontWeight={700} gutterBottom>Users by Role</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart><Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie></PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const load = () => adminAPI.getUsers().then(({ data }) => setUsers(data));
  useEffect(() => { load(); }, []);

  const update = (id, patch) => adminAPI.updateUser(id, patch).then(load);

  return (
    <Table size="small">
      <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
      <TableBody>
        {users.map((u) => (
          <TableRow key={u._id}>
            <TableCell>{u.name}</TableCell><TableCell>{u.email}</TableCell>
            <TableCell>
              <Select size="small" value={u.role} onChange={(e) => update(u._id, { role: e.target.value })}>
                {['user', 'supplier', 'admin'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </TableCell>
            <TableCell>
              {u.isBanned && <Chip size="small" color="error" label="Banned" />}
              {u.isSuspended && <Chip size="small" color="warning" label="Suspended" />}
              {!u.isBanned && !u.isSuspended && <Chip size="small" color="success" label="Active" />}
            </TableCell>
            <TableCell>
              <Button size="small" onClick={() => update(u._id, { isSuspended: !u.isSuspended })}>Suspend</Button>
              <Button size="small" color="error" onClick={() => update(u._id, { isBanned: true })}>Ban</Button>
              <IconButton size="small" color="error" onClick={() => adminAPI.deleteUser(u._id).then(load)}><DeleteIcon /></IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AdminSuppliers() {
  const [tab, setTab] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const status = ['pending', 'approved', 'rejected', 'suspended'][tab];
  const load = () => adminAPI.getSuppliers({ status }).then(({ data }) => setSuppliers(data));
  useEffect(() => { load(); }, [tab]);

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Pending" /><Tab label="Approved" /><Tab label="Rejected" /><Tab label="Suspended" />
      </Tabs>
      <Table size="small">
        <TableHead><TableRow><TableCell>Store</TableCell><TableCell>Owner</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {suppliers.map((s) => (
            <TableRow key={s._id}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.ownerId?.email}</TableCell>
              <TableCell><Chip size="small" label={s.status} color={s.status === 'approved' ? 'success' : 'warning'} /></TableCell>
              <TableCell>
                {s.status === 'pending' && (
                  <>
                    <IconButton color="success" onClick={() => adminAPI.approveSupplier(s._id).then(load)}><CheckIcon /></IconButton>
                    <IconButton color="error" onClick={() => adminAPI.rejectSupplier(s._id, 'Documents incomplete').then(load)}><CloseIcon /></IconButton>
                  </>
                )}
                {s.status === 'approved' && <Button size="small" color="warning" onClick={() => adminAPI.suspendSupplier(s._id).then(load)}>Suspend</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  useEffect(() => { adminAPI.getProducts().then(({ data }) => setProducts(data)); }, []);
  return (
    <Table size="small">
      <TableHead><TableRow><TableCell>Product</TableCell><TableCell>Supplier</TableCell><TableCell>Price</TableCell><TableCell>Featured</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
      <TableBody>
        {products.map((p) => (
          <TableRow key={p._id}>
            <TableCell>{p.name}</TableCell><TableCell>{p.supplier?.name}</TableCell><TableCell>₹{p.price}</TableCell>
            <TableCell><Chip size="small" label={p.isFeatured ? 'Yes' : 'No'} color={p.isFeatured ? 'primary' : 'default'} /></TableCell>
            <TableCell>
              <Button size="small" onClick={() => adminAPI.featureProduct(p._id, !p.isFeatured).then(() => adminAPI.getProducts().then(({ data }) => setProducts(data)))}>
                Toggle Featured
              </Button>
              <IconButton size="small" color="error" onClick={() => adminAPI.deleteProduct(p._id).then(() => setProducts(products.filter((x) => x._id !== p._id)))}><DeleteIcon /></IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { adminAPI.getOrders().then(({ data }) => setOrders(data)); }, []);
  return (
    <Table size="small">
      <TableHead><TableRow><TableCell>Order</TableCell><TableCell>User</TableCell><TableCell>Supplier</TableCell><TableCell>Total</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
      <TableBody>
        {orders.map((o) => (
          <TableRow key={o._id}>
            <TableCell>{o._id.slice(-8)}</TableCell><TableCell>{o.user?.name}</TableCell>
            <TableCell>{o.supplier?.name}</TableCell><TableCell>₹{o.totalPrice}</TableCell>
            <TableCell><Chip size="small" label={ORDER_STATUS_LABELS[o.status]} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const load = () => adminAPI.getCoupons().then(({ data }) => setCoupons(data));
  useEffect(() => { load(); }, []);
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField size="small" placeholder="New coupon code" value={code} onChange={(e) => setCode(e.target.value)} />
        <Button variant="contained" onClick={() => adminAPI.createCoupon({ code, discountType: 'percent', discountValue: 10, minOrder: 500 }).then(load)}>Add</Button>
      </Box>
      {coupons.map((c) => (
        <Chip key={c._id} label={`${c.code} — ${c.discountValue}${c.discountType === 'percent' ? '%' : '₹'}`} onDelete={() => adminAPI.deleteCoupon(c._id).then(load)} sx={{ m: 0.5 }} />
      ))}
    </Box>
  );
}

export function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '/' });
  const load = () => adminAPI.getBanners().then(({ data }) => setBanners(data));
  useEffect(() => { load(); }, []);
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={3}><TextField fullWidth size="small" label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
        <Grid item xs={12} sm={3}><TextField fullWidth size="small" label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></Grid>
        <Grid item xs={12} sm={2}><Button variant="contained" onClick={() => adminAPI.createBanner(form).then(load)}>Add Banner</Button></Grid>
      </Grid>
      <Grid container spacing={2}>
        {banners.map((b) => (
          <Grid item xs={12} md={4} key={b._id}>
            <Card sx={{ borderRadius: 3 }}>
              <Box component="img" src={b.image} sx={{ width: '100%', height: 120, objectFit: 'cover' }} />
              <CardContent>
                <Typography fontWeight={700}>{b.title}</Typography>
                <IconButton size="small" color="error" onClick={() => adminAPI.deleteBanner(b._id).then(load)}><DeleteIcon /></IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export function AdminBroadcast() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('');
  return (
    <Card sx={{ p: 3, borderRadius: 3, maxWidth: 480 }}>
      <Typography fontWeight={700} gutterBottom>Send Notification</Typography>
      <TextField fullWidth label="Title" margin="dense" value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextField fullWidth multiline rows={3} label="Message" margin="dense" value={message} onChange={(e) => setMessage(e.target.value)} />
      <FormControl fullWidth margin="dense">
        <InputLabel>Target Role</InputLabel>
        <Select value={role} label="Target Role" onChange={(e) => setRole(e.target.value)}>
          <MenuItem value="">All users</MenuItem>
          <MenuItem value="user">Customers</MenuItem>
          <MenuItem value="supplier">Suppliers</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" sx={{ mt: 2 }} onClick={() => adminAPI.broadcastNotification({ title, message, role: role || undefined }).then(() => alert('Sent!'))}>
        Broadcast
      </Button>
    </Card>
  );
}
