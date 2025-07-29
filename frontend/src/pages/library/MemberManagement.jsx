import { Box, Typography, Alert } from '@mui/material';

const MemberManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Member Management
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to manage library members here.
      </Alert>
    </Box>
  );
};

export default MemberManagement; 