import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const TestPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ color: 'primary.main' }}>
        ✅ Parent Layout Test Page
      </Typography>
      <Typography variant="h6" gutterBottom>
        If you can see this, the parent layout is working!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        This page confirms that:
        - Parent layout is loading correctly
        - Sidebar navigation is visible
        - Routing is working properly
      </Typography>
      <Button variant="contained" color="primary">
        Test Button
      </Button>
    </Box>
  );
};

export default TestPage; 