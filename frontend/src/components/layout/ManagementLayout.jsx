import { useState, useMemo, useCallback, useEffect } from 'react';
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
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
  Collapse,
  ListSubheader,
  Chip,
  Alert,
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
  Warning,
  ExpandLess,
  ExpandMore,
  LocalLibrary,
  Support,
  Computer,
  BusinessCenter,
  DirectionsBus,
  Class,
  Subject,
  AccountBalance,
  Analytics,
  AdminPanelSettings,
  SupportAgent,
  HealthAndSafety,
  AccountBox,
  Campaign,
  Print,
  Gavel,
  Report,
} from '@mui/icons-material';
import { api } from '../../services/api';
import { toast } from 'react-toastify';

const drawerWidth = 280;

// Define navigation items based on modules and permissions
const getNavigationItems = (permissions, userRole) => {
  if (!permissions || !permissions.permissions) return [];

  const items = [];

  // Dashboard - Always available
  items.push({
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    module: 'dashboard',
    requiredAccess: 'View Access'
  });

  // Academic Management
  const academicItems = [];
  
  if (permissions.permissions.students !== 'No Access') {
    academicItems.push({
      text: 'Students',
      icon: <School />,
      path: '/students',
      module: 'students'
    });
  }
  
  if (permissions.permissions.teachers !== 'No Access') {
    academicItems.push({
      text: 'Teachers',
      icon: <Person />,
      path: '/teachers',
      module: 'teachers'
    });
  }
  
  if (permissions.permissions.classes !== 'No Access') {
    academicItems.push({
      text: 'Classes',
      icon: <Class />,
      path: '/classes',
      module: 'classes'
    });
  }
  
  if (permissions.permissions.subjects !== 'No Access') {
    academicItems.push({
      text: 'Subjects',
      icon: <Subject />,
      path: '/subjects',
      module: 'subjects'
    });
  }
  
  if (permissions.permissions.timetable !== 'No Access') {
    academicItems.push({
      text: 'Timetable',
      icon: <Schedule />,
      path: '/timetable',
      module: 'timetable'
    });
  }
  
  if (permissions.permissions.attendance !== 'No Access') {
    academicItems.push({
      text: 'Attendance',
      icon: <CalendarToday />,
      path: '/attendance',
      module: 'attendance'
    });
  }
  
  if (permissions.permissions.assignments !== 'No Access') {
    academicItems.push({
      text: 'Assignments',
      icon: <Assignment />,
      path: '/assignments',
      module: 'assignments'
    });
  }
  
  if (permissions.permissions.exams !== 'No Access') {
    academicItems.push({
      text: 'Examinations',
      icon: <Assessment />,
      path: '/exams',
      module: 'exams'
    });
  }

  if (academicItems.length > 0) {
    items.push({
      text: 'Academic Management',
      icon: <School />,
      children: academicItems,
      category: true
    });
  }

  // Financial Management
  const financialItems = [];
  
  if (permissions.permissions.fees !== 'No Access') {
    financialItems.push({
      text: 'Fee Management',
      icon: <Payment />,
      path: '/fees',
      module: 'fees'
    });
  }
  
  if (permissions.permissions.payments !== 'No Access') {
    financialItems.push({
      text: 'Payments',
      icon: <AccountBalance />,
      path: '/payments',
      module: 'payments'
    });
  }
  
  if (permissions.permissions.salaries !== 'No Access') {
    financialItems.push({
      text: 'Salaries',
      icon: <AccountBox />,
      path: '/salaries',
      module: 'salaries'
    });
  }
  
  if (permissions.permissions.expenses !== 'No Access') {
    financialItems.push({
      text: 'Expenses',
      icon: <BusinessCenter />,
      path: '/expenses',
      module: 'expenses'
    });
  }

  if (financialItems.length > 0) {
    items.push({
      text: 'Financial Management',
      icon: <Payment />,
      children: financialItems,
      category: true
    });
  }

  // Administrative
  const adminItems = [];
  
  if (permissions.permissions.staff !== 'No Access') {
    adminItems.push({
      text: 'Staff Management',
      icon: <People />,
      path: '/staff',
      module: 'staff'
    });
  }
  
  if (permissions.permissions.parents !== 'No Access') {
    adminItems.push({
      text: 'Parents',
      icon: <GroupIcon />,
      path: '/parents',
      module: 'parents'
    });
  }
  
  if (permissions.permissions.communications !== 'No Access') {
    adminItems.push({
      text: 'Communications',
      icon: <Message />,
      path: '/communications',
      module: 'communications'
    });
  }
  
  if (permissions.permissions.events !== 'No Access') {
    adminItems.push({
      text: 'Events',
      icon: <Event />,
      path: '/events',
      module: 'events'
    });
  }
  
  if (permissions.permissions.transport !== 'No Access') {
    adminItems.push({
      text: 'Transport',
      icon: <DirectionsBus />,
      path: '/transport',
      module: 'transport'
    });
  }
  
  if (permissions.permissions.disciplinary !== 'No Access') {
    adminItems.push({
      text: 'Disciplinary',
      icon: <Gavel />,
      path: '/disciplinary-forms',
      module: 'disciplinary'
    });
  }

  if (adminItems.length > 0) {
    items.push({
      text: 'Administrative',
      icon: <SupervisorAccount />,
      children: adminItems,
      category: true
    });
  }

  // Specialized Modules
  const specializedItems = [];
  
  if (permissions.permissions.library !== 'No Access') {
    specializedItems.push({
      text: 'Library',
      icon: <LocalLibrary />,
      path: '/library',
      module: 'library'
    });
  }
  
  if (permissions.permissions.wellness !== 'No Access') {
    specializedItems.push({
      text: 'Wellness',
      icon: <HealthAndSafety />,
      path: '/wellness',
      module: 'wellness'
    });
  }
  
  if (permissions.permissions.counselling !== 'No Access') {
    specializedItems.push({
      text: 'Counselling',
      icon: <Psychology />,
      path: '/counselling',
      module: 'counselling'
    });
  }
  
  if (permissions.permissions.itSupport !== 'No Access') {
    specializedItems.push({
      text: 'IT Support',
      icon: <Computer />,
      path: '/it-support',
      module: 'itSupport'
    });
  }
  
  if (permissions.permissions.inventory !== 'No Access') {
    specializedItems.push({
      text: 'Inventory',
      icon: <Inventory />,
      path: '/inventory',
      module: 'inventory'
    });
  }

  if (specializedItems.length > 0) {
    items.push({
      text: 'Specialized Modules',
      icon: <Support />,
      children: specializedItems,
      category: true
    });
  }

  // Reports and Analytics
  const reportsItems = [];
  
  if (permissions.permissions.reports !== 'No Access') {
    reportsItems.push({
      text: 'Reports',
      icon: <Report />,
      path: '/reports',
      module: 'reports'
    });
  }
  
  if (permissions.permissions.analytics !== 'No Access') {
    reportsItems.push({
      text: 'Analytics',
      icon: <Analytics />,
      path: '/analytics',
      module: 'analytics'
    });
  }

  if (reportsItems.length > 0) {
    items.push({
      text: 'Reports & Analytics',
      icon: <TrendingUp />,
      children: reportsItems,
      category: true
    });
  }

  // System Management (Admin only)
  const systemItems = [];
  
  if (permissions.permissions.settings !== 'No Access') {
    systemItems.push({
      text: 'Settings',
      icon: <Settings />,
      path: '/settings',
      module: 'settings'
    });
  }
  
  if (permissions.permissions.users !== 'No Access') {
    systemItems.push({
      text: 'User Management',
      icon: <People />,
      path: '/users',
      module: 'users'
    });
  }
  
  if (permissions.permissions.permissions !== 'No Access') {
    systemItems.push({
      text: 'Permissions',
      icon: <Security />,
      path: '/permissions',
      module: 'permissions'
    });
  }

  if (systemItems.length > 0) {
    items.push({
      text: 'System Management',
      icon: <AdminPanelSettings />,
      children: systemItems,
      category: true
    });
  }

  return items;
};

const ManagementLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get user info from localStorage or API
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/management-login');
        return;
      }

      // Get user permissions
      const response = await api.get('/auth/me'); // Assuming this endpoint returns user info with permissions
      setUserInfo(response.data.user);
      setPermissions(response.data.permissions);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user permissions');
      // Set basic user info if available
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUserInfo(JSON.parse(storedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = useMemo(() => {
    return getNavigationItems(permissions, userInfo?.role);
  }, [permissions, userInfo]);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [mobileOpen]);

  const handleCategoryToggle = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleNavigation = useCallback((path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [navigate, isMobile]);

  const handleMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/management-login');
    handleMenuClose();
  };

  const renderNavItems = useCallback((items) => {
    return items.map((item) => {
      if (item.category && item.children) {
        const isExpanded = expandedCategories[item.text];
        return (
          <Box key={item.text}>
            <ListItemButton
              onClick={() => handleCategoryToggle(item.text)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                minHeight: 48,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontSize: '0.95rem', 
                    fontWeight: 500 
                  } 
                }} 
              />
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((childItem) => (
                  <ListItemButton
                    key={childItem.text}
                    onClick={() => handleNavigation(childItem.path)}
                    selected={location.pathname === childItem.path}
                    sx={{
                      pl: 4,
                      borderRadius: 2,
                      mb: 0.5,
                      ml: 2,
                      mr: 1,
                      minHeight: 40,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(59,130,246,0.2)',
                        '& .MuiListItemIcon-root': {
                          color: '#3b82f6',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 35 }}>
                      {childItem.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={childItem.text} 
                      sx={{ 
                        '& .MuiTypography-root': { 
                          fontSize: '0.9rem', 
                          fontWeight: 400 
                        } 
                      }} 
                    />
                    {permissions?.permissions[childItem.module] === 'Edit Access' && (
                      <Chip 
                        label="Edit" 
                        size="small" 
                        color="primary" 
                        sx={{ fontSize: '0.7rem', height: 18 }} 
                      />
                    )}
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>
        );
      } else {
        return (
          <ListItemButton
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              minHeight: 48,
              '&.Mui-selected': {
                backgroundColor: 'rgba(59,130,246,0.15)',
                '& .MuiListItemIcon-root': {
                  color: '#3b82f6',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                '& .MuiTypography-root': { 
                  fontSize: '1rem', 
                  fontWeight: 500 
                } 
              }} 
            />
          </ListItemButton>
        );
      }
    });
  }, [expandedCategories, handleCategoryToggle, handleNavigation, location.pathname, permissions]);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
          color: 'white',
          minHeight: '64px !important',
        }}
      >
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          EduLives Management
        </Typography>
      </Toolbar>
      
      {userInfo && (
        <Box sx={{ p: 2, backgroundColor: 'rgba(59,130,246,0.1)' }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
              {userInfo.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {userInfo.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {userInfo.role}
              </Typography>
            </Box>
          </Box>
          {userInfo.department && (
            <Chip 
              label={userInfo.department} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>
      )}
      
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        <List sx={{ pt: 0 }}>
          {loading ? (
            <Alert severity="info" sx={{ m: 2 }}>Loading permissions...</Alert>
          ) : !permissions ? (
            <Alert severity="warning" sx={{ m: 2 }}>
              No permissions found. Please contact administrator.
            </Alert>
          ) : (
            renderNavItems(navigationItems)
          )}
        </List>
      </Box>
      
      <Divider />
      <List>
        <ListItemButton 
          onClick={() => handleNavigation('/profile')}
          sx={{ borderRadius: 2, m: 1 }}
        >
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {userInfo?.role} Dashboard
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit">
              <Badge badgeContent={0} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <IconButton
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {userInfo?.name?.charAt(0)}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleNavigation('/profile')}>
                <Person sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem onClick={() => handleNavigation('/settings')}>
                <Settings sx={{ mr: 1 }} /> Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
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
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdfa 100%)',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default ManagementLayout; 