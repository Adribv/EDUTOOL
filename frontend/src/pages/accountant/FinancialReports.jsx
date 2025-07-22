import { Box, Typography, Alert } from '@mui/material';

const FinancialReports = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Financial Reports
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to view financial reports here.
      </Alert>
    </Box>
  );
};

export default FinancialReports; 