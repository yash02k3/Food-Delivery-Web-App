import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Rating, Chip } from '@mui/material';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/common/ProductCard';
import { supplierAPI } from '../services/api';

export default function SupplierDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    supplierAPI.getById(id).then(({ data }) => setData(data));
  }, [id]);

  if (!data) return <Layout><Typography>Loading...</Typography></Layout>;
  const { supplier, products } = data;

  return (
    <Layout>
      <Card sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ height: 160, background: `url(${supplier.coverImage}) center/cover` }} />
        <CardContent>
          <Typography variant="h4" fontWeight={800}>{supplier.name}</Typography>
          <Typography color="text.secondary" paragraph>{supplier.description}</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Rating value={supplier.rating} readOnly precision={0.1} size="small" />
            <Chip label={supplier.deliveryTime} size="small" />
            <Chip label={`Min order ₹${supplier.minOrder}`} size="small" variant="outlined" />
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            📍 {supplier.address?.street}, {supplier.address?.city} • 📞 {supplier.phone}
          </Typography>
        </CardContent>
      </Card>
      <Typography variant="h6" fontWeight={700} gutterBottom>Products from {supplier.name}</Typography>
      <Grid container spacing={2}>
        {products.map((p) => (
          <Grid item xs={6} sm={4} md={3} key={p._id}>
            <ProductCard product={p} />
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}
