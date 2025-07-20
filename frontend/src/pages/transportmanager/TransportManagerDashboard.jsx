import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { DirectionsBus as TransportIcon } from '@mui/icons-material';

const TransportManagerDashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.grey[50] }}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TransportIcon sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 2 }}>
            Transport Manager Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This dashboard is under development. Transportation management features will be available soon.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default TransportManagerDashboard; 