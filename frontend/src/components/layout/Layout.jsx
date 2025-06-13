import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
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
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
<<<<<<< HEAD
          EduRays
=======
          Edurays
>>>>>>> 10a1793c8ac3c10e93e291f27899918c29245901
        </Typography>
      </Toolbar>
      <List>
        {getMenuItems().map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.role ? `${user.role} Dashboard` : 'Dashboard'}
          </Typography>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            sx={{ ml: 2 }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => navigate('profile')}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
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
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 