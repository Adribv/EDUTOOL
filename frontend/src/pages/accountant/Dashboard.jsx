import { Box, Typography, Alert } from '@mui/material';

const AccountantDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Accountant Dashboard
      </Typography>
      <Alert severity="info">
        Accountant Dashboard is coming soon. You'll be able to manage finances here.
      </Alert>
    </Box>
  );
};

export default AccountantDashboard; 