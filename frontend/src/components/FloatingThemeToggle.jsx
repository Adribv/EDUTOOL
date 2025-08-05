import React from 'react';
import { Fab, Tooltip, Box } from '@mui/material';
import { 
  Brightness4 as DarkIcon, 
  Brightness7 as LightIcon,
  Settings as SystemIcon 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const FloatingThemeToggle = () => {
  const { themeMode, toggleTheme, isDark } = useTheme();

  const getIcon = () => {
    return isDark ? <DarkIcon /> : <LightIcon />;
  };

  const getTooltip = () => {
    return isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: 20, sm: 20 },
        right: { xs: 20, sm: 20 },
        zIndex: 9999,
        display: { xs: 'block', md: 'block' }, // Always visible
      }}
    >
              <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
          }}
        >
        <Tooltip title={getTooltip()} placement="left">
          <Fab
            onClick={toggleTheme}
            sx={{
              backgroundColor: isDark ? '#ffffff' : '#ffffff',
              color: isDark ? '#1e293b' : '#1e293b',
              boxShadow: isDark 
                ? '0 4px 20px rgba(255, 255, 255, 0.3)' 
                : '0 4px 20px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                backgroundColor: isDark ? '#f8fafc' : '#f1f5f9',
                color: isDark ? '#0f172a' : '#1e293b',
                boxShadow: isDark 
                  ? '0 6px 25px rgba(255, 255, 255, 0.4)' 
                  : '0 6px 25px rgba(0, 0, 0, 0.3)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
              width: 48,
              height: 48,
            }}
            size="medium"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {getIcon()}
            </motion.div>
          </Fab>
        </Tooltip>
      </motion.div>
    </Box>
  );
};

export default FloatingThemeToggle; 