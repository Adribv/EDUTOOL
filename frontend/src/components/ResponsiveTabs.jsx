import { Box, Tabs, Tab } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

const ResponsiveTabs = ({ 
  children, 
  value, 
  onChange,
  variant = 'scrollable',
  scrollButtons = 'auto',
  allowScrollButtonsMobile = true,
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      overflowX: 'auto',
      '&::-webkit-scrollbar': {
        height: '6px',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: '#f1f1f1',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#c1c1c1',
        borderRadius: '3px',
        '&:hover': {
          backgroundColor: '#a8a8a8',
        },
      },
    }}>
      <Tabs 
        value={value} 
        onChange={onChange}
        variant={variant}
        scrollButtons={scrollButtons}
        allowScrollButtonsMobile={allowScrollButtonsMobile}
        sx={{
          minWidth: { xs: '100%', sm: 'auto' },
          '& .MuiTab-root': {
            minWidth: { xs: 120, sm: 140, md: 160 },
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            padding: { xs: '8px 12px', sm: '12px 16px', md: '16px 24px' },
            textTransform: 'none',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          },
          '& .MuiTabs-scrollButtons': {
            display: { xs: 'flex', sm: 'flex' },
            '&.Mui-disabled': {
              opacity: 0.3,
            },
          },
          '& .MuiTabs-indicator': {
            height: 3,
          },
          ...sx,
        }}
        {...props}
      >
        {children}
      </Tabs>
    </Box>
  );
};

export default ResponsiveTabs; 