import { Box, Typography, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { CATEGORIES } from '../../utils/constants';

export default function CategoryBar({ selected, onSelect }) {
  return (
    <Box sx={{ mb: 3, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
      <Box sx={{ display: 'flex', gap: 1.5, minWidth: 'max-content', px: 0.5 }}>
        <Chip
          label="All"
          onClick={() => onSelect('')}
          color={!selected ? 'primary' : 'default'}
          sx={{ fontWeight: 600, px: 1 }}
        />
        {CATEGORIES.map((cat) => (
          <Box
            key={cat.name}
            component={motion.div}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(cat.name)}
            sx={{
              cursor: 'pointer',
              textAlign: 'center',
              minWidth: 72,
              p: 1.5,
              borderRadius: 3,
              bgcolor: selected === cat.name ? 'primary.main' : 'background.paper',
              color: selected === cat.name ? 'white' : 'text.primary',
              border: '1px solid',
              borderColor: selected === cat.name ? 'primary.main' : 'divider',
              transition: 'all 0.2s',
            }}
          >
            <Typography fontSize={24}>{cat.icon}</Typography>
            <Typography variant="caption" fontWeight={600} display="block">
              {cat.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
