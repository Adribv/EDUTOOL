import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  School,
  Person,
  Assignment,
  Assessment,
  Payment,
  Settings,
  Notifications,
  Logout,
  ChevronLeft,
  Home,
  Book,
  Event,
  Message,
  CalendarToday,
  TrendingUp,
  Group,
  AdminPanelSettings,
  LibraryBooks,
  Psychology,
  SportsSoccer,
  DirectionsBus,
  EmojiEvents,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const ModernNavigation = ({ userType = 'student', user = {} }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [selectedItem, setSelectedItem] = useState(location.pathname);

  const getColorByType = (type) => {
    const colors = {
      student: '#2563eb', // primary blue
      parent: '#10b981', // success green
      staff: '#f59e0b', // warning orange
      accountant: '#7c3aed' // secondary purple
    };
    return colors[type] || '#2563eb';
  };

  const getNavigationItems = (type) => {
    const baseItems = [
      { text: 'Dashboard', icon: Dashboard, path: '/dashboard' },
      { text: 'Profile', icon: Person, path: '/profile' },
      { text: 'Notifications', icon: Notifications, path: '/notifications' },
      { text: 'Settings', icon: Settings, path: '/settings' }
    ];

    const typeSpecificItems = {
      student: [
        { text: 'My Courses', icon: School, path: '/student/courses' },
        { text: 'Assignments', icon: Assignment, path: '/student/assignments' },
        { text: 'Grades', icon: Assessment, path: '/student/grades' },
        { text: 'Attendance', icon: CheckCircle, path: '/student/attendance' },
        { text: 'Library', icon: LibraryBooks, path: '/student/library' },
        { text: 'Events', icon: Event, path: '/student/events' },
        { text: 'Messages', icon: Message, path: '/student/messages' },
        { text: 'Calendar', icon: CalendarToday, path: '/student/calendar' }
      ],
      parent: [
        { text: 'My Children', icon: Group, path: '/parent/children' },
        { text: 'Academic Progress', icon: TrendingUp, path: '/parent/progress' },
        { text: 'Attendance', icon: CheckCircle, path: '/parent/attendance' },
        { text: 'Fees', icon: Payment, path: '/parent/fees' },
        { text: 'Events', icon: Event, path: '/parent/events' },
        { text: 'Messages', icon: Message, path: '/parent/messages' },
        { text: 'Calendar', icon: CalendarToday, path: '/parent/calendar' }
      ],
      staff: [
        { text: 'My Classes', icon: School, path: '/teacher/classes' },
        { text: 'Assignments', icon: Assignment, path: '/teacher/assignments' },
        { text: 'Grades', icon: Assessment, path: '/teacher/grades' },
        { text: 'Attendance', icon: CheckCircle, path: '/teacher/attendance' },
        { text: 'Students', icon: Group, path: '/teacher/students' },
        { text: 'Events', icon: Event, path: '/teacher/events' },
        { text: 'Messages', icon: Message, path: '/teacher/messages' },
        { text: 'Calendar', icon: CalendarToday, path: '/teacher/calendar' }
      ],
      accountant: [
        { text: 'Fee Management', icon: Payment, path: '/accountant/fees' },
        { text: 'Financial Reports', icon: TrendingUp, path: '/accountant/reports' },
        { text: 'Payments', icon: Payment, path: '/accountant/payments' },
        { text: 'Students', icon: Group, path: '/accountant/students' },
        { text: 'Settings', icon: Settings, path: '/accountant/settings' }
      ]
    };

    return [...baseItems, ...(typeSpecificItems[type] || [])];
  };

  const navigationItems = getNavigationItems(userType);

  const handleNavigation = (path) => {
    setSelectedItem(path);
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: `1px solid ${getColorByType(userType)}20`,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${getColorByType(userType)}20 0%, ${getColorByType(userType)}10 100%)`,
          borderBottom: `1px solid ${getColorByType(userType)}20`
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar
              sx={{
                width: 50,
                height: 50,
                bgcolor: getColorByType(userType),
                fontSize: '1.5rem',
                boxShadow: `0 4px 16px ${getColorByType(userType)}40`
              }}
            >
              {user.name?.charAt(0) || userType.charAt(0).toUpperCase()}
            </Avatar>
          </motion.div>
          {!isMobile && (
            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
              }}
            >
              <ChevronLeft />
            </IconButton>
          )}
        </Box>
        <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
          {user.name || 'User'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {userType.charAt(0).toUpperCase() + userType.slice(1)}
        </Typography>
        <Chip
          label={user.status || 'Active'}
          color="success"
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        <List>
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={selectedItem === item.path}
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&.Mui-selected': {
                      bgcolor: `${getColorByType(userType)}20`,
                      color: getColorByType(userType),
                      '&:hover': {
                        bgcolor: `${getColorByType(userType)}30`
                      }
                    },
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: selectedItem === item.path ? getColorByType(userType) : 'inherit',
                      minWidth: 40
                    }}
                  >
                    {item.text === 'Notifications' ? (
                      <Badge badgeContent={user.notifications || 3} color="error">
                        <item.icon />
                      </Badge>
                    ) : (
                      <item.icon />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: selectedItem === item.path ? 600 : 400
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${getColorByType(userType)}20` }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              // Handle logout
              navigate('/logout');
            }}
            sx={{
              borderRadius: 2,
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'white'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1200 }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IconButton
              onClick={() => setOpen(true)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </motion.div>
        </Box>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="persistent"
          anchor="left"
          open={open}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              border: 'none',
              boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{
          keepMounted: true // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content Margin for Desktop */}
      {!isMobile && open && (
        <Box sx={{ width: 280, flexShrink: 0 }} />
      )}
    </>
  );
};

export default ModernNavigation;
