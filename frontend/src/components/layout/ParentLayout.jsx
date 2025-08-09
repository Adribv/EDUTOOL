import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Person,
  Payment,
  Event,
  Message,
  Logout,
  Settings,
  Notifications,
  Warning as WarningIcon,
  LocalShipping,
  RateReview,
  Psychology,
  ArrowBack,
  Brightness4,
  Brightness7,
  Home,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';

const drawerWidth = 280;

const navItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/parent' },
  { text: 'My Children', icon: <Person />, path: '/parent/children' },
  { text: 'Child Progress', icon: <Psychology />, path: '/parent/overall-progress' },
  { text: 'Fees', icon: <Payment />, path: '/parent/fees' },
  { text: 'Events', icon: <Event />, path: '/parent/events' },
  { text: 'Messages', icon: <Message />, path: '/parent/messages' },
  { text: 'Transport Forms', icon: <LocalShipping />, path: '/parent/transport-forms' },
  { text: 'Ward Misconduct', icon: <WarningIcon />, path: '/parent/ward-misconduct' },
  { text: 'Syllabus Completion', icon: <RateReview />, path: '/parent/teacher-remarks' },
  { text: 'Counselling Request Form', icon: <Psychology />, path: '/parent/counselling-request' },
];

const ParentLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isDark, toggleTheme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/parent-login');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      background: isDark 
        ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' 
        : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      borderRight: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
    }}>
      {/* Modern Header */}
      <Box sx={{ 
        p: 3, 
        background: isDark 
          ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
          : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        borderBottom: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)'
        }} />
        
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '1px',
            position: 'relative',
            zIndex: 1
          }}
        >
          Parent Portal
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255,255,255,0.8)', 
            display: 'block',
            mt: 1,
            position: 'relative',
            zIndex: 1
          }}
        >
          Manage your children's education
        </Typography>
      </Box>
      
      {/* Modern Navigation List */}
      <List sx={{ p: 2, mt: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 3,
                mx: 1,
                py: 2,
                px: 3,
                background: isCurrentPath(item.path) 
                  ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)')
                  : 'transparent',
                border: isCurrentPath(item.path)
                  ? (isDark ? '1px solid #3b82f6' : '1px solid #2563eb')
                  : '1px solid transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: isDark 
                    ? 'rgba(59, 130, 246, 0.15)' 
                    : 'rgba(37, 99, 235, 0.08)',
                  transform: 'translateX(4px)',
                  boxShadow: isDark 
                    ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                    : '0 4px 12px rgba(37, 99, 235, 0.2)',
                },
                '&.Mui-selected': {
                  background: isDark 
                    ? 'rgba(59, 130, 246, 0.25)' 
                    : 'rgba(37, 99, 235, 0.15)',
                  '&:hover': {
                    background: isDark 
                      ? 'rgba(59, 130, 246, 0.3)' 
                      : 'rgba(37, 99, 235, 0.2)',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: isCurrentPath(item.path) 
                  ? (isDark ? '#60a5fa' : '#2563eb')
                  : (isDark ? '#94a3b8' : '#64748b'),
                minWidth: 40,
                '& .MuiSvgIcon-root': {
                  fontSize: '1.4rem'
                }
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': {
                    color: isCurrentPath(item.path) 
                      ? (isDark ? '#f1f5f9' : '#1e293b')
                      : (isDark ? '#cbd5e1' : '#64748b'),
                    fontWeight: isCurrentPath(item.path) ? 600 : 500,
                    fontSize: '0.95rem',
                    letterSpacing: '0.025em'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* User Info */}
      <Box sx={{ 
        p: 2, 
        mt: 'auto', 
        borderTop: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        background: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.5)'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 1.5,
          borderRadius: 2,
          background: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)',
          border: isDark ? '1px solid #475569' : '1px solid #e2e8f0'
        }}>
          <Avatar 
            src={user?.profilePicture} 
            alt={user?.name}
            sx={{ 
              width: 32, 
              height: 32, 
              mr: 1.5,
              border: isDark ? '2px solid #475569' : '2px solid #e2e8f0'
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ 
              color: isDark ? '#f1f5f9' : '#1e293b',
              fontWeight: 600,
              display: 'block',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}>
              {user?.name || 'Parent'}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: '0.7rem'
            }}>
              Parent Account
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: isDark 
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          color: isDark ? '#f1f5f9' : '#1e293b',
          boxShadow: isDark 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
          backdropFilter: 'blur(10px)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ minHeight: 70 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Back Button */}
          <IconButton
            color="inherit"
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              color: isDark ? '#f1f5f9' : '#1e293b',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Welcome, <span style={{ 
              color: isDark ? '#60a5fa' : '#2563eb', 
              fontWeight: 800 
            }}>
              {user?.name || 'Parent'}
            </span>
          </Typography>
          
          <div>
            <Tooltip title="Notifications">
              <IconButton
                size="large"
                color="inherit"
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Account Settings">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar 
                  src={user?.profilePicture} 
                  alt={user?.name}
                  sx={{ 
                    width: 36, 
                    height: 36,
                    border: isDark ? '2px solid #475569' : '2px solid #e2e8f0'
                  }}
                />
              </IconButton>
            </Tooltip>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  background: isDark ? '#1e293b' : '#ffffff',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  boxShadow: isDark 
                    ? '0 10px 25px rgba(0, 0, 0, 0.5)' 
                    : '0 10px 25px rgba(0, 0, 0, 0.1)',
                  mt: 1
                }
              }}
            >
              <MenuItem onClick={() => navigate('/parent/profile')}>
                <ListItemIcon sx={{ color: isDark ? '#60a5fa' : '#2563eb' }}>
                  <AccountCircle />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={() => navigate('/parent/dashboard')}>
                <ListItemIcon sx={{ color: isDark ? '#60a5fa' : '#2563eb' }}>
                  <Home />
                </ListItemIcon>
                Dashboard
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon sx={{ color: '#ef4444' }}>
                  <Logout />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: isDark 
                ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' 
                : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              borderRight: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              boxShadow: isDark 
                ? '4px 0 8px rgba(0, 0, 0, 0.3)' 
                : '4px 0 8px rgba(0, 0, 0, 0.1)'
            },
          }}
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
          background: isDark ? '#0f172a' : '#f8fafc',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Box sx={{ 
          background: isDark ? '#1e293b' : '#ffffff', 
          borderRadius: 3, 
          boxShadow: isDark 
            ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px rgba(0, 0, 0, 0.05)',
          p: 3,
          minHeight: 'calc(100vh - 120px)',
          border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default ParentLayout; 
