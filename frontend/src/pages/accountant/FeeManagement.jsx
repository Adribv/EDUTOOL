import { Box, Typography, Alert } from '@mui/material';

const FeeManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Fee Management
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to manage fees here.
      </Alert>
    </Box>
  );
};

export default FeeManagement; 