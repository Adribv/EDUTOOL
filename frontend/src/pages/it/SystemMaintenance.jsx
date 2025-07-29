import { Box, Typography, Alert } from '@mui/material';

const SystemMaintenance = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Maintenance
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to manage system maintenance here.
      </Alert>
    </Box>
  );
};

export default SystemMaintenance; 