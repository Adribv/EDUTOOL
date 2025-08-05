import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

const ResponsiveContainer = ({ 
  children, 
  maxWidth = 'lg',
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: theme.breakpoints.values[maxWidth],
        mx: 'auto',
        px: { 
          xs: 1, 
          sm: 2, 
          md: 3, 
          lg: 4 
        },
        py: { 
          xs: 1, 
          sm: 2, 
          md: 3 
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ResponsiveContainer; 