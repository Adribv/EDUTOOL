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
  Event,
  Message,
  SupervisorAccount,
  TrendingUp,
  Approval,
  Schedule,
  Book,
  Psychology,
  Security,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import { roleConfig } from '../../pages/admin/roleConfig';

const drawerWidth = 280;

// HOD-specific role configuration for sidebar
const hodRoleConfig = {
  'HOD': {
    sidebar: [
      'Teachers',
      'Students',
      'Courses',
      'Evaluations',
      'Reports',
      'Settings',
    ],
  },
  'Class Coordinator': {
    sidebar: [
      'Attendance',
      'Classes',
      'Students',
      'Reports',
    ],
  },
  'Examination Controller': {
    sidebar: [
      'Exams',
      'Results',
      'Reports',
      'Schedules',
    ],
  },
};

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
    // If user is admin type and has a designation in roleConfig, use that
    if (user?.role === 'AdminStaff' && roleConfig[user?.designation]) {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
        { text: 'Profile', icon: <Person />, path: '/admin/profile' },
        ...roleConfig[user.designation].sidebar.map((item) => {
          // Map sidebar item to path and icon
          const iconMap = {
            'Attendance': <Assignment />, 
            'Classes': <School />, 
            'Students': <People />, 
            'Reports': <Assessment />,
            'FeeConfiguration': <Payment />, 
            'Inventory_Management': <Inventory />, 
            'UserManagement': <People />,
            'A_Reports': <Assessment />, 
            'A_Events': <Event />, 
            'A_Communication': <Message />, 
            'A_Settings': <Settings />,
            'A_Users': <People />, 
            'A_Classes': <School />, 
            'A_Subjects': <Assignment />, 
            'A_Schedules': <CalendarToday />,
            'Exams': <Assignment />, 
            'Results': <Assessment />, 
            'SystemSettings': <Settings />,
            'Enquiries': <Message />,
            'Visitors': <GroupIcon />,
          };
          return {
            text: item.replace(/_/g, ' '),
            icon: iconMap[item] || <Assignment />,
            path: `/admin/${item}`,
          };
        })
      ].flat();
    }

    // For HOD users, return empty array to hide sidebar
    if (user?.role === 'HOD') {
      return [];
    }

    const getBasePath = () => {
      switch (user?.role) {
        case 'AdminStaff':
          return '/admin';
        case 'Teacher':
          return '/teacher';
        case 'Student':
          return '/student';
        case 'Parent':
          return '/parent';
        case 'HOD':
          return '/hod';
        case 'Principal':
          return '/principal';
        case 'Counsellor':
          return '/counselor';
        default:
          return '';
      }
    };

    const basePath = getBasePath();
    
    const commonItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: `${basePath}/dashboard` },
      { text: 'Profile', icon: <Person />, path: `${basePath}/profile` },
    ];

    const roleSpecificItems = {
      AdminStaff: [
        { text: 'Staff Management', icon: <People />, path: '/admin/staff' },
        { text: 'Student Records', icon: <School />, path: '/admin/students' },
        { text: 'Fee Configuration', icon: <Payment />, path: '/admin/fees' },
        { text: 'Inventory', icon: <Inventory />, path: '/admin/inventory' },
        { text: 'Events', icon: <CalendarToday />, path: '/admin/events' },
        { text: 'Communications', icon: <Notifications />, path: '/admin/communications' },
        { text: 'Classes', icon: <School />, path: '/admin/classes' },
        { text: 'Subjects', icon: <Assignment />, path: '/admin/subjects' },
        { text: 'Schedules', icon: <CalendarToday />, path: '/admin/schedules' },
        { text: 'System Settings', icon: <Settings />, path: '/admin/settings' },
        { text: 'User Management', icon: <People />, path: '/admin/users' },
        { text: 'Reports', icon: <Assessment />, path: '/admin/reports' },
        { text: 'Enquiries', icon: <Message />, path: '/admin/Enquiries' },
        { text: 'Visitors', icon: <GroupIcon />, path: '/admin/Visitors' },
      ],
      ITAdmin: [
        { text: 'IT Admin Dashboard', icon: <Dashboard />, path: '/itadmin/dashboard' },
        { text: 'Profile', icon: <Person />, path: '/itadmin/profile' },
        { text: 'User Management', icon: <People />, path: '/itadmin/users' },
        { text: 'Reports', icon: <Assessment />, path: '/itadmin/reports' },
        { text: 'System Settings', icon: <Settings />, path: '/itadmin/settings' },
      ],
      Teacher: [
        { text: 'Classes', icon: <School />, path: '/teacher/classes' },
        { text: 'Assignments', icon: <Assignment />, path: '/teacher/assignments' },
        { text: 'Calendar', icon: <CalendarToday />, path: '/teacher/calendar' },
      ],
      Student: [
        { text: 'Courses', icon: <School />, path: '/student/courses' },
        { text: 'Assignments', icon: <Assignment />, path: '/student/assignments' },
        { text: 'Calendar', icon: <CalendarToday />, path: '/student/calendar' },
      ],
      Principal: [
        { text: 'Staff Management', icon: <People />, path: '/principal/staff' },
        { text: 'Student Management', icon: <School />, path: '/principal/students' },
        { text: 'School Management', icon: <Settings />, path: '/principal/school' },
        { text: 'Academic Management', icon: <Book />, path: '/principal/academic' },
        { text: 'Approvals', icon: <Approval />, path: '/principal/approvals' },
        { text: 'Reports', icon: <Assessment />, path: '/principal/reports' },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[user?.role] || [])];
  }, [user?.role, user?.designation]);

  const handleNavigation = useCallback((path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [navigate, isMobile]);

  const handleProfileClick = useCallback(() => {
    // Navigate to appropriate profile page based on user role
    let profilePath = '/profile';
    if (user?.role === 'AdminStaff') profilePath = '/admin/profile';
    else if (user?.role === 'HOD') profilePath = '/hod/profile';
    else if (user?.role === 'Teacher') profilePath = '/teacher/profile';
    else if (user?.role === 'Student') profilePath = '/student/profile';
    else if (user?.role === 'Parent') profilePath = '/parent/profile';
    else if (user?.role === 'Principal') profilePath = '/principal/profile';
    else if (user?.role === 'Counsellor') profilePath = '/counselor/profile';
    handleNavigation(profilePath);
    handleProfileMenuClose();
  }, [user?.role, handleNavigation, handleProfileMenuClose]);

  const isActiveRoute = useCallback((path) => {
    if (path.endsWith('/dashboard')) {
      return location.pathname === path || location.pathname.endsWith('/dashboard');
    }
    return location.pathname === path || location.pathname.startsWith(path);
  }, [location.pathname]);

  // Check if user is HOD to determine layout
  const isHOD = user?.role === 'HOD';
  const currentDrawerWidth = isHOD ? 0 : (drawerCollapsed && !isMobile ? 80 : drawerWidth);

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
                backgroundColor: 'rgba(59, 130, 246, 0.25)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.3)',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
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
                    fontWeight: isActiveRoute(item.path) ? 600 : 500,
                    color: 'white'
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

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: isHOD ? '100%' : `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: isHOD ? 0 : `${currentDrawerWidth}px` },
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
            sx={{ mr: 2, display: { md: isHOD ? 'none' : 'block' } }}
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
            {user?.role === 'AdminStaff' && user?.designation 
              ? `${user.designation} Dashboard` 
              : user?.role === 'HOD' && user?.designation
              ? `${user.designation} Dashboard`
              : user?.role ? `${user.role} Dashboard` : 'Dashboard'}
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

      {/* Only show navigation drawer if not HOD */}
      {!isHOD && (
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
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: isHOD ? '100%' : `calc(100% - ${currentDrawerWidth}px)` },
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
        <MenuItem onClick={handleProfileClick}>
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