import { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Divider,
  Chip,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Assignment,
  School,
  Event,
  Person,
  DirectionsBus,
  Schedule,
  Grade,
  LibraryBooks,
  Forum,
  Payment,
  DocumentScanner,
  VideoLibrary,
  CalendarToday,
  Settings,
  Notifications,
  Logout,
  Book,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const StudentLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/student/dashboard',
    },
    {
      text: 'Assignments',
      icon: <Assignment />,
      path: '/student/assignments',
    },
    {
      text: 'Homework',
      icon: <Book />,
      path: '/student/homework',
    },
    {
      text: 'Exam Results',
      icon: <Grade />,
      path: '/student/exam-results',
    },
    {
      text: 'School Timetable',
      icon: <Schedule />,
      path: '/student/timetable',
    },
    {
      text: 'Attendance',
      icon: <Event />,
      path: '/student/attendance',
    },
    {
      text: 'Leave Request',
      icon: <Event />,
      path: '/student/leave-requests',
    },
    {
      text: 'Study Materials',
      icon: <LibraryBooks />,
      path: '/student/study-materials',
    },
    {
      text: 'Communication',
      icon: <Forum />,
      path: '/student/communication',
    },
    {
      text: 'Fee Management',
      icon: <Payment />,
      path: '/student/fees',
    },
    {
      text: 'Documents',
      icon: <DocumentScanner />,
      path: '/student/documents',
    },
    {
      text: 'Calendar',
      icon: <CalendarToday />,
      path: '/student/calendar',
    },
    {
      text: 'Profile Settings',
      icon: <Settings />,
      path: '/student/profile',
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#334155' }}>
          <School sx={{ fontSize: 48, color: '#fff' }} />
        </Avatar>
        <Typography variant="h6" gutterBottom sx={{ color: '#fff', fontWeight: 700, letterSpacing: 1 }}>
          Student Portal
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Student
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1 }} />
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              minHeight: 48,
              color: '#fff',
              '& .MuiListItemIcon-root': {
                color: '#fff',
                minWidth: 40,
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(59,130,246,0.15)',
                color: '#fff',
                '& .MuiListItemIcon-root': {
                  color: '#fff',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} sx={{ '& .MuiTypography-root': { fontSize: '1rem', fontWeight: 500, color: '#fff' } }} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mt: 1, mb: 1 }} />
      <List>
        <ListItemButton onClick={() => handleNavigation('/student/notifications')} sx={{ color: '#fff', '& .MuiListItemIcon-root': { color: '#fff' } }}>
          <ListItemIcon>
            <Notifications />
          </ListItemIcon>
          <ListItemText primary="Notifications" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/logout')} sx={{ color: '#fff', '& .MuiListItemIcon-root': { color: '#fff' } }}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
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
          <Typography variant="h6" noWrap component="div">
            {menuItems.find(item => item.path === location.pathname)?.text || 'Student Portal'}
          </Typography>
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
              backgroundColor: '#0f172a',
              color: '#fff',
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
              backgroundColor: '#0f172a',
              color: '#fff',
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
          mt: 8,
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default StudentLayout; 