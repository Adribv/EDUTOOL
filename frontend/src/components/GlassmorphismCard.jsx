import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, IconButton, Chip, Avatar, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const GlassmorphismCard = ({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  color = 'primary',
  value,
  trend,
  trendValue,
  delay = 0,
  onClick,
  elevation = 1,
  sx = {},
  showIcon = true,
  showTrend = false,
  showProgress = false,
  progressValue = 0,
  progressColor,
  size = 'medium',
  variant = 'default',
  ...props 
}) => {
  const theme = useTheme();
  
  // Color schemes for different variants
  const colorSchemes = {
    primary: {
      light: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(129, 140, 248, 0.05) 100%)',
      dark: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(129, 140, 248, 0.08) 100%)',
      border: 'rgba(99, 102, 241, 0.2)',
      iconBg: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
      text: '#6366f1'
    },
    secondary: {
      light: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
      dark: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.08) 100%)',
      border: 'rgba(245, 158, 11, 0.2)',
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      text: '#f59e0b'
    },
    success: {
      light: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.05) 100%)',
      dark: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.08) 100%)',
      border: 'rgba(16, 185, 129, 0.2)',
      iconBg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      text: '#10b981'
    },
    error: {
      light: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(248, 113, 113, 0.05) 100%)',
      dark: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(248, 113, 113, 0.08) 100%)',
      border: 'rgba(239, 68, 68, 0.2)',
      iconBg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      text: '#ef4444'
    },
    info: {
      light: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.05) 100%)',
      dark: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.08) 100%)',
      border: 'rgba(59, 130, 246, 0.2)',
      iconBg: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      text: '#3b82f6'
    },
    warning: {
      light: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
      dark: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 191, 36, 0.08) 100%)',
      border: 'rgba(245, 158, 11, 0.2)',
      iconBg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      text: '#f59e0b'
    }
  };

  const selectedScheme = colorSchemes[color] || colorSchemes.primary;
  const isDark = theme.palette.mode === 'dark';
  
  // Size configurations
  const sizeConfigs = {
    small: {
      padding: { xs: 2, sm: 2.5 },
      iconSize: 32,
      titleSize: '0.875rem',
      valueSize: '1.5rem',
      borderRadius: 2
    },
    medium: {
      padding: { xs: 2.5, sm: 3 },
      iconSize: 40,
      titleSize: '1rem',
      valueSize: '2rem',
      borderRadius: 3
    },
    large: {
      padding: { xs: 3, sm: 4 },
      iconSize: 48,
      titleSize: '1.125rem',
      valueSize: '2.5rem',
      borderRadius: 4
    }
  };

  const sizeConfig = sizeConfigs[size];

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30, 
      scale: 0.95,
      rotateX: -5
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      rotateX: 2,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Box
        sx={{
          position: 'relative',
          background: isDark ? selectedScheme.dark : selectedScheme.light,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${selectedScheme.border}`,
          borderRadius: sizeConfig.borderRadius,
          padding: sizeConfig.padding,
          boxShadow: isDark 
            ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)'
            : '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${selectedScheme.text}08 0%, ${selectedScheme.text}04 100%)`,
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none'
          },
          '&:hover::before': {
            opacity: 1
          },
          ...sx
        }}
        {...props}
      >
        {/* Icon */}
        {showIcon && Icon && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: sizeConfig.iconSize,
              height: sizeConfig.iconSize,
              borderRadius: '50%',
              background: selectedScheme.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${selectedScheme.text}40`,
              zIndex: 1
            }}
          >
            <Icon sx={{ 
              color: '#ffffff', 
              fontSize: sizeConfig.iconSize * 0.5 
            }} />
          </Box>
        )}

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          {title && (
            <Typography
              variant="body2"
              sx={{
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 65, 81, 0.7)',
                fontWeight: 500,
                fontSize: sizeConfig.titleSize,
                mb: value ? 1 : 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {title}
            </Typography>
          )}

          {value && (
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: selectedScheme.text,
                fontSize: sizeConfig.valueSize,
                mb: subtitle ? 0.5 : 0,
                lineHeight: 1.2
              }}
            >
              {value}
            </Typography>
          )}

          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 65, 81, 0.6)',
                fontSize: '0.875rem',
                mb: showTrend ? 1 : 0
              }}
            >
              {subtitle}
            </Typography>
          )}

          {/* Trend indicator */}
          {showTrend && trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label={trend}
                size="small"
                sx={{
                  background: trendValue > 0 
                    ? 'rgba(16, 185, 129, 0.2)' 
                    : 'rgba(239, 68, 68, 0.2)',
                  color: trendValue > 0 ? '#10b981' : '#ef4444',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
              {trendValue && (
                <Typography
                  variant="caption"
                  sx={{
                    color: trendValue > 0 ? '#10b981' : '#ef4444',
                    fontWeight: 600
                  }}
                >
                  {trendValue > 0 ? '+' : ''}{trendValue}%
                </Typography>
              )}
            </Box>
          )}

          {/* Progress bar */}
          {showProgress && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: progressColor || selectedScheme.iconBg,
                    borderRadius: 3
                  }
                }}
              />
            </Box>
          )}

          {/* Children content */}
          {children}
        </Box>

        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${selectedScheme.text}10 0%, transparent 70%)`,
            opacity: 0.3,
            zIndex: 0
          }}
        />
      </Box>
    </motion.div>
  );
};

export default GlassmorphismCard;
