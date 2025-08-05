import { Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

const ResponsiveButtonGroup = ({ 
  children, 
  gap = { xs: 1, sm: 2 },
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      display: 'flex', 
      gap,
      flexWrap: 'wrap',
      flexDirection: { xs: 'column', sm: 'row' },
      '& .MuiButton-root': {
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        minHeight: { xs: 40, sm: 48 },
        whiteSpace: 'nowrap',
        minWidth: 'fit-content',
      },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
  );
};

export default ResponsiveButtonGroup; 