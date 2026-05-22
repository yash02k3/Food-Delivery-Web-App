import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#2E7D32', light: '#4CAF50', dark: '#1B5E20' },
      secondary: { main: '#FF6F00', light: '#FFA040', dark: '#E65100' },
      background: {
        default: mode === 'dark' ? '#0a0f0a' : '#f4f7f4',
        paper: mode === 'dark' ? 'rgba(20, 28, 20, 0.85)' : 'rgba(255, 255, 255, 0.75)',
      },
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 12, padding: '10px 24px' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(12px)',
            border: mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          },
        },
      },
    },
  });

export const glassStyle = (mode) => ({
  background: mode === 'dark' ? 'rgba(20, 28, 20, 0.72)' : 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
  boxShadow: mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(46,125,50,0.08)',
});
