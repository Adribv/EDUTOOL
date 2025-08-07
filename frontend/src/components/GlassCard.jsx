import React from 'react';
import { Card, CardContent, Box } from '@mui/material';
import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  sx = {}, 
  elevation = 1, 
  hover = true, 
  delay = 0,
  onClick,
  ...props 
}) => {
  const MotionCard = motion(Card);
  
  return (
    <MotionCard
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: delay * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={hover ? {
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      } : {}}
      sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1)`,
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          borderRadius: 3,
          zIndex: -1,
        },
        '&:hover::before': hover ? {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
        } : {},
        ...sx
      }}
      onClick={onClick}
      {...props}
    >
      <CardContent sx={{ p: 3 }}>
        {children}
      </CardContent>
    </MotionCard>
  );
};

export default GlassCard; 