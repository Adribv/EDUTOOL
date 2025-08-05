import React from 'react';
import { Fab, Tooltip, Box } from '@mui/material';
import { motion } from 'framer-motion';

const FloatingActionButton = ({ 
  icon, 
  onClick, 
  tooltip = '', 
  color = 'primary',
  size = 'large',
  position = 'bottom-right',
  delay = 0,
  pulse = false,
  ...props 
}) => {
  const colors = {
    primary: {
      bg: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
      hover: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
      shadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
      hoverShadow: '0 15px 35px rgba(99, 102, 241, 0.4)',
    },
    secondary: {
      bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      hover: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      shadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
      hoverShadow: '0 15px 35px rgba(245, 158, 11, 0.4)',
    },
    success: {
      bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      hover: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      shadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
      hoverShadow: '0 15px 35px rgba(16, 185, 129, 0.4)',
    },
    error: {
      bg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      hover: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      shadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
      hoverShadow: '0 15px 35px rgba(239, 68, 68, 0.4)',
    },
    info: {
      bg: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      hover: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      shadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
      hoverShadow: '0 15px 35px rgba(59, 130, 246, 0.4)',
    },
  };

  const positions = {
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left': { bottom: 24, left: 24 },
    'top-right': { top: 24, right: 24 },
    'top-left': { top: 24, left: 24 },
    'center-right': { top: '50%', right: 24, transform: 'translateY(-50%)' },
    'center-left': { top: '50%', left: 24, transform: 'translateY(-50%)' },
  };

  const selectedColor = colors[color] || colors.primary;
  const selectedPosition = positions[position] || positions['bottom-right'];

  const MotionFab = motion(Fab);

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 1000,
        ...selectedPosition,
      }}
    >
      <MotionFab
        component={motion.button}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.4, 
          delay: delay * 0.1,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        whileHover={{
          scale: 1.1,
          transition: { duration: 0.2, ease: "easeOut" }
        }}
        whileTap={{
          scale: 0.95,
          transition: { duration: 0.1 }
        }}
        size={size}
        onClick={onClick}
        sx={{
          background: selectedColor.bg,
          boxShadow: selectedColor.shadow,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            zIndex: -1,
          },
          '&:hover': {
            background: selectedColor.hover,
            boxShadow: selectedColor.hoverShadow,
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
          ...(pulse && {
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }),
          ...props.sx
        }}
        {...props}
      >
        {icon}
      </MotionFab>
      
      {tooltip && (
        <Tooltip
          title={tooltip}
          placement="left"
          arrow
          sx={{
            '& .MuiTooltip-tooltip': {
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              fontSize: '0.875rem',
              padding: '8px 12px',
            },
            '& .MuiTooltip-arrow': {
              color: 'rgba(0, 0, 0, 0.8)',
            },
          }}
        >
          <Box />
        </Tooltip>
      )}
    </Box>
  );
};

export default FloatingActionButton; 