import { Box, Typography, Alert } from '@mui/material';

const CounsellingSessionsManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Counselling Sessions Management
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to manage counselling sessions here.
      </Alert>
    </Box>
  );
};

export default CounsellingSessionsManagement; 