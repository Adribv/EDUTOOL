import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const navItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/parent/dashboard' },
  { text: 'My Children', icon: <Person />, path: '/parent/children' },
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
  const theme = useTheme();
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

  const drawer = (
    <Box sx={{ height: '100%', backgroundColor: '#1e3a8a' }}>
      {/* Enhanced Header */}
      <Box sx={{ 
        p: 3, 
        backgroundColor: '#1e40af', 
        borderBottom: '2px solid #3b82f6',
        textAlign: 'center'
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 800,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '1px'
          }}
        >
          Parent Portal
        </Typography>
      </Box>
      
      {/* Enhanced Navigation List */}
      <List sx={{ p: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                py: 2,
                px: 3,
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateX(8px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                },
                '&.Mui-selected': {
                  backgroundColor: '#3b82f6',
                  border: '1px solid #60a5fa',
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: 'white', 
                minWidth: 40,
                '& .MuiSvgIcon-root': {
                  fontSize: '1.5rem'
                }
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  '& .MuiTypography-root': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1rem',
                    letterSpacing: '0.5px'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
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
          backgroundColor: 'white',
          color: '#1e3a8a',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderBottom: '2px solid #e5e7eb'
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
          <Typography 
            variant="h5" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              color: '#1e3a8a',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Welcome, <span style={{ color: '#3b82f6', fontWeight: 800 }}>{user?.name || 'Parent'}</span>
          </Typography>
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar src={user?.profilePicture} alt={user?.name} />
            </IconButton>
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
            >
              <MenuItem onClick={() => navigate('/parent/profile')}>
                <ListItemIcon><Person /></ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><Logout /></ListItemIcon>
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
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#1e3a8a',
              borderRight: '2px solid #3b82f6',
              boxShadow: '4px 0 8px rgba(0,0,0,0.1)'
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
          backgroundColor: '#f8fafc',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Box sx={{ 
          backgroundColor: 'white', 
          borderRadius: 3, 
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          p: 3,
          minHeight: 'calc(100vh - 120px)'
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default ParentLayout; 
