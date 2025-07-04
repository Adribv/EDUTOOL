import React from 'react';
import { Box, Typography } from '@mui/material';
import logo from '../../assets/logo.jpg';

const Logo = ({ collapsed }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <img src={logo} alt="EDURAYS Logo" style={{ height: 40, width: 'auto' }} />
      {!collapsed && (
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: 700,
            color: 'secondary.main',
          }}
        >
          EDURAYS
        </Typography>
      )}
    </Box>
  );
};

export default Logo; 