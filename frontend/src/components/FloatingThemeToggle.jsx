import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const FloatingThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  const MotionFab = motion(Fab);

  return (
    <Tooltip
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
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
      <MotionFab
        component={motion.button}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{
          scale: 1.1,
          rotate: 180,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        whileTap={{
          scale: 0.95,
          transition: { duration: 0.1 }
        }}
        onClick={toggleTheme}
        sx={{
          position: 'fixed !important',
          top: 24,
          right: 24,
          zIndex: 9999,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          color: '#1e293b',
          width: 56,
          height: 56,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            borderRadius: '50%',
            zIndex: -1,
          },
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
        }}
        size="medium"
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {isDark ? <Brightness7 /> : <Brightness4 />}
        </motion.div>
      </MotionFab>
    </Tooltip>
  );
};

export default FloatingThemeToggle; 