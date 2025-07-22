import { Box, Typography, Alert } from '@mui/material';

const NetworkManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Network Management
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to manage network here.
      </Alert>
    </Box>
  );
};

export default NetworkManagement; 