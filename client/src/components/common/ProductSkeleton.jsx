import { Grid, Skeleton, Card, CardContent } from '@mui/material';

export default function ProductSkeleton({ count = 8 }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item xs={6} sm={4} md={3} key={i}>
          <Card sx={{ borderRadius: 3 }}>
            <Skeleton variant="rectangular" height={160} />
            <CardContent>
              <Skeleton width="80%" />
              <Skeleton width="50%" />
              <Skeleton width="40%" height={32} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
