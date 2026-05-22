import { Alert, Button, Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setApiConnected } from '../../redux/slices/authSlice';
import { checkApiHealth } from '../../services/api';

export default function ApiStatusBanner() {
  const connected = useSelector((s) => s.auth.apiConnected);
  const dispatch = useDispatch();

  const retry = async () => {
    try {
      await checkApiHealth();
      dispatch(setApiConnected(true));
    } catch {
      dispatch(setApiConnected(false));
    }
  };

  if (connected !== false) return null;

  return (
    <Alert
      severity="error"
      sx={{ borderRadius: 0 }}
      action={
        <Button color="inherit" size="small" onClick={retry}>Retry</Button>
      }
    >
      Backend API is offline. Run <strong>npm run dev</strong> from project root and ensure MongoDB is running.
    </Alert>
  );
}
