import { Box, Typography, TextField, Button, Grid, Card, CardContent, Alert } from '@mui/material';
import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { FOOTER } from '../utils/constants';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  return (
    <Layout>
      <Typography variant="h4" fontWeight={800} gutterBottom>Contact Us</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Typography fontWeight={700}>AgriLink Support</Typography>
            <Typography sx={{ mt: 2 }}>Phone: {FOOTER.phone}</Typography>
            <Typography>Email: {FOOTER.email}</Typography>
            <Typography>Location: {FOOTER.location}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          {sent ? <Alert severity="success">Message sent! We'll respond within 24 hours.</Alert> : (
            <Card sx={{ p: 3, borderRadius: 3 }}>
              <TextField fullWidth label="Name" margin="normal" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField fullWidth label="Email" margin="normal" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <TextField fullWidth label="Message" multiline rows={4} margin="normal" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => setSent(true)}>Send Message</Button>
            </Card>
          )}
        </Grid>
      </Grid>
    </Layout>
  );
}
