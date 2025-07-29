import { Box, Typography, Alert } from '@mui/material';

const FacultyManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Faculty Management
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to manage faculty here.
      </Alert>
    </Box>
  );
};

export default FacultyManagement; 