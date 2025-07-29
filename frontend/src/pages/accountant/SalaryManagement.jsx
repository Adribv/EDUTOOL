import { Box, Typography, Alert } from '@mui/material';

const SalaryManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Salary Management
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to manage salaries here.
      </Alert>
    </Box>
  );
};

export default SalaryManagement; 