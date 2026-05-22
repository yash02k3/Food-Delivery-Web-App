import { Box, Typography, Grid, Card, CardContent, Container } from '@mui/material';
import Layout from '../components/layout/Layout';
import { FOOTER } from '../utils/constants';

export default function About() {
  return (
    <Layout>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight={800} color="primary.main">About AgriLink</Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1, maxWidth: 700, mx: 'auto' }}>
          India's premium construction material delivery platform — cement, steel, bricks, tiles delivered to your site in minutes.
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {[
          { title: 'Our Mission', text: 'Make construction procurement as easy as ordering food. Quality materials, transparent pricing, on-time delivery.' },
          { title: 'Why AgriLink', text: 'Trusted suppliers, dynamic variants, bulk order support with 50% advance, live tracking, and GST invoicing.' },
          { title: 'Coverage', text: 'Serving major cities across India with expanding supplier network for contractors and builders.' },
        ].map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>{item.title}</Typography>
                <Typography color="text.secondary">{item.text}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 6, p: 4, borderRadius: 4, bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={700}>{FOOTER.developers}</Typography>
        <Typography sx={{ mt: 1 }}>📞 {FOOTER.phone} • 📧 {FOOTER.email} • {FOOTER.location}</Typography>
      </Box>
    </Layout>
  );
}
