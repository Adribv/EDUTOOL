import { Box, Typography, Alert } from '@mui/material';

const BookManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Book Management
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to manage your library's book collection here.
      </Alert>
    </Box>
  );
};

export default BookManagement; 