import { Box, Typography, Alert } from '@mui/material';

const MentalHealthReports = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mental Health Reports
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to view mental health reports here.
      </Alert>
    </Box>
  );
};

export default MentalHealthReports; 