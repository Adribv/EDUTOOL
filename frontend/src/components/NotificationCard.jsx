import React from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const NotificationCard = ({ 
  type = 'info',
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
  position = 'top-right',
  ...props 
}) => {
  const icons = {
    success: SuccessIcon,
    error: ErrorIcon,
    warning: WarningIcon,
    info: InfoIcon,
  };

  const colors = {
    success: {
      bg: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      text: '#ffffff',
      icon: '#ffffff',
    },
    error: {
      bg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      text: '#ffffff',
      icon: '#ffffff',
    },
    warning: {
      bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      text: '#ffffff',
      icon: '#ffffff',
    },
    info: {
      bg: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      text: '#ffffff',
      icon: '#ffffff',
    },
  };

  const positions = {
    'top-right': { top: 24, right: 24 },
    'top-left': { top: 24, left: 24 },
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left': { bottom: 24, left: 24 },
    'top-center': { top: 24, left: '50%', transform: 'translateX(-50%)' },
    'bottom-center': { bottom: 24, left: '50%', transform: 'translateX(-50%)' },
  };

  const selectedColor = colors[type] || colors.info;
  const selectedPosition = positions[position] || positions['top-right'];
  const Icon = icons[type] || icons.info;

  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, y: position.includes('top') ? -50 : 50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, y: position.includes('top') ? -50 : 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          position: 'fixed',
          zIndex: 10000,
          maxWidth: 400,
          width: '100%',
          ...selectedPosition,
        }}
      >
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            position: 'relative',
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
            ...props.sx
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: selectedColor.bg,
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                <Icon sx={{ color: selectedColor.icon, fontSize: 20 }} />
              </Box>
              
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                {title && (
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 0.5,
                      lineHeight: 1.2,
                    }}
                  >
                    {title}
                  </Typography>
                )}
                
                {message && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.4,
                    }}
                  >
                    {message}
                  </Typography>
                )}
              </Box>
              
              {onClose && (
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    p: 0.5,
                    '&:hover': {
                      color: 'text.primary',
                      background: 'rgba(0, 0, 0, 0.05)',
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationCard; 