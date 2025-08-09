import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Typography,
  useTheme,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Avatar,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
  Alert,
  AlertTitle,
  CircularProgress,
  useMediaQuery
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AccountCircle,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LibraryBooks as LibraryIcon,
  Psychology as PsychologyIcon,
  SportsSoccer as SportsIcon,
  Event as EventIcon,
  DirectionsBus as TransportIcon,
  EmojiEvents as AchievementIcon,
  SwapHoriz as SwapIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Notifications as NotificationIcon,
  Inventory as InventoryIcon,
  School as SchoolIcon,
  RateReview as RateReviewIcon,
  Feedback as FeedbackIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  NotificationsActive as AlertIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  getUserActivitiesControl, 
  hasAnyActivityAccess, 
  getActivityAccessLevel,
  getAccessLevelInfo 
} from '../../utils/activitiesControl';
import { api, staffActivitiesControlAPI } from '../../services/api';
import ModernDashboardLayout from '../../components/ModernDashboardLayout';
import GlassmorphismCard from '../../components/GlassmorphismCard';

// Mock data for demonstration
const adminStats = {
  totalStaff: 156,
  activeStaff: 142,
  pendingApprovals: 8,
  systemHealth: 98.5
};

const mockStaffMembers = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@school.edu',
    role: 'Teacher',
    department: 'Mathematics',
    status: 'Active',
    lastActive: '2 hours ago',
    permissions: ['View', 'Edit', 'Create']
  },
  {
    id: 2,
    name: 'Mr. David Chen',
    email: 'david.chen@school.edu',
    role: 'HOD',
    department: 'Science',
    status: 'Active',
    lastActive: '1 hour ago',
    permissions: ['View', 'Edit', 'Create', 'Delete']
  },
  {
    id: 3,
    name: 'Ms. Emily Rodriguez',
    email: 'emily.rodriguez@school.edu',
    role: 'Librarian',
    department: 'Library',
    status: 'Active',
    lastActive: '30 minutes ago',
    permissions: ['View', 'Edit']
  }
];

const ModernAdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  // State management
  const [staffMembers, setStaffMembers] = useState(mockStaffMembers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [roleDialog, setRoleDialog] = useState(false);
  const [permissionDialog, setPermissionDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [userActivitiesControl, setUserActivitiesControl] = useState(null);

  // Fetch user's activities control on component mount
  useEffect(() => {
    const fetchUserActivitiesControl = async () => {
      try {
        if (user?._id || user?.id) {
          const staffId = user._id || user.id;
          const response = await staffActivitiesControlAPI.getMyActivities();
          const activitiesControl = response?.data;
          
          if (activitiesControl) {
            setUserActivitiesControl(activitiesControl);
          }
        }
      } catch (error) {
        console.log('No activities control found for user, using default permissions');
        setUserActivitiesControl(null);
      }
    };

    fetchUserActivitiesControl();
  }, [user]);

  // Helper functions for access control
  const getUserAccessLevel = (activity) => {
    if (!userActivitiesControl?.activityAssignments) return 'Full';
    const assignment = userActivitiesControl.activityAssignments.find(a => a.activity === activity);
    return assignment?.accessLevel || 'Full';
  };

  const canPerformAction = (activity, requiredLevel = 'View') => {
    const userLevel = getUserAccessLevel(activity);
    const levels = ['View', 'Edit', 'Approve', 'Full'];
    return levels.indexOf(userLevel) >= levels.indexOf(requiredLevel);
  };

  const hasEditAccess = (activity) => {
    const userLevel = getUserAccessLevel(activity);
    return userLevel === 'Edit' || userLevel === 'Approve' || userLevel === 'Full';
  };

  // Stats data for glassmorphism cards
  const statsData = [
    {
      title: 'Total Staff',
      value: adminStats.totalStaff,
      subtitle: 'Active members',
      icon: PeopleIcon,
      color: 'primary',
      trend: '+5.2%',
      trendValue: 5.2,
      showTrend: true
    },
    {
      title: 'Active Staff',
      value: adminStats.activeStaff,
      subtitle: 'Currently working',
      icon: CheckCircleIcon,
      color: 'success',
      trend: '+2.1%',
      trendValue: 2.1,
      showTrend: true
    },
    {
      title: 'Pending Approvals',
      value: adminStats.pendingApprovals,
      subtitle: 'Awaiting review',
      icon: WarningIcon,
      color: 'warning',
      trend: '-15.3%',
      trendValue: -15.3,
      showTrend: true
    },
    {
      title: 'System Health',
      value: `${adminStats.systemHealth}%`,
      subtitle: 'Overall performance',
      icon: AssessmentIcon,
      color: 'info',
      showProgress: true,
      progressValue: adminStats.systemHealth
    }
  ];

  // Quick actions data
  const quickActionsData = [
    {
      title: 'Add Staff Member',
      subtitle: 'Create new staff account',
      icon: AddIcon,
      color: 'success',
      onClick: () => toast.info('Add Staff Member clicked')
    },
    {
      title: 'Manage Permissions',
      subtitle: 'Update access levels',
      icon: SecurityIcon,
      color: 'warning',
      onClick: () => toast.info('Manage Permissions clicked')
    },
    {
      title: 'Generate Reports',
      subtitle: 'View system analytics',
      icon: AssessmentIcon,
      color: 'info',
      onClick: () => toast.info('Generate Reports clicked')
    },
    {
      title: 'System Settings',
      subtitle: 'Configure preferences',
      icon: SettingsIcon,
      color: 'secondary',
      onClick: () => toast.info('System Settings clicked')
    }
  ];

  // Recent activity data
  const recentActivityData = [
    {
      title: 'New Staff Added',
      subtitle: 'Dr. Sarah Johnson joined',
      icon: PersonIcon,
      color: 'success',
      onClick: () => toast.info('View staff details')
    },
    {
      title: 'Permission Updated',
      subtitle: 'HOD access granted',
      icon: SecurityIcon,
      color: 'warning',
      onClick: () => toast.info('View permission changes')
    },
    {
      title: 'System Backup',
      subtitle: 'Daily backup completed',
      icon: CheckCircleIcon,
      color: 'info',
      onClick: () => toast.info('View backup status')
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin-login');
  };

  const handleQuickAction = (action) => {
    toast.info(`${action} action triggered`);
  };

  // Loading state
  if (loading) {
    return (
      <ModernDashboardLayout
        title="Admin Dashboard"
        subtitle="Staff Management & System Administration"
        isLoading={true}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <ModernDashboardLayout
        title="Admin Dashboard"
        subtitle="Staff Management & System Administration"
      >
        <Box sx={{ p: 4 }}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        </Box>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout
      title="Admin Dashboard"
      subtitle="Staff Management & System Administration"
      stats={statsData}
      quickActions={quickActionsData}
      recentActivity={recentActivityData}
    >
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Staff Management Section */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlassmorphismCard
              title="Staff Management"
              subtitle="Manage staff members and their permissions"
              icon={PeopleIcon}
              color="primary"
              size="large"
              sx={{ height: '100%' }}
            >
              <Box sx={{ mt: 3 }}>
                {/* Search and Filter */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <TextField
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      minWidth: 250,
                      '& .MuiOutlinedInput-root': {
                        background: isDark 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: isDark 
                          ? '1px solid rgba(255, 255, 255, 0.1)' 
                          : '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: 2,
                      }
                    }}
                  />
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Filter by Role</InputLabel>
                    <Select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      label="Filter by Role"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          background: isDark 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(0, 0, 0, 0.05)',
                          backdropFilter: 'blur(10px)',
                          border: isDark 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid rgba(0, 0, 0, 0.1)',
                          borderRadius: 2,
                        }
                      }}
                    >
                      <MenuItem value="">All Roles</MenuItem>
                      <MenuItem value="Teacher">Teacher</MenuItem>
                      <MenuItem value="HOD">HOD</MenuItem>
                      <MenuItem value="Librarian">Librarian</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Staff Table */}
                <Box
                  sx={{
                    background: isDark 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.02)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: isDark 
                      ? '1px solid rgba(255, 255, 255, 0.1)' 
                      : '1px solid rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                          Staff Member
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                          Role
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                          Last Active
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {staffMembers.map((staff) => (
                        <TableRow key={staff.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                                  width: 40,
                                  height: 40
                                }}
                              >
                                {staff.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {staff.name}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                  {staff.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={staff.role}
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                                color: '#ffffff',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={staff.status}
                              size="small"
                              color={staff.status === 'Active' ? 'success' : 'warning'}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                              {staff.lastActive}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => toast.info(`View ${staff.name}`)}
                                  sx={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: '#3b82f6',
                                    '&:hover': {
                                      background: 'rgba(59, 130, 246, 0.2)',
                                    }
                                  }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => toast.info(`Edit ${staff.name}`)}
                                  sx={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    color: '#10b981',
                                    '&:hover': {
                                      background: 'rgba(16, 185, 129, 0.2)',
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => toast.info(`Delete ${staff.name}`)}
                                  sx={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    '&:hover': {
                                      background: 'rgba(239, 68, 68, 0.2)',
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </GlassmorphismCard>
          </motion.div>
        </Grid>

        {/* System Status Section */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <GlassmorphismCard
              title="System Status"
              subtitle="Real-time system monitoring"
              icon={AssessmentIcon}
              color="info"
              size="large"
              sx={{ height: '100%' }}
            >
              <Box sx={{ mt: 3 }}>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#10b981' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Database Connection"
                      secondary="Connected and stable"
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Chip label="OK" color="success" size="small" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#10b981' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="API Services"
                      secondary="All endpoints responding"
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Chip label="OK" color="success" size="small" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <WarningIcon sx={{ color: '#f59e0b' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Storage Usage"
                      secondary="75% of capacity used"
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Chip label="WARN" color="warning" size="small" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#10b981' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Security Status"
                      secondary="All systems secure"
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <Chip label="OK" color="success" size="small" />
                  </ListItem>
                </List>
              </Box>
            </GlassmorphismCard>
          </motion.div>
        </Grid>
      </Grid>
    </ModernDashboardLayout>
  );
};

export default ModernAdminDashboard;
