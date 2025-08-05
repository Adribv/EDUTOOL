import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { motion } from 'framer-motion';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'primary',
  trend,
  trendValue,
  delay = 0,
  onClick,
  ...props 
}) => {
  const colors = {
    primary: { bg: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', text: '#ffffff' },
    secondary: { bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', text: '#ffffff' },
    success: { bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', text: '#ffffff' },
    error: { bg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', text: '#ffffff' },
    info: { bg: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', text: '#ffffff' },
    warning: { bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', text: '#ffffff' },
  };

  const selectedColor = colors[color] || colors.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: delay * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 3,
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: selectedColor.bg,
            opacity: 0.1,
            zIndex: -1,
          },
          '&:hover::before': {
            opacity: 0.15,
          },
          ...props.sx
        }}
        onClick={onClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              background: selectedColor.bg,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Icon sx={{ color: selectedColor.text, fontSize: 24 }} />
          </Box>
          
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: trend === 'up' ? 'success.main' : 'error.main',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {trend === 'up' ? '↗' : '↘'} {trendValue}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 0.5,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          }}
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            mb: 1,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              fontWeight: 500,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </motion.div>
  );
};

export default StatCard; 