import { Box, Typography, Alert } from '@mui/material';

const ITSupportTickets = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        IT Support Tickets
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to manage support tickets here.
      </Alert>
    </Box>
  );
};

export default ITSupportTickets; 