import { Box, Typography, Alert } from '@mui/material';

const BookIssueReturn = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Book Issue & Return
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to issue and return books here.
      </Alert>
    </Box>
  );
};

export default BookIssueReturn; 