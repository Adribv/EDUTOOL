import { Box, Typography, Alert } from '@mui/material';

const ExpenseManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Expense Management
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to manage expenses here.
      </Alert>
    </Box>
  );
};

export default ExpenseManagement; 