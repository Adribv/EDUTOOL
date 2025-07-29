import React from 'react';
import { Box, Typography } from '@mui/material';
import TeacherRemarks from './TeacherRemarks';

const SyllabusCompletion = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Syllabus Completion
      </Typography>
      <TeacherRemarks />
    </Box>
  );
};

export default SyllabusCompletion; 