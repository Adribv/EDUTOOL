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
  ListItem,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
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
  LocalShipping,
  RateReview,
  AccountBalance,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import { roleConfig } from '../../pages/admin/roleConfig';
import { api, staffActivitiesControlAPI } from '../../services/api';
import { 
  getUserActivitiesControl, 
  hasAnyActivityAccess, 
  filterMenuItemsByActivitiesControl,
  storeUserActivitiesControl,
  clearUserActivitiesControl 
} from '../../utils/activitiesControl';

const drawerWidth = 280;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [userActivitiesControl, setUserActivitiesControl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch user's activities control on component mount
  useEffect(() => {
    const fetchUserActivitiesControl = async () => {
      try {
        if (user?._id || user?.id) {
          const staffId = user._id || user.id;
          
          // Use the staff endpoint instead of VP endpoint for getting own activities control
          const response = await staffActivitiesControlAPI.getMyActivities();
          const activitiesControl = response?.data;
          
          if (activitiesControl) {
            console.log(`🔍 Activities Control found for ${user.email}:`, activitiesControl);
            
            // Special logging for the specific example
            if (user.email === 'kgokulpriyan@gmail.com') {
              console.log(`🎯 Special case: ${user.email} - Expected access to Inventory and Student Records`);
              const inventoryAccess = activitiesControl.activityAssignments?.find(a => a.activity === 'Inventory');
              const studentRecordsAccess = activitiesControl.activityAssignments?.find(a => a.activity === 'Student Records');
              console.log(`📦 Inventory access:`, inventoryAccess);
              console.log(`📚 Student Records access:`, studentRecordsAccess);
            }
            
            setUserActivitiesControl(activitiesControl);
            storeUserActivitiesControl(activitiesControl);
          } else {
            console.log(`📋 No activities control found for ${user.email}, using default permissions`);
            setUserActivitiesControl(null);
            clearUserActivitiesControl();
          }
        }
      } catch (error) {
        console.log(`❌ Error fetching activities control for ${user?.email}:`, error.message);
        // If no activities control is found, user will have default permissions
        setUserActivitiesControl(null);
        clearUserActivitiesControl();
      }
    };

    fetchUserActivitiesControl();
  }, [user]);

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
    clearUserActivitiesControl();
    logout();
    navigate('/management-login');
    handleProfileMenuClose();
  }, [logout, navigate, handleProfileMenuClose]);

  const toggleDrawerCollapse = useCallback(() => {
    setDrawerCollapsed(!drawerCollapsed);
  }, [drawerCollapsed]);

  const getMenuItems = useMemo(() => {
    // If user is admin type and has a designation in roleConfig, use that
    if (user?.role === 'AdminStaff' && roleConfig[user?.designation]) {
      const baseMenuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
        { text: 'Profile', icon: <Person />, path: '/admin/profile' },
      ];

      // Map roleConfig sidebar items to menu items with proper activity mapping
      const roleSpecificItems = (roleConfig[user.designation]?.sidebar || []).map((item) => {
        // Map sidebar item to path and icon
        const iconMap = {
          'Attendance': <Assignment />, 
          'Classes': <School />, 
          'Students': <People />, 
          'Reports': <Assessment />,
          'FeeConfiguration': <Payment />, 
          'Fee_Management': <Payment />,
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
          'Disciplinary_Forms': <Warning />,
          'Teacher_Remarks': <RateReview />,
        };

        // Map roleConfig items to activities control activities
        const activityMapping = {
          'Attendance': 'Student Records',
          'Classes': 'Classes',
          'Students': 'Student Records',
          'Reports': 'Reports',
          'FeeConfiguration': 'Fee Management',
          'Fee_Management': 'Fee Management',
          'Inventory_Management': 'Inventory',
          'UserManagement': 'User Management',
          'A_Reports': 'Reports',
          'A_Events': 'Events',
          'A_Communication': 'Communications',
          'A_Settings': 'System Settings',
          'A_Users': 'User Management',
          'A_Classes': 'Classes',
          'A_Subjects': 'Classes',
          'A_Schedules': 'Events',
          'Exams': 'Reports',
          'Results': 'Reports',
          'SystemSettings': 'System Settings',
          'Enquiries': 'Enquiries',
          'Visitors': 'Visitors',
          'Disciplinary_Forms': 'Student Records',
          'Teacher_Remarks': 'Syllabus Completion',
        };

        return {
          text: item.replace(/_/g, ' '),
          icon: iconMap[item] || <Assignment />,
          path: `/admin/${item.toLowerCase().replace(/_/g, '-')}`,
          activity: activityMapping[item] || item.replace(/_/g, ' '),
        };
      });

      const allMenuItems = [...baseMenuItems, ...roleSpecificItems];

      // Filter menu items based on activities control if user has activities control
      if (userActivitiesControl && userActivitiesControl.activityAssignments) {
        console.log(`🔐 Filtering AdminStaff menu for ${user.email}:`, {
          totalItems: allMenuItems.length,
          activitiesControl: userActivitiesControl.activityAssignments,
          availableActivities: userActivitiesControl.activityAssignments.filter(a => a.accessLevel !== 'Unauthorized').map(a => a.activity)
        });

        const filteredItems = allMenuItems.filter(item => {
          // Always allow Dashboard and Profile
          if (item.text === 'Dashboard' || item.text === 'Profile') {
            console.log(`✅ Always allowing: ${item.text}`);
            return true;
          }
          
          // Check if user has access to this activity
          const activityAssignment = userActivitiesControl.activityAssignments.find(
            a => a.activity === item.activity
          );
          
          if (!activityAssignment) {
            console.log(`❌ No activity assignment found for: ${item.text} (${item.activity}) - HIDDEN`);
            return false; // No assignment found, deny access
          }
          
          // Check access level - only show if not 'Unauthorized'
          const hasAccess = activityAssignment.accessLevel !== 'Unauthorized';
          console.log(`${hasAccess ? '✅' : '❌'} AdminStaff Activity: ${item.text} (${item.activity}) - Access Level: ${activityAssignment.accessLevel} - ${hasAccess ? 'SHOWN' : 'HIDDEN'}`);
          return hasAccess;
        });

        console.log(`📊 AdminStaff Activities Control Summary for ${user.email}:`, {
          totalMenuItems: allMenuItems.length,
          filteredMenuItems: filteredItems.length,
          hiddenItems: allMenuItems.filter(item => !filteredItems.includes(item)).map(item => item.text),
          availableItems: filteredItems.map(item => item.text),
          userActivitiesControl: userActivitiesControl.activityAssignments
        });

        return filteredItems;
      }

      return allMenuItems;
    }

    // For HOD users, provide specific navigation
    if (user?.role === 'HOD') {
      const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/hod/dashboard' },
        { text: 'Profile', icon: <Person />, path: '/hod/profile' },
        { text: 'Department Management', icon: <School />, path: '/hod/department' },
        { text: 'Staff Management', icon: <People />, path: '/hod/staff' },
        { text: 'Course Management', icon: <Assignment />, path: '/hod/courses' },
        { text: 'Reports', icon: <Assessment />, path: '/hod/reports' },
        { text: 'Lesson Plan Approvals', icon: <Approval />, path: '/hod/lesson-plans' },
      ];

      // Filter menu items based on activities control if user has activities control
      if (userActivitiesControl && userActivitiesControl.activityAssignments) {
        console.log(`🔐 Filtering HOD menu for ${user.email}:`, {
          totalItems: menuItems.length,
          activitiesControl: userActivitiesControl.activityAssignments,
          availableActivities: userActivitiesControl.activityAssignments.filter(a => a.accessLevel !== 'Unauthorized').map(a => a.activity)
        });

        const filteredItems = menuItems.filter(item => {
          // Always allow Dashboard and Profile
          if (item.text === 'Dashboard' || item.text === 'Profile') {
            console.log(`✅ Always allowing HOD: ${item.text}`);
            return true;
          }
          
          // Map HOD menu items to activities
          const hodActivityMapping = {
            'Department Management': 'Department Management',
            'Staff Management': 'HOD Staff Management',
            'Course Management': 'Course Management',
            'Reports': 'HOD Reports',
            'Lesson Plan Approvals': 'Lesson Plan Approvals',
          };
          
          const activity = hodActivityMapping[item.text];
          if (!activity) {
            console.log(`❌ No activity mapping found for HOD item: ${item.text} - HIDDEN`);
            return false;
          }
          
          const activityAssignment = userActivitiesControl.activityAssignments.find(
            a => a.activity === activity
          );
          
          if (!activityAssignment) {
            console.log(`❌ No activity assignment found for HOD: ${item.text} (${activity}) - HIDDEN`);
            return false;
          }
          
          const hasAccess = activityAssignment.accessLevel !== 'Unauthorized';
          console.log(`${hasAccess ? '✅' : '❌'} HOD Activity: ${item.text} (${activity}) - Access Level: ${activityAssignment.accessLevel} - ${hasAccess ? 'SHOWN' : 'HIDDEN'}`);
          return hasAccess;
        });

        console.log(`📊 HOD Activities Control Summary for ${user.email}:`, {
          totalMenuItems: menuItems.length,
          filteredMenuItems: filteredItems.length,
          hiddenItems: menuItems.filter(item => !filteredItems.includes(item)).map(item => item.text),
          availableItems: filteredItems.map(item => item.text),
          availableActivities: userActivitiesControl.activityAssignments.filter(a => a.accessLevel !== 'Unauthorized').map(a => a.activity)
        });

        return filteredItems;
      }

      return menuItems;
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
        { text: 'Staff Management', icon: <People />, path: '/admin/staff', activity: 'Staff Management' },
        { text: 'Student Records', icon: <School />, path: '/admin/students', activity: 'Student Records' },
        { text: 'Fee Management', icon: <Payment />, path: '/admin/fee-management', activity: 'Fee Management' },
        { text: 'Inventory', icon: <Inventory />, path: '/admin/inventory', activity: 'Inventory' },
        { text: 'Events', icon: <CalendarToday />, path: '/admin/events', activity: 'Events' },
        { text: 'Communications', icon: <Notifications />, path: '/admin/communications', activity: 'Communications' },
        { text: 'Classes', icon: <School />, path: '/admin/classes', activity: 'Classes' },
        { text: 'System Settings', icon: <Settings />, path: '/admin/settings', activity: 'System Settings' },
        { text: 'User Management', icon: <People />, path: '/admin/users', activity: 'User Management' },
        { text: 'Permissions', icon: <Security />, path: '/admin/permissions', activity: 'Permissions' },
        { text: 'Reports', icon: <Assessment />, path: '/admin/reports', activity: 'Reports' },
        { text: 'Enquiries', icon: <Message />, path: '/admin/Enquiries', activity: 'Enquiries' },
        { text: 'Visitors', icon: <GroupIcon />, path: '/admin/Visitors', activity: 'Visitors' },
        { text: 'Service Requests', icon: <Approval />, path: '/admin/service-requests', activity: 'Service Requests' },
        { text: 'Syllabus Completion', icon: <RateReview />, path: '/admin/syllabus-completion', activity: 'Syllabus Completion' },
        { text: 'Audit Log', icon: <Security />, path: '/admin/audit-log', activity: 'Audit Log' },
        { text: 'Salary Payroll', icon: <AccountBalance />, path: '/admin/salary-payroll', activity: 'Salary Payroll' },
      ],
      ITAdmin: [
        { text: 'IT Admin Dashboard', icon: <Dashboard />, path: '/itadmin/dashboard' },
        { text: 'Profile', icon: <Person />, path: '/itadmin/profile' },
        { text: 'User Management', icon: <People />, path: '/itadmin/users', activity: 'IT User Management' },
        { text: 'Reports', icon: <Assessment />, path: '/itadmin/reports', activity: 'IT Reports' },
        { text: 'System Settings', icon: <Settings />, path: '/itadmin/settings', activity: 'IT System Settings' },
      ],
      Teacher: [
        { text: 'Classes', icon: <School />, path: '/teacher/classes', activity: 'Classes' },
        { text: 'Assignments', icon: <Assignment />, path: '/teacher/assignments', activity: 'Assignments' },
        { text: 'Calendar', icon: <CalendarToday />, path: '/teacher/calendar', activity: 'Calendar' },
        { text: 'Substitute Teacher Request', icon: <Approval />, path: '/teacher/substitute-request', activity: 'Substitute Teacher Request' },
        { text: 'My Substitute Requests', icon: <Approval />, path: '/teacher/substitute-requests', activity: 'My Substitute Requests' },
        { text: 'Teacher Remarks', icon: <RateReview />, path: '/teacher/teacher-remarks', activity: 'Teacher Remarks' },
        { text: 'Counselling Request Form', icon: <Psychology />, path: '/teacher/counselling-request', activity: 'Counselling Request Form' },
      ],
      Student: [
        { text: 'Courses', icon: <School />, path: '/student/courses', activity: 'Courses' },
        { text: 'Student Assignments', icon: <Assignment />, path: '/student/assignments', activity: 'Student Assignments' },
        { text: 'Student Calendar', icon: <CalendarToday />, path: '/student/calendar', activity: 'Student Calendar' },
        { text: 'Student Counselling Request Form', icon: <Psychology />, path: '/student/counselling-request', activity: 'Student Counselling Request Form' },
      ],
      Principal: [
        { text: 'Staff Management', icon: <People />, path: '/principal/staff', activity: 'Principal Staff Management' },
        { text: 'Student Management', icon: <School />, path: '/principal/students', activity: 'Principal Student Management' },
        { text: 'School Management', icon: <Settings />, path: '/principal/school', activity: 'School Management' },
        { text: 'Academic Management', icon: <Book />, path: '/principal/academic', activity: 'Academic Management' },
        { text: 'Approvals', icon: <Approval />, path: '/principal/approvals', activity: 'Principal Approvals' },
        { text: 'Reports', icon: <Assessment />, path: '/principal/reports', activity: 'Principal Reports' },
      ],
      Counsellor: [
        { text: 'Counselling Requests', icon: <Psychology />, path: '/counselor/requests', activity: 'Counselling Requests' },
      ],
    };

    const allMenuItems = [...commonItems, ...(roleSpecificItems[user?.role] || [])];

    // Filter menu items based on activities control if user has activities control
    if (userActivitiesControl && userActivitiesControl.activityAssignments) {
      console.log(`🔐 Filtering ${user?.role} menu for ${user.email}:`, {
        totalItems: allMenuItems.length,
        activitiesControl: userActivitiesControl.activityAssignments,
        availableActivities: userActivitiesControl.activityAssignments.filter(a => a.accessLevel !== 'Unauthorized').map(a => a.activity)
      });

      const filteredItems = allMenuItems.filter(item => {
        // Always allow Dashboard and Profile
        if (item.text === 'Dashboard' || item.text === 'Profile') {
          console.log(`✅ Always allowing ${user?.role}: ${item.text}`);
          return true;
        }
        
        // Check if item has an activity mapping
        if (!item.activity) {
          console.log(`⚠️ No activity mapping for ${user?.role} item: ${item.text} - ALLOWING (fallback)`);
          return true; // If no activity mapping, allow access (fallback)
        }
        
        // Check if user has access to this activity
        const activityAssignment = userActivitiesControl.activityAssignments.find(
          a => a.activity === item.activity
        );
        
        if (!activityAssignment) {
          console.log(`❌ No activity assignment found for ${user?.role}: ${item.text} (${item.activity}) - HIDDEN`);
          return false; // No assignment found, deny access
        }
        
        // Check access level - only show if not 'Unauthorized'
        const hasAccess = activityAssignment.accessLevel !== 'Unauthorized';
        console.log(`${hasAccess ? '✅' : '❌'} ${user?.role} Activity: ${item.text} (${item.activity}) - Access Level: ${activityAssignment.accessLevel} - ${hasAccess ? 'SHOWN' : 'HIDDEN'}`);
        return hasAccess;
      });

      console.log(`📊 ${user?.role} Activities Control Summary for ${user.email}:`, {
        totalMenuItems: allMenuItems.length,
        filteredMenuItems: filteredItems.length,
        hiddenItems: allMenuItems.filter(item => !filteredItems.includes(item)).map(item => item.text),
        availableItems: filteredItems.map(item => item.text),
        availableActivities: userActivitiesControl.activityAssignments.filter(a => a.accessLevel !== 'Unauthorized').map(a => a.activity)
      });

      return filteredItems;
    }

    return allMenuItems;
  }, [user?.role, user?.designation, userActivitiesControl]);

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

  // Calculate drawer width based on collapse state and mobile
  const currentDrawerWidth = drawerCollapsed && !isMobile ? 80 : drawerWidth;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 2,
        minHeight: 120
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
        {userActivitiesControl && (
          <Box sx={{ mb: 2, px: 2 }}>
            <Alert severity="info" sx={{ fontSize: '0.75rem', py: 0.5 }}>
              <Typography variant="caption">
                VP Controlled Access
              </Typography>
              <Typography variant="caption" display="block">
                {userActivitiesControl.activityAssignments?.filter(a => a.accessLevel !== 'Unauthorized').length || 0} features available
              </Typography>
            </Alert>
          </Box>
        )}
        
        {getMenuItems.map((item) => {
          // Get access level for this item if it has an activity
          let accessLevel = null;
          let accessLevelColor = 'default';
          
          if (item.activity && userActivitiesControl?.activityAssignments) {
            const activityAssignment = userActivitiesControl.activityAssignments.find(
              a => a.activity === item.activity
            );
            if (activityAssignment) {
              accessLevel = activityAssignment.accessLevel;
              switch (accessLevel) {
                case 'View':
                  accessLevelColor = 'info';
                  break;
                case 'Edit':
                  accessLevelColor = 'warning';
                  break;
                case 'Approve':
                  accessLevelColor = 'success';
                  break;
                case 'Unauthorized':
                  accessLevelColor = 'error';
                  break;
                default:
                  accessLevelColor = 'default';
              }
            }
          }

          return (
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
              <ListItemIcon
                sx={{
                  minWidth: drawerCollapsed ? 0 : 40,
                  mr: drawerCollapsed ? 0 : 1,
                  justifyContent: 'center',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!drawerCollapsed && (
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'white',
                    },
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
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
          width: { md: user?.role === 'HOD' ? '100%' : `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: user?.role === 'HOD' ? 0 : `${currentDrawerWidth}px` },
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
          {user?.role !== 'HOD' && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'block' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
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
            {userActivitiesControl && (
              <Chip
                label={`VP Controlled - ${userActivitiesControl.activityAssignments?.filter(a => a.accessLevel !== 'Unauthorized').length || 0} features accessible`}
                size="small"
                color="success"
                sx={{ ml: 2, fontSize: '0.7rem' }}
              />
            )}
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
      {user?.role !== 'HOD' && (
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
          width: { md: user?.role === 'HOD' ? '100%' : `calc(100% - ${currentDrawerWidth}px)` },
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