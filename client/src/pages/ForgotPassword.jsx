import { useState } from 'react';
import { Box, Card, TextField, Button, Typography, Alert, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../services/api';
import { glassStyle } from '../theme/theme';
import { useSelector } from 'react-redux';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const mode = useSelector((s) => s.theme.mode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authAPI.forgotPassword(email);
      setResult(data);
      setError('');
    } catch (err) {
      setError(err.friendlyMessage || 'Request failed');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #1B5E20, #4CAF50)' }}>
      <Container maxWidth="sm">
        <Card sx={{ ...glassStyle(mode), p: 4, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={800}>Forgot Password</Typography>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {result ? (
            <Alert severity="success" sx={{ mt: 2 }}>{result.message}</Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>Send Reset Link</Button>
            </Box>
          )}
          <Button component={RouterLink} to="/login" sx={{ mt: 2 }}>Back to Login</Button>
        </Card>
      </Container>
    </Box>
  );
}
