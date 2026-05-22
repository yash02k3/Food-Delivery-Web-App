import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { FOOTER } from '../../utils/constants';

export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: 8, py: 4, bgcolor: 'primary.dark', color: 'white' }}>
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Typography variant="h5" fontWeight={800}>AgriLink</Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.85 }}>
              Construction materials delivered fast. Cement, steel, bricks & more.
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography fontWeight={700} gutterBottom>Quick Links</Typography>
            {['/about', '/contact', '/categories', '/terms', '/privacy'].map((path) => (
              <Typography key={path} variant="body2" sx={{ mb: 0.5 }}>
                <Link component={RouterLink} to={path} color="inherit" underline="hover">
                  {path.replace('/', '').replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </Link>
              </Typography>
            ))}
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography fontWeight={700} gutterBottom>Contact</Typography>
            <Typography variant="body2">Contact Me: {FOOTER.phone}</Typography>
            <Typography variant="body2">{FOOTER.location}</Typography>
            <Link href={`mailto:${FOOTER.email}`} color="inherit">{FOOTER.email}</Link>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography fontWeight={700} gutterBottom>Team</Typography>
            <Typography variant="body2">{FOOTER.developers}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
        <Typography variant="body2" textAlign="center" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} AgriLink. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
