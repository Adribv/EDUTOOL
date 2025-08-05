import React from 'react';
import { Button, Box } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedButton = ({ 
  children, 
  variant = 'contained', 
  color = 'primary',
  size = 'medium',
  startIcon,
  endIcon,
  gradient = false,
  glow = false,
  sx = {},
  delay = 0,
  ...props 
}) => {
  const MotionButton = motion(Button);
  
  const getGradientStyle = () => {
    if (!gradient) return {};
    
    const gradients = {
      primary: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%)',
      secondary: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)',
      info: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
    };
    
    return {
      background: gradients[color] || gradients.primary,
      '&:hover': {
        background: gradients[color] || gradients.primary,
        filter: 'brightness(1.1)',
      }
    };
  };

  const getGlowStyle = () => {
    if (!glow) return {};
    
    const glows = {
      primary: '0 0 20px rgba(99, 102, 241, 0.4)',
      secondary: '0 0 20px rgba(245, 158, 11, 0.4)',
      success: '0 0 20px rgba(16, 185, 129, 0.4)',
      error: '0 0 20px rgba(239, 68, 68, 0.4)',
      info: '0 0 20px rgba(59, 130, 246, 0.4)',
    };
    
    return {
      boxShadow: glows[color] || glows.primary,
      '&:hover': {
        boxShadow: glows[color] || glows.primary,
        filter: 'brightness(1.1)',
      }
    };
  };

  return (
    <MotionButton
      component={motion.button}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: delay * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      variant={variant}
      color={color}
      size={size}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        borderRadius: 2,
        fontWeight: 600,
        textTransform: 'none',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          transition: 'left 0.5s',
        },
        '&:hover::before': {
          left: '100%',
        },
        ...getGradientStyle(),
        ...getGlowStyle(),
        ...sx
      }}
      {...props}
    >
      {children}
    </MotionButton>
  );
};

export default AnimatedButton; 