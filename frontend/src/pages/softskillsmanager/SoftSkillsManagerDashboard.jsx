import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { EmojiEvents as AchievementIcon } from '@mui/icons-material';

const SoftSkillsManagerDashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.grey[50] }}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AchievementIcon sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 2 }}>
            Soft Skills Manager Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This dashboard is under development. Soft skills and achievements tracking features will be available soon.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default SoftSkillsManagerDashboard; 