import React from 'react';
import { Box, Typography } from '@mui/material';
import logo from '../../assets/logo.png';

const Logo = ({ collapsed }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      justifyContent: collapsed ? 'center' : 'flex-start',
      width: '100%'
    }}>
      <img 
        src={logo} 
        alt="EDULIVES Logo" 
        style={{ 
          height: 120, 
          width: 'auto',
          objectFit: 'contain'
        }} 
      />
      {!collapsed && (
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: 700,
            color: 'secondary.main',
            fontSize: '1.25rem',
            letterSpacing: '0.5px'
          }}
        >
          EDULIVES
        </Typography>
      )}
    </Box>
  );
};

export default Logo; 