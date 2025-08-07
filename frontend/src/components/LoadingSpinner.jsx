import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'medium',
  color = 'primary',
  fullScreen = false,
  ...props 
}) => {
  const sizes = {
    small: 24,
    medium: 40,
    large: 60,
  };

  const colors = {
    primary: '#6366f1',
    secondary: '#f59e0b',
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
  };

  const selectedSize = sizes[size] || sizes.medium;
  const selectedColor = colors[color] || colors.primary;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const spinnerVariants = {
    hidden: { rotate: 0 },
    visible: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    hidden: { opacity: 0.5, scale: 0.8 },
    visible: {
      opacity: [0.5, 1, 0.5],
      scale: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const content = (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 3,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${selectedColor}10 0%, ${selectedColor}05 100%)`,
            borderRadius: 3,
            zIndex: -1,
          },
          ...props.sx
        }}
      >
        <motion.div
          variants={spinnerVariants}
          initial="hidden"
          animate="visible"
        >
          <CircularProgress
            size={selectedSize}
            sx={{
              color: selectedColor,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
        </motion.div>
        
        {message && (
          <motion.div
            variants={pulseVariants}
            initial="hidden"
            animate="visible"
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                textAlign: 'center',
                maxWidth: 200,
              }}
            >
              {message}
            </Typography>
          </motion.div>
        )}
      </Box>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner; 