import { Typography, Box } from '@mui/material';
import Layout from '../components/layout/Layout';

const CONTENT = {
  terms: {
    title: 'Terms & Conditions',
    body: 'By using AgriLink you agree to our delivery terms, pricing policies, and bulk order advance payment requirements. Materials are subject to stock availability. Cancellation allowed before dispatch.',
  },
  privacy: {
    title: 'Privacy Policy',
    body: 'AgriLink protects your personal data. We collect name, email, phone, and addresses for order fulfillment only. Payment data is processed securely via Razorpay. We do not sell your data to third parties.',
  },
};

export default function StaticPage({ type }) {
  const c = CONTENT[type];
  return (
    <Layout>
      <Typography variant="h4" fontWeight={800} gutterBottom>{c.title}</Typography>
      <Box sx={{ maxWidth: 800 }}><Typography color="text.secondary" lineHeight={1.8}>{c.body}</Typography></Box>
    </Layout>
  );
}
