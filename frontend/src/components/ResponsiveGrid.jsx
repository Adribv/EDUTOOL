import { Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

const ResponsiveGrid = ({ 
  children, 
  spacing = { xs: 1, sm: 2, md: 3 },
  justifyContent = 'center',
  alignItems = 'stretch',
  sx = {},
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid
      container
      spacing={spacing}
      justifyContent={justifyContent}
      alignItems={alignItems}
      sx={{
        width: '100%',
        margin: 0,
        '& .MuiGrid-item': {
          padding: { xs: 1, sm: 1.5, md: 2 },
          display: 'flex',
          flexDirection: 'column',
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Grid>
  );
};

export default ResponsiveGrid; 