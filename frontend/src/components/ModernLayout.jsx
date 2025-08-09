import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  useTheme,
  useMediaQuery,
  Fab,
  Tooltip,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  KeyboardArrowUp,
  Notifications,
  Settings,
  Person,
  Logout,
  Brightness4,
  Brightness7
} from '@mui/icons-material';
import ModernNavigation from './ModernNavigation';
import ModernDashboard from './ModernDashboard';
import { useAuth } from '../context/AuthContext';

const ModernLayout = ({ children, userType = 'student' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // You can integrate this with your theme context
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navigation */}
      <ModernNavigation userType={userType} user={user} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Decorations */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        >
          {/* Floating Elements */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, transparent 100%)`,
              opacity: 0.3
            }}
          />
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              bottom: '20%',
              left: '5%',
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.secondary.main}10 0%, transparent 100%)`,
              opacity: 0.2
            }}
          />
        </Box>

        {/* Content */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            minHeight: '100vh',
            pt: isMobile ? 8 : 0
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {children || <ModernDashboard userType={userType} data={user} />}
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Floating Action Buttons */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            zIndex: 1000
          }}
        >
          {/* Theme Toggle */}
          <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Fab
                size="medium"
                onClick={toggleDarkMode}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)'
                  }
                }}
              >
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </Fab>
            </motion.div>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Fab
                size="medium"
                onClick={() => {/* Handle notifications */}}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)'
                  }
                }}
              >
                <Badge badgeContent={user?.notifications || 3} color="error">
                  <Notifications />
                </Badge>
              </Fab>
            </motion.div>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="User Menu">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Fab
                size="medium"
                onClick={handleMenuOpen}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: '0.875rem'
                  }}
                >
                  {user?.name?.charAt(0) || userType.charAt(0).toUpperCase()}
                </Avatar>
              </Fab>
            </motion.div>
          </Tooltip>

          {/* Scroll to Top */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Tooltip title="Scroll to Top">
                  <Fab
                    size="medium"
                    onClick={handleScrollToTop}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)'
                      }
                    }}
                  >
                    <KeyboardArrowUp />
                  </Fab>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              minWidth: 200
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default ModernLayout;
