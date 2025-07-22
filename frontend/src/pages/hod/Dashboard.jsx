import { Box, Typography, Alert } from '@mui/material';

const HODDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        HOD Dashboard
          </Typography>
      <Alert severity="info">
        HOD Dashboard is coming soon. You'll be able to manage your department here.
      </Alert>
    </Box>
  );
};

export default HODDashboard; 