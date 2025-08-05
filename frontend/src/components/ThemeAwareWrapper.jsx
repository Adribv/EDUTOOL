import React from 'react';
import { Box } from '@mui/material';
import { useTheme as useAppTheme } from '../context/ThemeContext';

const ThemeAwareWrapper = ({ children, sx = {}, ...props }) => {
  const { isDark } = useAppTheme();

  return (
    <Box
      sx={{
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        color: isDark ? '#f1f5f9' : '#1e293b',
        minHeight: '100vh',
        transition: 'background-color 0.3s ease, color 0.3s ease',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ThemeAwareWrapper; 