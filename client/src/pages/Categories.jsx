import { Grid, Typography, Card, CardActionArea, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { CATEGORIES } from '../utils/constants';

export default function Categories() {
  const navigate = useNavigate();
  return (
    <Layout>
      <Typography variant="h5" fontWeight={800} gutterBottom>All Categories</Typography>
      <Grid container spacing={2}>
        {CATEGORIES.map((cat) => (
          <Grid item xs={6} sm={4} md={3} key={cat.name}>
            <Card sx={{ borderRadius: 3, background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)` }}>
              <CardActionArea onClick={() => navigate(`/?category=${cat.name}`)} sx={{ p: 3, textAlign: 'center' }}>
                <Typography fontSize={48}>{cat.icon}</Typography>
                <Typography fontWeight={700}>{cat.name}</Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}
