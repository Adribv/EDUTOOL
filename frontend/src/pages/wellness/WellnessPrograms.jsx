import { Box, Typography, Alert } from '@mui/material';

const WellnessPrograms = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Wellness Programs
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to manage wellness programs here.
      </Alert>
    </Box>
  );
};

export default WellnessPrograms; 