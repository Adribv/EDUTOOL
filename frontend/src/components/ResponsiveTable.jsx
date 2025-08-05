import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

const ResponsiveTable = ({ 
  children, 
  minWidth = { xs: 600, sm: 800, md: 'auto' },
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
      ...sx,
    }}>
      <Table 
        sx={{ 
          minWidth,
          '& .MuiTableCell-root': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '8px 4px', sm: '16px' },
            whiteSpace: 'nowrap',
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            fontWeight: 600,
            backgroundColor: theme.palette.grey[50],
          },
        }}
        {...props}
      >
        {children}
      </Table>
    </Box>
  );
};

export default ResponsiveTable; 