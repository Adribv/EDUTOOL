import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { 
  Brightness4 as DarkIcon, 
  Brightness7 as LightIcon,
  Settings as SystemIcon 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ size = 'medium', sx = {} }) => {
  const { themeMode, toggleTheme, isDark } = useTheme();

  const getIcon = () => {
    return isDark ? <DarkIcon /> : <LightIcon />;
  };

  const getTooltip = () => {
    return isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  };

  return (
    <Tooltip title={getTooltip()} placement="bottom">
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: 'inherit',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          ...sx,
        }}
        size={size}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {getIcon()}
        </motion.div>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 