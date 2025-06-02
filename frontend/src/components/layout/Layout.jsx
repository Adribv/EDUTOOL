import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const studentMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/student' },
  { text: 'Profile', icon: <Person />, path: '/student/profile' },
  { text: 'Assignments', icon: <Assignment />, path: '/student/assignments' },
  { text: 'Attendance', icon: <Event />, path: '/student/attendance' },
  { text: 'Exams', icon: <School />, path: '/student/exams' },
  { text: 'Fees', icon: <Payment />, path: '/student/fees' },
  { text: 'Resources', icon: <Book />, path: '/student/resources' },
  { text: 'Messages', icon: <Message />, path: '/student/messages' },
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
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          EduTool
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
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
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <IconButton
            onClick={handleProfileMenuOpen}
            size="large"
            edge="end"
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.name?.charAt(0)}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
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
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout; 