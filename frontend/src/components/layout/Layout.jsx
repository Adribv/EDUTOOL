import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  School,
  Assignment,
  Event,
  Payment,
  Book,
  Message,
  Person,
  ExitToApp,
  Class,
  People,
  Assessment,
  Group,
  Timeline,
  Notifications,
  DirectionsBus,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const studentMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/student' },
  { text: 'My Courses', icon: <School />, path: '/student/courses' },
  { text: 'My Timetable', icon: <Event />, path: '/student/timetable' },
  { text: 'Results', icon: <Assessment />, path: '/student/results' },
  { text: 'Notifications', icon: <Notifications />, path: '/student/notifications' },
  { text: 'Calenders', icon: <Event />, path: '/student/calendar' },
  { text: 'Transport', icon: <DirectionsBus />, path: '/student/transport' },
  { text: 'Study Materials', icon: <Book />, path: '/student/materials' },
  { text: 'Profile Settings', icon: <Settings />, path: '/student/settings' },
];

const staffMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/staff' },
  { text: 'Profile', icon: <Person />, path: '/staff/profile' },
  { text: 'Classes', icon: <Class />, path: '/staff/classes' },
  { text: 'Assignments', icon: <Assignment />, path: '/staff/assignments' },
  { text: 'Exams', icon: <School />, path: '/staff/exams' },
  { text: 'Students', icon: <People />, path: '/staff/students' },
];

const adminMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { text: 'Profile', icon: <Person />, path: '/admin/profile' },
  { text: 'Staff Management', icon: <People />, path: '/admin/staff' },
  { text: 'Student Records', icon: <School />, path: '/admin/students' },
  { text: 'Fee Configuration', icon: <Payment />, path: '/admin/fees' },
  { text: 'System Settings', icon: <Assessment />, path: '/admin/settings' },
  { text: 'User Management', icon: <Group />, path: '/admin/users' },
  { text: 'Reports', icon: <Timeline />, path: '/admin/reports' },
];

const parentMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/parent' },
  { text: 'Profile', icon: <Person />, path: '/parent/profile' },
  { text: 'Child Progress', icon: <Timeline />, path: '/parent/progress' },
  { text: 'Fees', icon: <Payment />, path: '/parent/fees' },
  { text: 'Communication', icon: <Message />, path: '/parent/communication' },
];

function Layout({ role }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = {
    student: studentMenuItems,
    staff: staffMenuItems,
    parent: parentMenuItems,
    admin: adminMenuItems,
  }[role] || [];

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
    handleProfileMenuClose();
    logout();
  };

  const drawer = (
    <Box sx={{ 
      bgcolor: '#0A1929', 
      color: 'white',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Toolbar sx={{ 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2
      }}>
        <img src={logo} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
        <Typography variant="h5" component="div" sx={{ 
          color: 'white',
          fontWeight: 'bold',
          letterSpacing: 1
        }}>
          EDURAYS
        </Typography>
      </Toolbar>
      <List sx={{ flex: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                },
              },
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                '& .MuiTypography-root': { 
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                } 
              }} 
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#F5F5F5', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0'
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
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            sx={{ ml: 2 }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
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
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#0A1929',
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#0A1929',
              border: 'none',
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
          mt: '64px',
          bgcolor: '#F5F5F5',
        }}
      >
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
            minWidth: 180,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate(`/${role}/profile`)}>
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
}

export default Layout; 