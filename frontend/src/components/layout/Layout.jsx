import { useState, useMemo, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItem,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Person,
  School,
  Assignment,
  CalendarToday,
  ExitToApp,
  Notifications,
  People,
  Settings,
  Assessment,
  Payment,
  Inventory,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';

const drawerWidth = 280;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [mobileOpen]);

  const handleProfileMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleProfileMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  }, [logout, navigate, handleProfileMenuClose]);

  const toggleDrawerCollapse = useCallback(() => {
    setDrawerCollapsed(!drawerCollapsed);
  }, [drawerCollapsed]);

  const getMenuItems = useMemo(() => {
    const commonItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '' },
      { text: 'Profile', icon: <Person />, path: 'profile' },
    ];

    const roleSpecificItems = {
      AdminStaff: [
        { text: 'Staff Management', icon: <People />, path: 'staff' },
        { text: 'Student Records', icon: <School />, path: 'students' },
        { text: 'Fee Configuration', icon: <Payment />, path: 'fees' },
        { text: 'Inventory', icon: <Inventory />, path: 'inventory' },
        { text: 'Events', icon: <CalendarToday />, path: 'events' },
        { text: 'Communications', icon: <Notifications />, path: 'communications' },
        { text: 'Classes', icon: <School />, path: 'classes' },
        { text: 'Subjects', icon: <Assignment />, path: 'subjects' },
        { text: 'Schedules', icon: <CalendarToday />, path: 'schedules' },
        { text: 'System Settings', icon: <Settings />, path: 'settings' },
        { text: 'User Management', icon: <People />, path: 'users' },
        { text: 'Reports', icon: <Assessment />, path: 'reports' },
      ],
      Teacher: [
        { text: 'Classes', icon: <School />, path: 'classes' },
        { text: 'Assignments', icon: <Assignment />, path: 'assignments' },
        { text: 'Calendar', icon: <CalendarToday />, path: 'calendar' },
      ],
      Student: [
        { text: 'Courses', icon: <School />, path: 'courses' },
        { text: 'Assignments', icon: <Assignment />, path: 'assignments' },
        { text: 'Calendar', icon: <CalendarToday />, path: 'calendar' },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[user?.role] || [])];
  }, [user?.role]);

  const handleNavigation = useCallback((path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [navigate, isMobile]);

  const isActiveRoute = useCallback((path) => {
    if (path === '') {
      return location.pathname.endsWith('/dashboard') || location.pathname.endsWith('/student') || location.pathname.endsWith('/admin') || location.pathname.endsWith('/teacher') || location.pathname.endsWith('/parent');
    }
    return location.pathname.includes(path);
  }, [location.pathname]);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 2,
        minHeight: 64
      }}>
        <Logo collapsed={drawerCollapsed} />
        {!isMobile && (
          <IconButton
            onClick={toggleDrawerCollapse}
            sx={{ color: 'white' }}
            size="small"
          >
            {drawerCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </Toolbar>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {getMenuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={isActiveRoute(item.path)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              minHeight: 48,
              '&.Mui-selected': {
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                },
                '& .MuiListItemIcon-root': {
                  color: '#3b82f6',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: 'inherit', 
              minWidth: drawerCollapsed ? 40 : 48,
              transition: 'color 0.2s ease-in-out'
            }}>
              {item.icon}
            </ListItemIcon>
            {!drawerCollapsed && (
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontSize: '0.875rem',
                    fontWeight: isActiveRoute(item.path) ? 600 : 500
                  } 
                }} 
              />
            )}
          </ListItemButton>
        ))}
      </List>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Box sx={{ p: 2 }}>
        <ListItem sx={{ px: 0 }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: 'primary.main',
              mr: drawerCollapsed ? 0 : 2
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          {!drawerCollapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {user?.role || 'Role'}
              </Typography>
            </Box>
          )}
        </ListItem>
      </Box>
    </Box>
  );

  const currentDrawerWidth = drawerCollapsed && !isMobile ? 80 : drawerWidth;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: `${currentDrawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid #e2e8f0',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              color: '#1e293b'
            }}
          >
            {user?.role ? `${user.role} Dashboard` : 'Dashboard'}
          </Typography>
          
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            sx={{ 
              ml: 1,
              border: '2px solid #e2e8f0',
              '&:hover': {
                borderColor: '#3b82f6',
              }
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ 
          width: { md: currentDrawerWidth }, 
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#0f172a',
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              bgcolor: '#0f172a',
              border: 'none',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: 64 }} />
        <Outlet />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleNavigation('profile')}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout; 