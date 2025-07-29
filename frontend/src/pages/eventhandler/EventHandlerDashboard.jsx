import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';

const EventHandlerDashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.grey[50] }}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <EventIcon sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 2 }}>
            Event Handler Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This dashboard is under development. Event management features will be available soon.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default EventHandlerDashboard; 