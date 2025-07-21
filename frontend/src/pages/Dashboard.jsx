import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LibraryBooks as LibraryIcon,
  Psychology as PsychologyIcon,
  SportsSoccer as SportsIcon,
  Event as EventIcon,
  DirectionsBus as TransportIcon,
  EmojiEvents as AchievementIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStaffPermissions, RoleGate, PermissionGate } from '../context/StaffPermissionContext';

// Import role-specific dashboards
import LibrarianDashboard from './librarian/LibrarianDashboard';
import MentalWellnessDashboard from './counselor/MentalWellnessDashboard';
import PTTeacherDashboard from './ptteacher/PTTeacherDashboard';
import EventHandlerDashboard from './eventhandler/EventHandlerDashboard';
import TransportManagerDashboard from './transportmanager/TransportManagerDashboard';
import SoftSkillsManagerDashboard from './softskillsmanager/SoftSkillsManagerDashboard';
import AdminDashboard from './admin/AdminDashboard';

// Role Icons Mapping
const roleIcons = {
  librarian: LibraryIcon,
  counselor: PsychologyIcon,
  ptteacher: SportsIcon,
  eventhandler: EventIcon,
  transportmanager: TransportIcon,
  softskillsmanager: AchievementIcon,
  admin: AdminIcon
};

// Role Colors Mapping
const roleColors = {
  librarian: '#1976d2',
  counselor: '#388e3c',
  ptteacher: '#f57c00',
  eventhandler: '#7b1fa2',
  transportmanager: '#d32f2f',
  softskillsmanager: '#ff6f00',
  admin: '#424242'
};

// Role Names Mapping
const roleNames = {
  librarian: 'Librarian',
  counselor: 'Mental Wellness Counselor',
  ptteacher: 'PT Teacher',
  eventhandler: 'Event Handler',
  transportmanager: 'Transport Manager',
  softskillsmanager: 'Soft Skills Manager',
  admin: 'Administrator'
};

// Main Dashboard Component
const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getUserRoles, 
    getCurrentUserStaff, 
    getRoleDefinition, 
    loading, 
    error 
  } = useStaffPermissions();

  const [selectedRole, setSelectedRole] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [userStaff, setUserStaff] = useState(null);

  useEffect(() => {
    if (user) {
      const roles = getUserRoles();
      const staff = getCurrentUserStaff();
      setUserRoles(roles);
      setUserStaff(staff);
      
      // Auto-select first role if user has multiple roles
      if (roles.length > 0 && !selectedRole) {
        setSelectedRole(roles[0]);
      }
    }
  }, [user, getUserRoles, getCurrentUserStaff, selectedRole]);

  // Loading state
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  // No user or no roles assigned
  if (!user || userRoles.length === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <InfoIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
        <Typography variant="h4" color="text.secondary">
          No Dashboard Access
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          {!user 
            ? 'Please log in to access your dashboard.'
            : 'You have not been assigned any roles yet. Please contact your administrator.'
          }
        </Typography>
        {!user && (
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        )}
      </Box>
    );
  }

  // Single role - show dashboard directly
  if (userRoles.length === 1) {
    const role = userRoles[0];
    return renderRoleDashboard(role);
  }

  // Multiple roles - show role selection
  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.grey[50] }}>
      {/* Header */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        color: 'white',
        p: 4,
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome, {user.name || user.email}!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Select a dashboard to get started
          </Typography>
        </motion.div>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* User Info Card */}
        <Paper sx={{ p: 3, mb: 4, maxWidth: 600, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: theme.palette.primary.main,
                mr: 2
              }}
            >
              <PersonIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {userStaff?.name || user.name || 'Staff Member'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userStaff?.department || 'Department'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Your Assigned Roles:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {userRoles.map((role) => {
              const RoleIcon = roleIcons[role];
              return (
                <Chip
                  key={role}
                  label={roleNames[role]}
                  icon={<RoleIcon />}
                  sx={{
                    bgcolor: `${roleColors[role]}20`,
                    color: roleColors[role],
                    fontWeight: 600
                  }}
                />
              );
            })}
          </Box>
        </Paper>

        {/* Role Selection Grid */}
        <Grid container spacing={3} justifyContent="center">
          {userRoles.map((role, index) => {
            const RoleIcon = roleIcons[role];
            const roleDef = getRoleDefinition(role);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={role}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      border: selectedRole === role ? `3px solid ${roleColors[role]}` : '3px solid transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: roleColors[role],
                        boxShadow: theme.shadows[8]
                      }
                    }}
                    onClick={() => setSelectedRole(role)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                      <Avatar 
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          bgcolor: roleColors[role],
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        <RoleIcon sx={{ fontSize: 40 }} />
                      </Avatar>
                      
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {roleNames[role]}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {roleDef?.description || 'Manage your assigned responsibilities'}
                      </Typography>
                      
                      <Button
                        variant={selectedRole === role ? "contained" : "outlined"}
                        startIcon={<ArrowForwardIcon />}
                        fullWidth
                        sx={{ 
                          bgcolor: selectedRole === role ? roleColors[role] : 'transparent',
                          color: selectedRole === role ? 'white' : roleColors[role],
                          borderColor: roleColors[role],
                          '&:hover': {
                            bgcolor: selectedRole === role ? roleColors[role] : `${roleColors[role]}10`
                          }
                        }}
                        onClick={() => setSelectedRole(role)}
                      >
                        {selectedRole === role ? 'Selected' : 'Select Dashboard'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* Launch Dashboard Button */}
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<DashboardIcon />}
                sx={{ 
                  bgcolor: roleColors[selectedRole],
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: roleColors[selectedRole]
                  }
                }}
                onClick={() => {
                  // Navigate to role-specific dashboard
                  navigate(`/dashboard/${selectedRole}`);
                }}
              >
                Launch {roleNames[selectedRole]} Dashboard
              </Button>
            </Box>
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

// Helper function to render role-specific dashboard
const renderRoleDashboard = (role) => {
  switch (role) {
    case 'librarian':
      return <LibrarianDashboard />;
    case 'counselor':
      return <MentalWellnessDashboard />;
    case 'ptteacher':
      return <PTTeacherDashboard />;
    case 'eventhandler':
      return <EventHandlerDashboard />;
    case 'transportmanager':
      return <TransportManagerDashboard />;
    case 'softskillsmanager':
      return <SoftSkillsManagerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="text.secondary">
            Dashboard not found for role: {role}
          </Typography>
        </Box>
      );
  }
};

// Role-specific dashboard components with access control
export const LibrarianDashboardProtected = () => (
  <RoleGate roles="librarian">
    <LibrarianDashboard />
  </RoleGate>
);

export const CounselorDashboardProtected = () => (
  <RoleGate roles="counselor">
    <MentalWellnessDashboard />
  </RoleGate>
);

export const PTTeacherDashboardProtected = () => (
  <RoleGate roles="ptteacher">
    <PTTeacherDashboard />
  </RoleGate>
);

export const EventHandlerDashboardProtected = () => (
  <RoleGate roles="eventhandler">
    <EventHandlerDashboard />
  </RoleGate>
);

export const TransportManagerDashboardProtected = () => (
  <RoleGate roles="transportmanager">
    <TransportManagerDashboard />
  </RoleGate>
);

export const SoftSkillsManagerDashboardProtected = () => (
  <RoleGate roles="softskillsmanager">
    <SoftSkillsManagerDashboard />
  </RoleGate>
);

export const AdminDashboardProtected = () => (
  <RoleGate roles="admin">
    <AdminDashboard />
  </RoleGate>
);

export default Dashboard; 