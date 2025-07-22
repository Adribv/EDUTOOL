import { Box, Typography, Alert } from '@mui/material';

const CurriculumOversight = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Curriculum Oversight
      </Typography>
      <Alert severity="info">
        This feature is coming soon. You'll be able to manage curriculum here.
      </Alert>
    </Box>
  );
};

export default CurriculumOversight; 