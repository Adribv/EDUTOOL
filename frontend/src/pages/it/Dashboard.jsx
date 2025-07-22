import { Box, Typography, Alert } from '@mui/material';

const ITDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        IT Support Dashboard
      </Typography>
      <Alert severity="info">
        IT Support Dashboard is coming soon. You'll be able to manage IT support here.
      </Alert>
    </Box>
  );
};

export default ITDashboard; 